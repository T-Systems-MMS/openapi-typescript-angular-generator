import { ValidatorFn } from '@angular/forms';
import { TypedFormControl, TypedControlOptions } from './formcontrol';
/**
 * This is the base from control factory for each model. Based on this class, each model is implementing it's own
 * FormControlFactory.
 * Main purpose of this factory is to provide an easy way of creating form-controls with the correct validators.
 * The factory also ensures that model and validator match one another.
 */
export declare class BaseFormControlFactory<T extends Object> {
    private map;
    /**
     * Constructor.
     *
     * @param model The model object.
     * @param validators properties validators map
     */
    constructor(model: T, validators: {
        [K in keyof T]: [string, ValidatorFn][];
    });
    /**
     * Creates a new `TypedFormControl` instance.
     *
     * @param property the property of the model for which the `TypedFormControl` should be created.
     * @param controlOpts add custom validators to the default ones given in the constructor, optional async validators
     * and update mode.
     */
    createFormControl<K>(property: keyof T, controlOpts?: TypedControlOptions): TypedFormControl<K>;
}
