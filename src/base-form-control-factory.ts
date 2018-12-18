/*
 * Copyright(c) 1995 - 2018 T-Systems Multimedia Solutions GmbH
 * Riesaer Str. 5, 01129 Dresden
 * All rights reserved.
 */
import { ValidatorFn, FormControl, AsyncValidatorFn } from '@angular/forms';

/**
 * This is the base from control factory for each model. Based on this class, each model is implementing it's own
 * FormControlFactory.
 * Main purpose of this factory is to provide an easy way of creating form-controls with the correct validators.
 * The factory also ensures that model and validator match one another.
 */
export class BaseFormControlFactory<T> {
  private map: Map<keyof T, { value: any; validators: Array<ValidatorFn> }>;

  /**
   * Constructor.
   *
   * @param model The model object.
   *
   * @param validators An array of validators.
   */
  constructor(model: T, validators: { [K in keyof T]?: Array<ValidatorFn> }) {
    this.map = new Map();

    for (const property in model) {
      if (!model.hasOwnProperty(property)) {
        continue;
      }

      this.map.set(property, {
        value: model[property],
        validators: validators[property] ? validators[property] : [],
      });
    }
  }

  /**
   * Creates a new `FormControl` instance.
   *
   * @param property the property of the model for which the `FormControl` should be created.
   *
   * @param asyncValidator A single async validator or array of async validator functions.
   */
  createFormControl(property: keyof T, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl {
    const model = this.map.get(property);
    return new FormControl(model.value, model.validators, asyncValidator);
  }
}
