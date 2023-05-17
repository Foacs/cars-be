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
import {v4 as uuidV4} from 'uuid';
import etag from 'etag';
import {
  ExpressionAttributes,
  UpdateExpression,
} from '@aws/dynamodb-expressions';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const TableName = 'cars';

export const getCar = async (userId, id) => {
  try {
    console.log('Get car with ID ', id);
    const dynamoResponse = await client.send(
      new GetItemCommand({
        TableName,
        Key: marshall({
          userId,
          id,
        }),
      }),
    );

    if (!dynamoResponse.Item) {
      console.log('No car found for ID ', id, ' and userId ', userId);
      throw {statusCode: 404};
    }

    const item = JSON.stringify(unmarshall(dynamoResponse.Item));
    const ETag = etag(item);

    console.log('ETag ', ETag);
    return {
      item,
      ETag,
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

export const getAllCar = async (userId, page, size) => {
  try {
    console.log('Get all cars for user ', userId);

    let cars = [];
    let LastEvaluatedKey;

    do {
      const dynamoResponse = await client.send(
        new ScanCommand({
          TableName,
          Limit: size,
          ExclusiveStartKey: LastEvaluatedKey,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': {
              S: userId,
            },
          },
        }),
      );

      cars = [...cars, ...dynamoResponse.Items];
      LastEvaluatedKey = dynamoResponse.LastEvaluatedKey;
    } while (dynamoResponse.LastEvaluatedKey);

    const item = JSON.stringify(unmarshall(dynamoResponse.Item));
    const ETag = etag(item);

    console.log('ETag ', ETag);
    return {
      item,
      ETag,
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

export const getCurrentETag = async (userId, id) => {
  const {ETag} = await getCar(userId, id);
  return ETag;
};

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

export const updateCar = async (car) => {
  try {
    const expressions = {
      TableName,
      Key: marshall({
        userId: car.userId,
        id: car.id,
      }),
      ReturnValues: 'ALL_NEW',
      ...updateExpression(car),
    };
    console.log('updateExpression ', expressions);
    const dynamoResponse = await client.send(
      new UpdateItemCommand(expressions),
    );

    const item = JSON.stringify(unmarshall(dynamoResponse.Attributes));
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

export const createCar = async (userId, car) => {
  try {
    const Item = marshall({
      ...car,
      id: uuidV4(),
      userId: userId,
    });

    await client.send(
      new PutItemCommand({
        TableName,
        Item,
      }),
    );

    const item = JSON.stringify(unmarshall(Item));
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

export const deleteCar = async (userId, id) => {
  try {
    await client.send(
      new DeleteItemCommand({
        TableName: 'cars',
        Key: marshall({
          userId,
          id,
        }),
      }),
    );

    await client.send(
      new DeleteItemCommand({
        TableName: 'interventions',
        Key: marshall({
          carId: id,
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
