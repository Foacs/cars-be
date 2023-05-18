import {createCar} from '../../lib/repository/CarRepository.mjs';

export const handler = async (event) => {
  const requestBody = JSON.parse(event.body);

  try {
    const {item, ETag} = await createCar(requestBody);
    return {
      statusCode: 201,
      body: item,
      headers: {
        'Content-Type': 'application/json',
        ETag,
      },
    };
  } catch (err) {
    return err;
  }
};
