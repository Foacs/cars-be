import {
  DynamoDBClient,
  UpdateItemCommand,
  DynamoDBServiceException,
  GetItemCommand,
  InvalidEndpointException,
  DeleteItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import etag from 'etag';
import {
  ExpressionAttributes,
  UpdateExpression,
} from '@aws/dynamodb-expressions';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const TableName = 'cars';

/**
 * Transforms a car from dynamoDB results (removes PK and SK).
 *
 * @param {Car} car the car to transform
 * @returns the transformed car
 */
const transformCar = (car) => {
  car.id = car.PK.split('#')[1];
  delete car.PK;
  delete car.SK;
  return car;
};

/**
 * Finds a car from its ID.
 *
 * @param {String} id the car ID
 * @returns the found car
 */
export const findCarById = async (id) => {
  let dynamoResponse;
  try {
    console.log('Get car with ID ', id);
    dynamoResponse = await client.send(
      new GetItemCommand({
        TableName,
        Key: marshall({
          PK: `CAR#${id}`,
          SK: `#METADATA#${id}`,
        }),
      }),
    );
  } catch (err) {
    console.error(err);
    if (
      err instanceof DynamoDBServiceException ||
      err instanceof InvalidEndpointException
    ) {
      throw {statusCode: 500};
    }
    throw {statusCode: 400, body: err.message};
  }

  if (!dynamoResponse || !dynamoResponse.Item) {
    console.log('No car found for ID ', id);
    throw {statusCode: 404};
  }

  const item = JSON.stringify(transformCar(unmarshall(dynamoResponse.Item)));
  const ETag = etag(item);

  return {
    item,
    ETag,
  };
};

/**
 * Finds all cars.
 *
 * @param {int} page page number
 * @param {int} size page size
 * @returns the found cars
 */
export const findAllCars = async (page, size) => {
  try {
    let cars = [];
    let LastEvaluatedKey;
    let total = 0;
    let dynamoResponse;
    do {
      dynamoResponse = await client.send(
        new ScanCommand({
          TableName,
          ExclusiveStartKey: LastEvaluatedKey,
          FilterExpression: 'begins_with(SK, :sk)',
          ExpressionAttributeValues: {
            ':sk': {S: '#METADATA#'},
          },
        }),
      );

      cars = [...cars, ...dynamoResponse.Items];
      LastEvaluatedKey = dynamoResponse.LastEvaluatedKey;
      total += dynamoResponse.Count;
    } while (dynamoResponse.LastEvaluatedKey);

    const offset = (page - 1) * size;
    const pages = Math.ceil(total / size);

    return {
      page,
      pages,
      size,
      total,
      cars: cars
        .slice(offset, offset + size)
        .map((item) => transformCar(unmarshall(item))),
    };
  } catch (err) {
    console.error(err);
    if (
      err instanceof DynamoDBServiceException ||
      err instanceof InvalidEndpointException
    ) {
      throw {statusCode: 500};
    }
    throw {statusCode: 400, body: err.message};
  }
};

/**
 * Finds the current car's ETag from the car's ID.
 *
 * @param {String} id the car ID
 * @returns the car's ETag
 */
export const findCurrentETag = async (id) => {
  const {ETag} = await getCar(id);
  return ETag;
};

/**
 * Gets update expression to update a car.
 *
 * @param {Car} car the car to update
 * @returns the update expression
 */
const updateExpression = (car) => {
  let attributes = new ExpressionAttributes();
  let expression = new UpdateExpression();

  expression.set('registration', car.registration);
  expression.set('serialNumber', car.serialNumber);
  expression.set('owner', car.owner);
  expression.set('brand', car.brand);
  expression.set('model', car.model);
  expression.set('motorization', car.motorization);
  expression.set('engineCode', car.engineCode);
  expression.set('comments', car.comments);
  // TODO check expression.set('pictures', car.pictures);

  return {
    UpdateExpression: expression.serialize(attributes),
    ExpressionAttributeNames: attributes.names,
    ExpressionAttributeValues: attributes.values,
  };
};

/**
 * Updates a car.
 *
 * @param {Car} car the car to update
 * @returns the updated car
 */
export const updateCar = async (car) => {
  try {
    const expressions = {
      TableName,
      Key: marshall({
        PK: `CAR#${car.id}`,
        SK: `#METADATA#${car.id}`,
      }),
      ReturnValues: 'ALL_NEW',
      ...updateExpression(car),
    };
    const dynamoResponse = await client.send(
      new UpdateItemCommand(expressions),
    );

    const item = JSON.stringify(
      transformCar(unmarshall(dynamoResponse.Attributes)),
    );
    const ETag = etag(item);

    return {
      item,
      ETag,
    };
  } catch (err) {
    console.error(err);
    throw {
      statusCode: 500,
    };
  }
};

/**
 * Creates a car.
 *
 * @param {Car} car the car to create
 * @returns the created car
 */
export const createCar = async (car) => {
  try {
    const id = Date.now();
    const Item = marshall({
      ...car,
      PK: `CAR#${id}`,
      SK: `#METADATA#${id}`,
    });

    await client.send(
      new PutItemCommand({
        TableName,
        Item,
      }),
    );

    const item = JSON.stringify(transformCar(unmarshall(Item)));
    const ETag = etag(item);

    return {
      item,
      ETag,
    };
  } catch (err) {
    console.error(err);
    throw {
      statusCode: 500,
    };
  }
};

/**
 * Deletes a car.
 *
 * @param {String} id the car's ID
 */
export const deleteCar = async (id) => {
  try {
    await client.send(
      new DeleteItemCommand({
        TableName: 'cars',
        Key: marshall({
          PK: `CAR#${id}`,
        }),
      }),
    );
  } catch (err) {
    console.error(err);
    throw {
      statusCode: 500,
    };
  }
};
