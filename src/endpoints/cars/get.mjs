import {findAllCars} from '../../lib/repository/CarRepository.mjs';

export const handler = async (event) => {
  const page = event.queryStringParameters.page;
  const size = event.queryStringParameters.size;

  // Validation
  if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Page number and/or page size should be a positive integer',
      }),
    };
  }

  try {
    const body = await findAllCars(page, size);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
  } catch (err) {
    return err;
  }
};
