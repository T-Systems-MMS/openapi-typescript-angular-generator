#!/usr/bin/env node

/*
 * Copyright(c) 1995 - 2018 T-Systems Multimedia Solutions GmbH
 * Riesaer Str. 5, 01129 Dresden
 * All rights reserved.
 */

const argv = require('yargs').argv;
const fse = require('fs-extra');
const {
  exec
} = require('child_process');
const {
  resolve
} = require('path');
const url = require('url');

const openApiVersion = '3.3.4';
const jarFileName = `openapi-generator-cli-${openApiVersion}.jar`;
const dockerImageName = `openapitools/openapi-generator-cli:v${openApiVersion}`;

// Usage
if (argv.help || argv.h) {
  console.log('[Usage]');
  console.log(
    'openapi-typescript-angular-generator -i <openapi-spec> -o <output-destination> [-e <java|docker>] [-m <docker-mount>] [-a <authorization>]'
  );
  process.exit(0);
}

// input and output must be defined
if (!argv.i) {
  console.log('Please provide openapi-file: -i <location>');
  process.exit(1);
}

if (!argv.o) {
  console.log('Please provide output-directory: -o <location>');
  process.exit(1);
}

let proxyArgs = '';
if (process.env.HTTP_PROXY) {
  const parsedUrl = url.parse(process.env.HTTP_PROXY);
  proxyArgs = proxyArgs.concat(` -Dhttp.proxyHost=${parsedUrl.hostname} -Dhttp.proxyPort=${parsedUrl.port}`);
}
if (process.env.HTTPS_PROXY) {
  const parsedUrl = url.parse(process.env.HTTPS_PROXY);
  proxyArgs = proxyArgs.concat(` -Dhttps.proxyHost=${parsedUrl.hostname} -Dhttps.proxyPort=${parsedUrl.port}`);
}
if (process.env.NO_PROXY) {
  proxyArgs = proxyArgs.concat(` -Dhttp.nonProxyHosts="${process.env.NO_PROXY.split(',').join('|')}" -Dhttps.nonProxyHosts="${process.env.NO_PROXY.split(',').join('|')}"`);
}

// define the actual command
let command;
let isDocker = false;
if (argv.e === 'docker') {
  const volume = argv.m || process.env.PWD;
  command = `docker run --rm -v ${volume}:/local ${dockerImageName}`;
  isDocker = true;
} else {
  // default to java
  command = `java${proxyArgs} -jar ${resolve(__dirname, jarFileName)}`;
}

// join parameters to the command
const args = [
  'generate',
  `-i ${isDocker ? `/local/${argv.i}` : argv.i}`,
  `-o ${isDocker ? `/local/${argv.o}` : argv.o}`,
  '-g=typescript-angular',
  `-t=${
    isDocker
      ? '/local/node_modules/openapi-typescript-angular-generator/src/mustache'
      : resolve(__dirname, '../src/mustache')
  }`,
  '--additional-properties="supportsES6=true"',
  '--additional-properties="ngVersion=7.0.0"',
  '--additional-properties="modelPropertyNaming=original"',
];

// add auth headers
if (argv.a) {
  args.push(`-a ${argv.a}`);
}

// build command
command += ` ${args.join(' ')}`;

// execute
console.log('Executing following command to generate the code:\n', command);
const cmd = exec(command, () => {
  // copy base-form-control-factory
  const src = resolve(__dirname, '../src/base-form-control-factory.ts');
  const dst = resolve(process.cwd(), argv.o, 'model/base-form-control-factory.ts');
  fse.copy(src, dst).catch(err => console.log(err));

  // clean up
  const files = ['.openapi-generator', '.gitignore', '.openapi-generator-ignore', 'git_push.sh', 'README.md'];
  files.forEach(f => fse.remove(resolve(process.cwd(), argv.o, f)));
});
cmd.stdout.pipe(process.stdout);
cmd.stderr.pipe(process.stderr);
