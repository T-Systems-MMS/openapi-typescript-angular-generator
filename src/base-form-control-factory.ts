import { ValidatorFn, ValidationErrors, FormControl, Validators } from "@angular/forms";


export class BaseFormControlFactory<T>  {
    private map: Map<keyof T, {value: any, validators: Array<ValidatorFn>}>;

    constructor(model: T, validators: {[K in keyof T]: Array<ValidatorFn>}) {
        this.map = new Map();

        for (const property in model) {
            if  (!model.hasOwnProperty(property)) {
                continue;
            }

            this.map.set(property, {
                value: model[property],
                validators: validators[property]
            })
        }
    }

    createFormControl(property: keyof T): FormControl {
        const model = this.map.get(property);
        return new FormControl(model.value, model.validators);
      }
}