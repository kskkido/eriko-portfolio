import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

type Props = cdk.StackProps & {
  context: {
    stage: string;
    rootFilePath: string;
    s3BucketName: string;
    sourceFilePath: string;
    targetFilePath: string;
  };
};

export class WebApplicationStack extends cdk.Stack {
  readonly bucket: s3.IBucket;
  readonly cdn: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: [
        props.context.s3BucketName,
        props.context.stage,
        this.account,
        this.region,
      ].join('-'),
    });
    const cdnOai = new cloudfront.OriginAccessIdentity(this, `WebCdnOai`, {});
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        effect: iam.Effect.ALLOW,
        principals: [
          new iam.CanonicalUserPrincipal(
            cdnOai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        resources: [`${this.bucket.bucketArn}/*`],
      })
    );
    const router = new cloudfront.experimental.EdgeFunction(
      this,
      'WebCdnRouter',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(`
          exports.handler = (event, context, callback) => {
            const request = event.Records[0]?.cf?.request
            if (!request) {
              throw new Error('missing request');
            }
            console.log('Received request')
            console.log(request)
            const uri = request.uri;
            if (uri === '' || uri === '/') {
              request.uri = '/en/index.html';
            } else if (uri.endsWith('/')) {
              request.uri += 'index.html';
            } else if (!uri.includes('.')) {
              request.uri += '/index.html';
            }
            callback(null, request);
          }
      `),
      }
    );
    this.cdn = new cloudfront.Distribution(this, 'WebCdn', {
      enabled: true,
      defaultRootObject: '',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(this.bucket, {
          originAccessIdentity: cdnOai,
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: [
          {
            functionVersion: router.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
      },
    });
    new s3Deployment.BucketDeployment(this, `WebBucketDeployment`, {
      distribution: this.cdn,
      distributionPaths: ['/*'],
      destinationKeyPrefix: props.context.targetFilePath,
      destinationBucket: this.bucket,
      sources: [
        s3Deployment.Source.asset(
          path.join(props.context.rootFilePath, props.context.sourceFilePath)
        ),
      ],
    });
    new cdk.CfnOutput(this, 'WebCdnUrl', {
      value: `https://${this.cdn.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'WebCdnDomainName', {
      value: this.cdn.distributionDomainName,
    });
  }
}
