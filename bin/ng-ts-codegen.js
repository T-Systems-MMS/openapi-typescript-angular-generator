#!/usr/bin/env node

const argv = require('yargs').argv;
const {exec} = require('child_process');
const {resolve} = require('path');

// Usage
if (argv.help || argv.h) {
    console.log('[Usage]');
    console.log('openapi-typescript-angular-generator -i <openapi-spec> -o <output-destination> [-e <java|docker>]');
    process.exit(0);
}

// input and output must be defined
if (!argv.i) {
    console.error('Please provide the input file with the openapi-specification.');
    process.exit(1);
}
if (!argv.o) {
    console.error('Please define an output-destination.');
    process.exit(1);
}

// define the actual command
let command;
let isDocker = false;
if (argv.e === 'docker') {
    command = 'docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli';
    isDocker = true;
} else {
    // default to java
    command = 'java -jar ' + resolve(__dirname, 'openapi-generator.jar');
}

// join paramters to the command
const args = [
    'generate',
    `-i ${argv.i}`,
    `-o ${isDocker ? `/local/${argv.o}` : argv.o}`,
    '-g=typescript-angular',
    `-t=${isDocker ? '/local/node_modules/openapi-typescript-angular-generator/src/mustache' : resolve(__dirname, '../src/mustache')}`,
    '--additional-properties="supportsES6=true"',
    '--additional-properties="ngVersion=7.0.0"',
];
command += ` ${args.join(' ')}`;

// execute
const cmd = exec(command);
cmd.stdout.pipe(process.stdout);
cmd.stderr.pipe(process.stderr);
