#!/usr/bin/env node
import 'source-map-support/register';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import { flow, pipe } from 'fp-ts/lib/function';
import * as IO from 'fp-ts/IO';
import * as Task from 'fp-ts/Task';
import * as ReaderTask from 'fp-ts/lib/ReaderTask';
import * as Either from 'fp-ts/Either';
import * as cdk from 'aws-cdk-lib';
import * as validation from 'src/lib/validation';
import * as types from './types';
import { WebDeploymentStack } from 'src/stacks/webDeploymentStack';

type Context = {
  rootFilePath: string;
};

const main = async () => {
  const app = new cdk.App();
  try {
    await pipe(
      ReaderTask.Do,
      ReaderTask.apS('context', ReaderTask.ask<Context>()),
      ReaderTask.apS('input', inputFromEnv),
      ReaderTask.bind('config', ({ input }) => configFromInput(input)),
      ReaderTask.map((values) => {
        new WebDeploymentStack(
          app,
          [values.config.deploymentStackName].join('-'),
          {
            env: {
              account: values.config.awsAccount,
              region: values.config.awsRegion,
            },
            context: {
              stage: values.config.stage,
              serviceName: values.config.serviceName,
              deployRoleName: values.config.deployRoleName,
              deployUserNames: [
                values.config.deployUserName,
                values.config.deployCiUserName,
              ],
            },
          }
        );
      })
    )({
      rootFilePath: path.join(__dirname, '../../..'),
    })();
    app.synth();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const inputFromEnv = pipe(
  ReaderTask.ask<Context>(),
  ReaderTask.chain((context) =>
    ReaderTask.fromIO(
      pipe(
        () =>
          types.Input.decode({
            configFilePath: process.env.CONFIG_FILE_PATH,
          }),
        IO.chain(validation.toIO),
        IO.map((input) => ({
          ...input,
          configFilePath: path.join(context.rootFilePath, input.configFilePath),
        }))
      )
    )
  )
);

const configFromInput = (input: types.Input) =>
  pipe(
    ReaderTask.ask<Context>(),
    ReaderTask.chain(() =>
      ReaderTask.fromTask(
        pipe(
          async () =>
            yaml.parse(await fs.readFile(input.configFilePath, 'utf8')),
          Task.chain(
            Task.fromIOK(
              flow(
                types.GlobalConfig.decode,
                Either.map((config) => config['web-infra']),
                validation.toIO
              )
            )
          )
        )
      )
    )
  );

main();
