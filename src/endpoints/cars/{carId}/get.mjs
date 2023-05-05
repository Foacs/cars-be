import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, GetCommand} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = 'cars';

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;

  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    body = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          registration: event.pathParameters.carId,
          userId: event.requestContext.authorizer.claims.sub,
        },
      }),
    );

    body = body.Item;
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
