import {DynamoDBClient, DeleteItemCommand} from '@aws-sdk/client-dynamodb';
import {marshall} from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({region: process.env.AWS_REGION});

export const handler = async (event) => {
  let statusCode = 204;

  try {
    await client.send(
      new DeleteItemCommand({
        TableName: 'cars',
        Key: marshall({
          userId: event.requestContext.authorizer.claims.sub,
          id: event.pathParameters.carId,
        }),
      }),
    );

    await client.send(
      new DeleteItemCommand({
        TableName: 'interventions',
        Key: marshall({
          carId: event.pathParameters.carId,
        }),
      }),
    );
  } catch (err) {
    console.error(err);
    statusCode = 500;
  }

  return {
    statusCode,
  };
};
