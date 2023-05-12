import {S3Client, DeleteObjectCommand} from '@aws-sdk/client-s3';

const client = new S3Client({region: process.env.AWS_REGION});

export const handler = async (event) => {
  let username = event.requestContext.authorizer.claims.sub;
  let {carId} = event.pathParameters;

  let Key = `users/${username}/cars/${carId}/avatar`;

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: 'foacs-cars-data',
        Key,
      }),
    );

    return {
      statusCode: 204,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
    };
  }
};
