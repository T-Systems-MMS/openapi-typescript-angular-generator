import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormGroup,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { TypedFormControl } from './formcontrol';

/**
 * Typed FormGroup.
 */
export class TypedFormGroup<T> extends FormGroup {
  /** @inheritdoc */
  readonly value: T;
  /** @inheritdoc */
  readonly valueChanges: Observable<T>;
  /** holds a map with control names to possible validator names */
  readonly registeredValidatorsMap: { [controlName in keyof T]: string[] };

  /** @inheritdoc */
  constructor(
    controls: { [key in keyof T]: AbstractControl },
    validatorOrOpts?: ValidatorFn | Array<ValidatorFn> | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | Array<AsyncValidatorFn> | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
    const map = {};
    Object.keys(controls).forEach(controlName => {
      const control = controls[controlName];
      if (control instanceof TypedFormControl) {
        Object.defineProperty(map, controlName, {
          get: () => {
            return control.registeredValidators;
          },
        });
      }
    });
    this.registeredValidatorsMap = map as { [key in keyof T]: string[] };
  }

  /** @inheritdoc */
  patchValue(value: Partial<T> | T, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.patchValue(value, options);
  }

  /** @inheritdoc */
  get(path: Array<Extract<keyof T, string>> | Extract<keyof T, string>): AbstractControl | null {
    return super.get(path);
  }

  /**
   * Returns group if available.
   *
   * @param path path to group
   */
  getNestedGroup<K>(path: Extract<keyof T, string>): TypedFormGroup<K> | null {
    const control = this.get(path);
    if (control instanceof TypedFormGroup) {
      return control;
    }
    return null;
  }

  /**
   * Detects if a error is present for given control name.
   *
   * @param name control name of the form group
   */
  hasControlErrors(name: Extract<keyof T, string>): boolean {
    const control = this.get(name);
    return !!(control && control.errors);
  }

  /**
   * Detects if control has validator for given control name and validator name.
   *
   * @param name control name of the form group
   * @param validatorName validator name
   */
  isValidatorRegistered(name: Extract<keyof T, string>, validatorName: string): boolean {
    return this.registeredValidatorsMap[name].some(errorKey => errorKey === validatorName);
  }

  /**
   * Returns a error key for the next error (<controlName>.<errorKey>).
   *
   * @param name control key of the form group
   * @param prefix to be prepend to the error key
   */
  nextControlErrorKey(name: Extract<keyof T, string>, prefix?: string): string {
    const control = this.get(name);
    if (control && control.errors) {
      // try client side keys first for correct order
      let error = this.registeredValidatorsMap[name].find(validatorKey => control.hasError(validatorKey));
      if (!error) {
        // fallback to all errors including custom errors set after backend calls
        error = Object.keys(control.errors).shift();
      }
      if (error) {
        return `${prefix ? `${prefix}.` : ''}${name}.${error}`;
      }
    }
    return '';
  }

  /**
   * Dispatches errors this control and to child controls using given error map.
   *
   * @param errors error map
   * @param contextPath optional context path to errors set to
   */
  dispatchErrors(errors: { [key: string]: ValidationErrors }, contextPath?: string) {
    const paths = Object.keys(errors);
    paths.forEach(path => {
      const control = this.get(<Extract<keyof T, string>>(contextPath ? `${contextPath}.${path}` : path));
      if (control) {
        control.markAsTouched();
        control.setErrors(errors[path]);
      }
    });
  }
}
