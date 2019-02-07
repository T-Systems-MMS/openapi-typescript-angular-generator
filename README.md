# OpenAPI Angular Typescript Generator

This is a code generator to generate angular-specific typescript code from an [OpenAPI-specification](https://www.openapis.org/).

It's based on the [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) from OpenAPITools. As opposed to the OpenAPI Generator which just generates models and services, the OpenAPI Angular Typescript Generator also generates the according validators and FormControlFactories to use with Angular's Reactive Forms.

## Usage

Install it with `npm install --save openapi-typescript-angular-generator`.

### Code Generation

Run it with `npx openapi-typescript-angular-generator` and following options:

- `-i` file or URL of the openapi-specification
- `-o` output destination for the generated code
- `-e` (optional) building environment: java (default) or docker
- `-m` (optional) mount root for the docker container
- `-a` (optional) adds authorization headers when fetching the OpenAPI definitions
  remotely. Pass in a URL-encoded string of name:header with a comma
  separating multiple values
- `--additional-properties` (optional) additional properties to pass to openapi-generator

`Docker` or `Java` must be installed for the generator to work.

Pay attention to the input/output-parameter when using docker. These parameters will be used after the docker container is started and the volumne is mounted. So any path-resolution, except the input-parameter is an url, will be start from `/local`.

Proxy settings from the executed process will be applied to the openapi-generator-process.

### Usage of custom `FormGroup` and `FormControl` with `FormControl`-factories

For each model is a `FormControl`-factory generated. This factory can be used to create `FormControl`-instances:

```
// generate model
interface MyModel {
  value: string;
}
namespace MyModel {
  export enum Properties {
    value = 'value',
  }
}

// model fetch from service
this.model: MyModel = { value: 'foobar' };
this.properties = MyModel.Properties;
this.errorMap = {
  'prefix.value.required': 'Value is required',
};

// create factor to create FormControls
const factory = new MyModelFormControlFactory(model);
this.formGroup = new TypedFormGroup<MyModel>({
  value: factory.createFormControl<string>('value')
});
```

and this controls can be used in view like this:

```
<form [formGroup]="formGroup">
  <input type="text" [formControlName]="properties.value"
        [required]="formGroup.isValidatorRegistered(properties.value, 'required')" />
  <!-- only a single error hint is necessary -->
  <span class="error" *ngIf="formGroup.hasControlErrors(properties.value)">
  {{errorMap[formGroup.nextControlErrorKey(properties.value, 'prefix')]}}
  <!-- prefix.value.required is returned, if error occurs -->
  </span>
</form>
```

Only a single `span` is used to display errors for the field. Best usage is reached with `<mat-error>` tag from [material.angular.io](https://material.angular.io).

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
