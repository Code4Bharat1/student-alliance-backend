const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const wasabiEndpoint = new AWS.Endpoint(process.env.WASABI_ENDPOINT); //wasabi 

const s3 = new AWS.S3({
  endpoint: wasabiEndpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

const BUCKET = process.env.AWS_BUCKET_NAME;

const uploadFileToWasabi = async ({
  buffer,
  originalName,
  folder = '',
  mimetype = 'application/octet-stream',
  fileName = null,
}) => {
  if (!buffer || !originalName) {
    throw new Error('Missing buffer or originalName for Wasabi upload.');
  }

  const ext = path.extname(originalName || 'file');
  const finalFileName = fileName || `${uuidv4()}${ext}`;
  const wasabiKey = folder ? `${folder}/${finalFileName}` : finalFileName;

  const params = {
    Bucket: BUCKET,
    Key: wasabiKey,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  };

  await s3.putObject(params).promise();

  const fileUrl = `https://${BUCKET}.${process.env.WASABI_ENDPOINT}/${wasabiKey}`;

  return {
    fileUrl,
    fileName: finalFileName,
    wasabiKey,
  };
};

const deleteFromWasabi = async (wasabiKey) => {
  if (!wasabiKey) throw new Error('Missing wasabiKey for deletion.');

  const params = {
    Bucket: BUCKET,
    Key: wasabiKey,
  };

  await s3.deleteObject(params).promise();
};

module.exports = {
  uploadFileToWasabi,
  deleteFromWasabi,
};
