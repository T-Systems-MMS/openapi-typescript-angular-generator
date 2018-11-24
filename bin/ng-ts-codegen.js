#!/usr/bin/env node

const argv = require('yargs').argv;
const {exec} = require('child_process');
const {resolve} = require('path');

if (argv.help || argv.h) {
    console.log('[Usage]');
    console.log('openapi-typescript-angular-generator -i <openapi-spec> -o <output-destination> [-e <java|docker>]');
    process.exit(0);
}

const args = process.argv.slice(2);
let command;
if (argv.e === 'docker') {
    command = 'docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli';
} else {
    // default to java
    command = 'java -jar ' + resolve(__dirname, 'openapi-generator.jar');
}
command += ' generate -g=typescript-angular -t=src/mustache --additional-properties="ngVersion=7.0.0" --additional-properties="supportsES6=true"';
if (args) {
    command += ` ${args.join(' ')}`;
}

const cmd = exec(command);
cmd.stdout.pipe(process.stdout);
cmd.stderr.pipe(process.stderr);