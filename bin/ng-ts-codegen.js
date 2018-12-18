#!/usr/bin/env node

/*
 * Copyright(c) 1995 - 2018 T-Systems Multimedia Solutions GmbH
 * Riesaer Str. 5, 01129 Dresden
 * All rights reserved.
 */

const argv = require('yargs').argv;
const fse = require('fs-extra');
const { exec } = require('child_process');
const { resolve } = require('path');

const JAR_NAME = 'openapi-generator-cli-3.3.4.jar';

// Usage
if (argv.help || argv.h) {
  console.log('[Usage]');
  console.log(
    'openapi-typescript-angular-generator -i <openapi-spec> -o <output-destination> [-e <java|docker>] [-m <docker-mount>]'
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

// define the actual command
let command;
let isDocker = false;
if (argv.e === 'docker') {
  const volume = argv.m || process.env.PWD;
  command = `docker run --rm -v ${volume}:/local openapitools/openapi-generator-cli`;
  isDocker = true;
} else {
  // default to java
  command = 'java -jar ' + resolve(__dirname, JAR_NAME);
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
];
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
