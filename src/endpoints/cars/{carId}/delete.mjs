import {deleteCar} from '../../../lib/repository/CarRepository.mjs';

export const handler = async (event) => {
  try {
    deleteCar(
      event.requestContext.authorizer.claims.sub,
      event.pathParameters.carId,
    );
    return {
      statusCode: 204,
    };
  } catch (err) {
    return err;
  }
};
