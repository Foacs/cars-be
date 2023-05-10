import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';

const client = new S3Client({region: process.env.AWS_REGION});

export const handler = async (event) => {
  let username = event.requestContext.authorizer.claims.sub;
  let {carId} = event.pathParameters;
  let Key = `users/${username}/cars/${carId}/avatar`;

  let previousETag = event.headers['If-None-Match'];

  try {
    const s3Response = await client.send(
      new GetObjectCommand({
        Bucket: 'foacs-cars-data',
        IfNoneMatch: previousETag,
        Key,
      }),
    );

    const response = {
      statusCode: 200,
      headers: {
        ETag: s3Response.ETag,
        'Content-Length': s3Response.ContentLength,
        'Content-Type': s3Response.ContentType,
      },
      body: Buffer.concat(await s3Response.Body.toArray()).toString('base64'),
      isBase64Encoded: true,
    };
    return response;
  } catch (err) {
    console.error('Error: ', err);
    if (err['$metadata']?.httpStatusCode === 404) {
      return {
        statusCode: 404,
      };
    }
    return {
      statusCode: 500,
    };
  }
};
