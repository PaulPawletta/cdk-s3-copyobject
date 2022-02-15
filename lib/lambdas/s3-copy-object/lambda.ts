import * as s3 from "aws-cdk-lib/aws-s3";
import { S3CreateEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

export const handler = async (event: S3CreateEvent) => {
  const record = event.Records[0];
  console.log("copy object -> start");
  const copySource = `${S3_BUCKET_NAME}/${record.s3.object.key}`
  console.log(`Copy Source: ${copySource}`);
  const s3 = new AWS.S3();
  const result = await s3
    .copyObject({
      Bucket: `${S3_BUCKET_NAME}`,
      CopySource: `${copySource}`,
      Key: `copies/${record.s3.object.key}`,
    })
    .promise();
  console.log("copy object -> end");
};