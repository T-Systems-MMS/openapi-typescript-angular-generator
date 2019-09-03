import { FormControl, FormGroup } from '@angular/forms';

/** @inheritdoc */
class TypedFormControl extends FormControl {
    /** @inheritdoc */
    constructor(formState, opts) {
        super(formState, {
            validators: opts ? opts.validators.map(validator => validator && validator[1]) : null,
            asyncValidators: opts && opts.asyncValidators ? opts.asyncValidators.map(validator => validator && validator[1]) : null,
            updateOn: opts && opts.updateOn ? opts.updateOn : 'change',
        });
        this.registeredValidators = this.generateValidatorNames(opts);
    }
    /** @inheritdoc */
    patchValue(value, options) {
        super.patchValue(value, options);
    }
    /** @inheritdoc */
    setValue(value, options) {
        super.setValue(value, options);
    }
    /** @inheritdoc */
    reset(formState, options) {
        super.reset(formState, options);
    }
    /**
     * Sets new validators and updates possible error keys list.
     *
     * @param newValidators new validators
     */
    setNewValidators(newValidators) {
        super.setValidators(newValidators ? newValidators.validators.map(validator => validator && validator[1]) : null);
        super.setAsyncValidators(newValidators && newValidators.asyncValidators
            ? newValidators.asyncValidators.map(validator => validator && validator[1])
            : null);
        this.registeredValidators = this.generateValidatorNames(newValidators);
    }
    /**
     * Generates validator name list.
     *
     * @param validatorOpts options to handle
     */
    generateValidatorNames(validatorOpts) {
        let keys = [];
        if (validatorOpts) {
            let validatorsList = [validatorOpts.validators];
            if (validatorOpts.asyncValidators) {
                validatorsList.push(validatorOpts.asyncValidators);
            }
            validatorsList.forEach((validators) => {
                keys.push(...validators
                    .map(validator => validator && validator[0])
                    // filter duplicates
                    .filter((key, index, array) => array.indexOf(key) === index));
            });
        }
        return keys;
    }
}

/**
 * This is the base from control factory for each model. Based on this class, each model is implementing it's own
 * FormControlFactory.
 * Main purpose of this factory is to provide an easy way of creating form-controls with the correct validators.
 * The factory also ensures that model and validator match one another.
 */
class BaseFormControlFactory {
    /**
     * Constructor.
     *
     * @param model The model object.
     * @param validators properties validators map
     */
    constructor(model, validators) {
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
     * @param controlOpts add custom validators to the default ones given in the constructor, optional async validators
     * and update mode.
     */
    createFormControl(property, controlOpts) {
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

/**
 * Typed FormGroup.
 */
class TypedFormGroup extends FormGroup {
    /** @inheritdoc */
    constructor(controls, validatorOrOpts, asyncValidator) {
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
        this.registeredValidatorsMap = map;
    }
    /** @inheritdoc */
    patchValue(value, options) {
        super.patchValue(value, options);
    }
    /** @inheritdoc */
    get(path) {
        return super.get(path);
    }
    /**
     * Returns group if available.
     *
     * @param path path to group
     */
    getNestedGroup(path) {
        const control = this.get(path);
        if (control instanceof TypedFormGroup) {
            return control;
        }
        return null;
    }
    /**
     * Detects if an error is present for given control name.
     *
     * @param name control name of the form group
     */
    hasControlErrors(name) {
        const control = this.get(name);
        return !!(control && control.errors);
    }
    /**
     * Detects if control has validator for given control name and validator name.
     *
     * @param name control name of the form group
     * @param validatorName validator name
     */
    isValidatorRegistered(name, validatorName) {
        return (this.registeredValidatorsMap[name] &&
            this.registeredValidatorsMap[name].some(errorKey => errorKey === validatorName));
    }
    /**
     * Returns an error key for the next error.
     *
     * @param name control key of the form group
     */
    nextControlErrorKey(name) {
        const control = this.get(name);
        if (control && control.errors) {
            // try client side keys first for correct order
            let error = this.registeredValidatorsMap[name] &&
                this.registeredValidatorsMap[name].find(validatorKey => control.hasError(validatorKey));
            if (!error) {
                // fallback to all errors including custom errors set after backend calls
                error = Object.keys(control.errors).shift();
            }
            if (error) {
                return error;
            }
        }
        return '';
    }
    /**
     * Dispatches errors to this control and to child controls using given error map.
     *
     * @param errors error map
     * @param contextPath optional context path to errors set to
     */
    dispatchErrors(errors, contextPath) {
        const paths = Object.keys(errors);
        paths.forEach(path => {
            const control = this.get((contextPath ? `${contextPath}.${path}` : path));
            if (control) {
                // enables showing errors in view
                control.enable();
                control.markAsTouched();
                control.setErrors(errors[path]);
            }
        });
    }
}

export { BaseFormControlFactory, TypedFormControl, TypedFormGroup };
