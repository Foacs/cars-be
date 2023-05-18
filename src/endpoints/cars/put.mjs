import {
  findCurrentETag,
  updateCar,
} from '../../lib/repository/CarRepository.mjs';

export const handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  const previousETag = event.headers['If-Match'];

  // Validation
  if (!requestBody.id) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Missing required body property: id',
      }),
    };
  }

  try {
    if (previousETag) {
      const ETag = await findCurrentETag(
        event.requestContext.authorizer.claims.sub,
        requestBody.id,
      );

      if (previousETag !== ETag) {
        console.log('previous ETag ', previousETag, ' current ETag ', ETag);
        return {
          statusCode: 412,
        };
      }
    }

    console.log('Update car with ID ', requestBody.id);
    const {ETag: newETag} = await updateCar(
      event.requestContext.authorizer.claims.sub,
      requestBody,
    );

    return {
      statusCode: 204,
      headers: {
        ETag: newETag,
      },
    };
  } catch (err) {
    return err;
  }
};
