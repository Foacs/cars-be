import {DynamoDBClient, UpdateItemCommand} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const TableName = 'cars';

export const handler = async (event) => {
  let body;
  let statusCode = 200;

  const headers = {
    'Content-Type': 'application/json',
  };

  const requestBody = JSON.parse(event.body);

  try {
    body = await client.send(
      new UpdateItemCommand({
        TableName,
        Key: {
          userId: {
            S: event.requestContext.authorizer.claims.sub,
          },
          id: {
            S: requestBody.registration,
          },
        },
        UpdateExpression:
          'set serialNumber = :serialNumber, #owner = :owner, brand = :brand, ' +
          'model = :model, motorization = :motorization, engineCode = :engineCode, ' +
          'releaseDate = :releaseDate, comments = :comments',
        ExpressionAttributeValues: {
          ':serialNumber': requestBody.serialNumber,
          ':owner': requestBody.owner,
          ':brand': requestBody.brand,
          ':model': requestBody.model,
          ':motorization': requestBody.motorization,
          ':engineCode': requestBody.engineCode,
          ':releaseDate': requestBody.releaseDate,
          ':comments': requestBody.comments,
        },
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
      }),
    );

    body = `Put item ${requestBody.registration}`;
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
