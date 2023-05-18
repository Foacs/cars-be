import {findCarById} from '../../../lib/repository/CarRepository.mjs';

export const handler = async (event) => {
  const previousETag = event.headers['If-None-Match'];

  try {
    const {item, ETag} = await findCarById(
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
      headers: {
        'Content-Type': 'application/json',
        ETag,
      },
      body: item,
    };
  } catch (err) {
    return err;
  }
};
