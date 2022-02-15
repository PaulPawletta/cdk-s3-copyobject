import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as iam from "aws-cdk-lib/aws-iam";

export class CdkS3CopyObjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "inputDocuments", {
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaFunction = new lambda.Function(this, "Function", {
      code: lambda.Code.fromAsset("lib/lambdas/s3-copy-object"),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "lambda.handler",
      functionName: "BucketPutHandler",
      environment: {
        S3_BUCKET_NAME: bucket.bucketName,
      },
    });

    const policyStatement = new iam.PolicyStatement();
    policyStatement.addActions("*");
    policyStatement.addResources("*");

    lambdaFunction.role?.attachInlinePolicy(
      new iam.Policy(this, "copy-bucket-objects-policy", {
        statements: [policyStatement],
      })
    );

    const s3PutEventSource = new lambdaEventSources.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED_PUT],
    });

    lambdaFunction.addEventSource(s3PutEventSource);
  }
}
