# OpenAPI Angular Typescript Generator

This is a code generator to generate angular-specific typescript code from an [OpenAPI-specification](https://www.openapis.org/).

It's based on the [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) from OpenAPITools. As opposed to the OpenAPI Generator which just generates models and services, the OpenAPI Angular Typescript Generator also generates the according validators and FormControlFactories to use with Angular's Reactive Forms.

## Usage

Install it with `npm install openapi-typescript-angular-generator`.

Run it with `npx openapi-typescript-angular-generator` and following options:
* `-i` file or URL of the openapi-specification
* `-o` output destination for the generated code
* `-e` (optional) building environment: java (default) or docker

`Docker` or `Java` must be installed for the generator to work.
