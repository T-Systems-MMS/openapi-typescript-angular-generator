import { FormControl, ValidatorFn, AsyncValidatorFn, FormControlStatus, FormControlState } from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * Validator options to have mapping key -> validator function.
 */
export interface ValidatorOptions {
  /** mapping error key -> validator function */
  validators: [string, ValidatorFn][];
  /** mapping error key -> validator function */
  asyncValidators?: [string, AsyncValidatorFn][];
}

/**
 * Simplified options interface.
 */
export interface TypedControlOptions extends ValidatorOptions {
  /** updateOn */
  updateOn?: 'change' | 'blur' | 'submit';
}

/** @inheritdoc */
export class TypedFormControl<T = any> extends FormControl {
  /** @inheritdoc */
  readonly value: T;
  /** @inheritdoc */
  readonly valueChanges: Observable<T>;
  /** @inheritdoc */
  readonly statusChanges: Observable<FormControlStatus>;
  /** holds all possible validator names extracted by the given validators */
  readonly registeredValidators: string[];

  /** @inheritdoc */
  constructor(formState?: FormControlState<T> | T, opts?: TypedControlOptions) {
    super(formState, {
      validators: opts ? opts.validators.map(validator => validator && validator[1]) : null,
      asyncValidators:
        opts && opts.asyncValidators ? opts.asyncValidators.map(validator => validator && validator[1]) : null,
      updateOn: opts && opts.updateOn ? opts.updateOn : 'change',
    });

    this.registeredValidators = this.generateValidatorNames(opts);
  }

  /** @inheritdoc */
  patchValue(
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) {
    super.patchValue(value, options);
  }

  /** @inheritdoc */
  setValue(
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) {
    super.setValue(value, options);
  }

  /** @inheritdoc */
  reset(
    formState?: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    super.reset(formState, options);
  }

  /**
   * Sets new validators and updates possible error keys list.
   *
   * @param newValidators new validators
   */
  setNewValidators(newValidators: ValidatorOptions) {
    super.setValidators(newValidators ? newValidators.validators.map(validator => validator && validator[1]) : null);
    super.setAsyncValidators(
      newValidators && newValidators.asyncValidators
        ? newValidators.asyncValidators.map(validator => validator && validator[1])
        : null
    );
    (this as { registeredValidators: any }).registeredValidators = this.generateValidatorNames(newValidators);
  }

  /**
   * Generates validator name list.
   *
   * @param validatorOpts options to handle
   */
  private generateValidatorNames(validatorOpts: ValidatorOptions | undefined) {
    let keys: string[] = [];
    if (validatorOpts) {
      let validatorsList = [validatorOpts.validators];
      if (validatorOpts.asyncValidators) {
        validatorsList.push(validatorOpts.asyncValidators);
      }
      validatorsList.forEach((validators: [string, ValidatorFn | AsyncValidatorFn][]) => {
        keys.push(
          ...validators
            .map(validator => validator && validator[0])
            // filter duplicates
            .filter((key, index, array) => array.indexOf(key) === index)
        );
      });
    }
    return keys;
  }
}
