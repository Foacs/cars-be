import {getCar} from '../../../lib/repository/CarRepository.mjs';

export const handler = async (event) => {
  const previousETag = event.headers['If-None-Match'];

  try {
    const {item, ETag} = await getCar(
      event.requestContext.authorizer.claims.sub,
      event.pathParameters.carId,
    );

    if (previousETag && previousETag === ETag) {
      return {
        statusCode: 304,
      };
    }

    return {
      statusCode: 200,
      body: item,
      headers: {
        'Content-Type': 'application/json',
        Test: '200-A',
        ETag,
      },
    };
  } catch (err) {
    return err;
  }
};
