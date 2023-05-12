import {
  S3Client,
  GetObjectAttributesCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const client = new S3Client({region: process.env.AWS_REGION});

const allowedTypes = ['image/jpeg', 'image/png'];

const checkETag = async (Key, previousETag) => {
  console.log('Check previous ETag');
  const attributes = await client.send(
    new GetObjectAttributesCommand({
      Bucket: 'foacs-cars-data',
      Key,
    }),
  );

  return attributes.ETag !== previousETag;
};

export const handler = async (event) => {
  // Checks Content-Type
  let contentType = event.headers['Content-Type'];

  if (!allowedTypes.includes(contentType)) {
    console.log(`Forbidden file type ${contentType}`);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Type ${contentType} is not supported`,
      }),
    };
  }

  let username = event.requestContext.authorizer.claims.sub;
  let {carId} = event.pathParameters;
  let Key = `users/${username}/cars/${carId}/avatar`;
  let previousETag = event.headers['If-Match'];

  try {
    if (previousETag) {
      const eTagChanged = await checkETag(Key, previousETag);
      if (eTagChanged) {
        return {
          statusCode: 412,
        };
      }
    }

    let encodedImage = event.body;
    let decodedImage = event.isBase64Encoded
      ? Buffer.from(encodedImage, 'base64')
      : encodedImage;

    console.log('Uploading ', Key);
    const s3Response = await client.send(
      new PutObjectCommand({
        Body: decodedImage,
        Bucket: 'foacs-cars-data',
        Key,
        ContentType: contentType,
      }),
    );

    return {
      statusCode: 204,
      headers: {
        ETag: s3Response.ETag,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
    };
  }
};
