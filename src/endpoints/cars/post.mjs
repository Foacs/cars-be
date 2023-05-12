import {DynamoDBClient, PutItemCommand} from '@aws-sdk/client-dynamodb';
import {marshall} from '@aws-sdk/util-dynamodb';
import {v4 as uuidV4} from 'uuid';
import etag from 'etag';

const client = new DynamoDBClient({region: process.env.AWS_REGION});
const TableName = 'cars';

export const handler = async (event) => {
  const requestBody = JSON.parse(event.body);

  const item = {
    userId: event.requestContext.authorizer.claims.sub,
    id: uuidV4(),
    registration: requestBody.registration,
    serialNumber: requestBody.serialNumber,
    owner: requestBody.owner,
    brand: requestBody.brand,
    model: requestBody.model,
    motorization: requestBody.motorization,
    engineCode: requestBody.engineCode,
    releaseDate: requestBody.releaseDate,
    comments: requestBody.comments,
  };

  try {
    await client.send(
      new PutItemCommand({
        TableName,
        Item: marshall(item),
      }),
    );
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json',
      ETag: etag(JSON.stringify(item)),
    },
  };
};
