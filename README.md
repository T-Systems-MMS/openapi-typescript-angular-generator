# OpenAPI Angular Typescript Generator

This is a code generator to generate angular-specific typescript code from an [OpenAPI-specification](https://www.openapis.org/).

It's based on the [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) from OpenAPITools. As opposed to the OpenAPI Generator which just generates models and services, the OpenAPI Angular Typescript Generator also generates the according validators and FormControlFactories to use with Angular's Reactive Forms.

## Usage

Install it with `npm install openapi-typescript-angular-generator`.

Run it with `npx openapi-typescript-angular-generator` and following options:

- `-i` file or URL of the openapi-specification
- `-o` output destination for the generated code
- `-e` (optional) building environment: java (default) or docker
- `-m` (optional) mount root for the docker container

`Docker` or `Java` must be installed for the generator to work.

Pay attention to the input/output-parameter when using docker. These parameters will be used after the docker container is started and the volumne is mounted. So any path-resolution will be start from `/local`.

## License

Copyright 2018 T-Systems Multimedia Solutions GmbH (https://www.t-systems-mms.com/)<br>
Copyright 2018 OpenAPI-Generator Contributors (https://openapi-generator.tech)<br>
Copyright 2018 SmartBear Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
