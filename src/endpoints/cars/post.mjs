import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, PutCommand} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = 'cars';

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;

  const headers = {
    'Content-Type': 'application/json',
  };

  console.log('event:', event);
  const requestBody = JSON.parse(event.body);

  try {
    body = await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          registration: requestBody.registration,
          userId: event.requestContext.authorizer.claims.sub,
          serialNumber: requestBody.serialNumber,
          owner: requestBody.owner,
          brand: requestBody.brand,
          model: requestBody.model,
          motorization: requestBody.motorization,
          engineCode: requestBody.engineCode,
          releaseDate: requestBody.releaseDate,
          comments: requestBody.comments,
        },
      }),
    );

    body = `Post item ${requestBody.registration}`;
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
