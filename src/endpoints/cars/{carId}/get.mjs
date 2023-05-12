import {
  DynamoDBClient,
  DynamoDBServiceException,
  GetItemCommand,
  InvalidEndpointException,
} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const TableName = 'cars';

export const handler = async (event) => {
  let body;
  let statusCode = 200;

  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const dynamoResponse = await client.send(
      new GetItemCommand({
        TableName,
        Key: marshall({
          userId: event.requestContext.authorizer.claims.sub,
          id: event.pathParameters.carId,
        }),
      }),
    );

    if (!dynamoResponse.Item) {
      statusCode = 404;
    } else {
      body = JSON.stringify(unmarshall(dynamoResponse.Item));
    }
  } catch (err) {
    console.error(err);
    if (
      err instanceof DynamoDBServiceException ||
      err instanceof InvalidEndpointException
    ) {
      statusCode = 500;
    } else {
      statusCode = 400;
      body = err.message;
    }
  }

  return {
    statusCode,
    body,
    headers,
  };
};
