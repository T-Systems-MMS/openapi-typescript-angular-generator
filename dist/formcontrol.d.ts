import { FormControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
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
export declare class TypedFormControl<T> extends FormControl {
    /** @inheritdoc */
    readonly value: T;
    /** @inheritdoc */
    readonly valueChanges: Observable<T>;
    /** @inheritdoc */
    readonly statusChanges: Observable<T>;
    /** holds all possible validator names extracted by the given validators */
    readonly registeredValidators: string[];
    /** @inheritdoc */
    constructor(formState?: T, opts?: TypedControlOptions);
    /** @inheritdoc */
    patchValue(value: T, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void;
    /** @inheritdoc */
    setValue(value: T, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void;
    /** @inheritdoc */
    reset(formState?: T, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * Sets new validators and updates possible error keys list.
     *
     * @param newValidators new validators
     */
    setNewValidators(newValidators: ValidatorOptions): void;
    /**
     * Generates validator name list.
     *
     * @param validatorOpts options to handle
     */
    private generateValidatorNames;
}
