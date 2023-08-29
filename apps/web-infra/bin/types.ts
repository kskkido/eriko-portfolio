import * as t from 'io-ts';

export const Input = t.type({
  configFilePath: t.string,
});

export type Input = t.TypeOf<typeof Input>;

export const Config = t.type({
  stage: t.string,
  awsRegion: t.string,
  awsAccount: t.string,
  applicationStackName: t.string,
  deploymentStackName: t.string,
  deployRoleName: t.string,
  deployUserName: t.string,
  deployCiUserName: t.string,
  serviceName: t.string,
  s3BucketName: t.string,
  sourceFilePath: t.string,
  targetFilePath: t.string,
});

export type Config = t.TypeOf<typeof Config>;

export const GlobalConfig = t.type({
  'web-infra': Config,
});

export type GlobalConfig = t.TypeOf<typeof GlobalConfig>;
