import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormGroup, ValidatorFn, ValidationErrors, ɵFormGroupValue } from '@angular/forms';
/**
 * Typed FormGroup.
 */
export declare class TypedFormGroup<T extends {
    [K in keyof T]: AbstractControl<any>;
} = any> extends FormGroup<T> {
    /** holds a map with control names to possible validator names */
    readonly registeredValidatorsMap: {
        [controlName in keyof T]: string[];
    };
    /** @inheritdoc */
    constructor(controls: T, validatorOrOpts?: ValidatorFn | Array<ValidatorFn> | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | Array<AsyncValidatorFn> | null);
    /** @inheritdoc */
    patchValue(value: ɵFormGroupValue<T>, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /** @inheritdoc */
    get(path: Array<Extract<keyof T, string>> | Extract<keyof T, string>): AbstractControl | null;
    /**
     * Returns group if available.
     *
     * @param path path to group
     */
    getNestedGroup<K>(path: Extract<keyof T, string>): TypedFormGroup | null;
    /**
     * Detects if an error is present for given control name.
     *
     * @param name control name of the form group
     */
    hasControlErrors(name: Extract<keyof T, string>): boolean;
    /**
     * Detects if control has validator for given control name and validator name.
     *
     * @param name control name of the form group
     * @param validatorName validator name
     */
    isValidatorRegistered(name: Extract<keyof T, string>, validatorName: string): boolean;
    /**
     * Returns an error key for the next error.
     *
     * @param name control key of the form group
     */
    nextControlErrorKey(name: Extract<keyof T, string>): string;
    /**
     * Dispatches errors to this control and to child controls using given error map.
     *
     * @param errors error map
     * @param contextPath optional context path to errors set to
     */
    dispatchErrors(errors: {
        [key: string]: ValidationErrors;
    }, contextPath?: string): void;
}
