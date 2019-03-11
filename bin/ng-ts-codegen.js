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
const url = require('url');

const openApiVersion = '3.3.4';
const jarFileName = `openapi-generator-cli-${openApiVersion}.jar`;
const dockerImageName = `openapitools/openapi-generator-cli:v${openApiVersion}`;

/**
 * Converts proxy settings into java runtime parameters.
 */
function getProxyArgsForJava() {
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
    const noProxyValue = process.env.NO_PROXY.split(',').join('|');
    proxyArgs = proxyArgs.concat(` -Dhttp.nonProxyHosts="${noProxyValue}" -Dhttps.nonProxyHosts="${noProxyValue}"`);
  }

  return proxyArgs;
}

/**
 * Converts proxy settings into docker run parameters.
 */
function getProxyArgsForDocker() {
  let proxyArgs = '';
  if (process.env.HTTP_PROXY) {
    proxyArgs = proxyArgs.concat(` --env HTTP_PROXY="${process.env.HTTP_PROXY}"`);
  }
  if (process.env.HTTPS_PROXY) {
    proxyArgs = proxyArgs.concat(` --env HTTPS_PROXY="${process.env.HTTPS_PROXY}"`);
  }
  if (process.env.NO_PROXY) {
    proxyArgs = proxyArgs.concat(` --env NO_PROXY="${process.env.NO_PROXY}"`);
  }

  return proxyArgs;
}

/**
 * Adds the new given additional property to the given map of additional properties.
 * @param {Object} additionalProperties map of additional properties
 * @param {string} arg additional property to add
 */
function addAdditionalProperty(additionalProperties, arg) {
  if (typeof arg !== 'string') {
    return;
  }
  const addArg = arg.split('=', 2);
  additionalProperties[addArg[0]] = addArg[1];
}

// Usage
if (argv.help || argv.h) {
  console.log('[Usage]');
  console.log(
    'openapi-typescript-angular-generator -i <openapi-spec> -o <output-destination> [-e <java|docker>] [-m <docker-mount>] [-a <authorization>] [--additional-properties <additional properties>...]'
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
  const proxyArgs = getProxyArgsForDocker();
  const volume = argv.m || process.env.PWD;
  command = `docker run${proxyArgs} --rm -v ${volume}:/local ${dockerImageName}`;
  isDocker = true;
} else {
  // default to java
  const proxyArgs = getProxyArgsForJava();
  command = `java${proxyArgs} -jar ${resolve(__dirname, jarFileName)}`;
}

// join parameters to the command
const isUrlInput = argv.i.startsWith('http://') || argv.i.startsWith('https://');
const args = [
  'generate',
  `-i ${isDocker && !isUrlInput ? `/local/${argv.i}` : argv.i}`,
  `-o ${isDocker ? `/local/${argv.o}` : argv.o}`,
  '-g=typescript-angular',
  `-t=${
    isDocker
      ? '/local/node_modules/openapi-typescript-angular-generator/src/mustache'
      : resolve(__dirname, '../src/mustache')
  }`,
];

// add auth headers
if (argv.a) {
  args.push(`-a ${argv.a}`);
}

// additional properties
const additionalProperties = {
  supportsES6: 'true',
  ngVersion: '7.0.0',
  modelPropertyNaming: 'original',
};
if (argv['additional-properties']) {
  if (Array.isArray(argv['additional-properties'])) {
    argv['additional-properties'].forEach(arg => {
      addAdditionalProperty(additionalProperties, arg);
    });
  } else {
    addAdditionalProperty(additionalProperties, argv['additional-properties']);
  }
}
for (const key in additionalProperties) {
  if (additionalProperties.hasOwnProperty(key)) {
    const element = additionalProperties[key];
    args.push(`--additional-properties="${key}=${element}"`);
  }
}

// build command
command += ` ${args.join(' ')}`;

// execute
console.log('Executing following command to generate the code:\n', command);
const cmd = exec(command, () => {
  // clean up
  const files = ['.openapi-generator', '.gitignore', '.openapi-generator-ignore', 'git_push.sh', 'README.md'];
  files.forEach(f => fse.remove(resolve(process.cwd(), argv.o, f)));
});
cmd.stdout.pipe(process.stdout);
cmd.stderr.pipe(process.stderr);
