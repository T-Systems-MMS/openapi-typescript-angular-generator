/*
 * Copyright(c) 1995 - 2018 T-Systems Multimedia Solutions GmbH
 * Riesaer Str. 5, 01129 Dresden
 * All rights reserved.
 */
import { ValidatorFn } from '@angular/forms';
import { TypedFormControl, TypedControlOptions } from './formcontrol';

/**
 * This is the base from control factory for each model. Based on this class, each model is implementing it's own
 * FormControlFactory.
 * Main purpose of this factory is to provide an easy way of creating form-controls with the correct validators.
 * The factory also ensures that model and validator match one another.
 */
export class BaseFormControlFactory<T> {
  private map: Map<keyof T, { value: any; validators: [string, ValidatorFn][] }>;

  /**
   * Constructor.
   *
   * @param model The model object.
   *
   * @param validators An array of validators.
   */
  constructor(model: T, validators: { [K in keyof T]: [string, ValidatorFn][] }) {
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
   * Creates a new `TypedFormControl` instance.
   *
   * @param property the property of the model for which the `TypedFormControl` should be created.
   * @param controlOpts add custom validators to the default ones given in the constructor.
   */
  createFormControl<K>(property: keyof T, controlOpts?: TypedControlOptions): TypedFormControl<K> {
    const model = this.map.get(property);
    if (model) {
      return new TypedFormControl(model.value, {
        validators: [...model.validators, ...(controlOpts ? controlOpts.validators : [])],
        asyncValidators: controlOpts ? controlOpts.asyncValidators : undefined,
        updateOn: controlOpts ? controlOpts.updateOn : undefined,
      });
    }
    return new TypedFormControl();
  }
}
