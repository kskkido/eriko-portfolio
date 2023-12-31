import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

type Props = cdk.StackProps & {
  context: {
    stage: string;
    serviceName: string;
    deployRoleName: string;
    deployUserNames: string[];
  };
};

export class WebDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    new iam.Role(this, 'DeployRole', {
      roleName: props.context.deployRoleName,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('cloudformation.amazonaws.com'),
        ...props.context.deployUserNames.map(
          (username) =>
            new iam.ArnPrincipal(
              `arn:aws:iam::${this.account}:user/${username}`
            )
        )
      ),
      inlinePolicies: {
        DeployBucket: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListAllMyBuckets', 's3:ListBucket'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:Get*',
                's3:List*',
                's3:HeadBucket',
                's3:CreateBucket',
                's3:DeleteBucket',
                's3:PutBucketPolicy',
                's3:DeleteBucketPolicy',
                's3:PutObject',
                's3:DeleteObject',
                's3:GetAccelerateConfiguration',
                's3:PutAccelerateConfiguration',
                's3:PutEncryptionConfiguration',
              ],
              resources: [`arn:aws:s3:::*`],
            }),
          ],
        }),
        DeployCloudFormation: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['cloudformation:ValidateTemplate'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'cloudformation:Get*',
                'cloudformation:List*',
                'cloudformation:Describe*',
                'cloudformation:CreateChangeSet',
                'cloudformation:CreateStack',
                'cloudformation:CreateUploadBucket',
                'cloudformation:DeleteChangeSet',
                'cloudformation:DeleteStack',
                'cloudformation:ExecuteChangeSet',
                'cloudformation:SetStackPolicy',
                'cloudformation:UpdateStack',
                'cloudformation:UpdateTerminationProtection',
              ],
              resources: [`arn:aws:cloudformation:*:${this.account}:stack/*`],
            }),
          ],
        }),
        DeployCloudFront: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'cloudfront:Get*',
                'cloudfront:List*',
                'cloudfront:CreateDistribution',
                'cloudfront:UpdateDistribution',
                'cloudfront:DeleteDistribution',
                'cloudfront:TagResource',
                'cloudfront:UntagResource',
              ],
              resources: [`arn:aws:cloudfront::${this.account}:*/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'cloudfront:CreateCloudFrontOriginAccessIdentity',
                'cloudfront:UpdateCloudFrontOriginAccessIdentity',
                'cloudfront:GetCloudFrontOriginAccessIdentity',
                'cloudfront:GetCloudFrontOriginAccessIdentityConfig',
                'cloudfront:DeleteCloudFrontOriginAccessIdentity',
                'cloudfront:ListCloudFrontOriginAccessIdentities',
              ],
              resources: ['*'],
            }),
          ],
        }),
        DeploySsm: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['ssm:Get*'],
              resources: [`arn:aws:ssm:*:${this.account}:parameter/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['kms:*'],
              resources: [`arn:aws:kms:*:${this.account}:*`],
            }),
          ],
        }),
        DeployIam: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['iam:PassRole'],
              resources: [`arn:aws:iam::${this.account}:role/cdk*`],
            }),
          ],
        }),
      },
    });
  }
}
