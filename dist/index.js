'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var forms = require('@angular/forms');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/** @inheritdoc */
var TypedFormControl = /** @class */ (function (_super) {
    __extends(TypedFormControl, _super);
    /** @inheritdoc */
    function TypedFormControl(formState, opts) {
        var _this = _super.call(this, formState, {
            validators: opts ? opts.validators.map(function (validator) { return validator && validator[1]; }) : null,
            asyncValidators: opts && opts.asyncValidators ? opts.asyncValidators.map(function (validator) { return validator && validator[1]; }) : null,
            updateOn: opts && opts.updateOn ? opts.updateOn : 'change',
        }) || this;
        _this.registeredValidators = _this.generateValidatorNames(opts);
        return _this;
    }
    /** @inheritdoc */
    TypedFormControl.prototype.patchValue = function (value, options) {
        _super.prototype.patchValue.call(this, value, options);
    };
    /** @inheritdoc */
    TypedFormControl.prototype.setValue = function (value, options) {
        _super.prototype.setValue.call(this, value, options);
    };
    /** @inheritdoc */
    TypedFormControl.prototype.reset = function (formState, options) {
        _super.prototype.reset.call(this, formState, options);
    };
    /**
     * Sets new validators and updates possible error keys list.
     *
     * @param newValidators new validators
     */
    TypedFormControl.prototype.setNewValidators = function (newValidators) {
        _super.prototype.setValidators.call(this, newValidators ? newValidators.validators.map(function (validator) { return validator && validator[1]; }) : null);
        _super.prototype.setAsyncValidators.call(this, newValidators && newValidators.asyncValidators
            ? newValidators.asyncValidators.map(function (validator) { return validator && validator[1]; })
            : null);
        this.registeredValidators = this.generateValidatorNames(newValidators);
    };
    /**
     * Generates validator name list.
     *
     * @param validatorOpts options to handle
     */
    TypedFormControl.prototype.generateValidatorNames = function (validatorOpts) {
        var keys = [];
        if (validatorOpts) {
            var validatorsList = [validatorOpts.validators];
            if (validatorOpts.asyncValidators) {
                validatorsList.push(validatorOpts.asyncValidators);
            }
            validatorsList.forEach(function (validators) {
                keys.push.apply(keys, validators
                    .map(function (validator) { return validator && validator[0]; })
                    // filter duplicates
                    .filter(function (key, index, array) { return array.indexOf(key) === index; }));
            });
        }
        return keys;
    };
    return TypedFormControl;
}(forms.FormControl));

/**
 * This is the base from control factory for each model. Based on this class, each model is implementing it's own
 * FormControlFactory.
 * Main purpose of this factory is to provide an easy way of creating form-controls with the correct validators.
 * The factory also ensures that model and validator match one another.
 */
var BaseFormControlFactory = /** @class */ (function () {
    /**
     * Constructor.
     *
     * @param model The model object.
     * @param validators properties validators map
     */
    function BaseFormControlFactory(model, validators) {
        this.map = new Map();
        for (var property in model) {
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
    BaseFormControlFactory.prototype.createFormControl = function (property, controlOpts) {
        var model = this.map.get(property);
        if (model) {
            return new TypedFormControl(model.value, {
                validators: model.validators.concat((controlOpts ? controlOpts.validators : [])),
                asyncValidators: controlOpts ? controlOpts.asyncValidators : undefined,
                updateOn: controlOpts ? controlOpts.updateOn : undefined,
            });
        }
        return new TypedFormControl();
    };
    return BaseFormControlFactory;
}());

/**
 * Typed FormGroup.
 */
var TypedFormGroup = /** @class */ (function (_super) {
    __extends(TypedFormGroup, _super);
    /** @inheritdoc */
    function TypedFormGroup(controls, validatorOrOpts, asyncValidator) {
        var _this = _super.call(this, controls, validatorOrOpts, asyncValidator) || this;
        var map = {};
        Object.keys(controls).forEach(function (controlName) {
            var control = controls[controlName];
            if (control instanceof TypedFormControl) {
                Object.defineProperty(map, controlName, {
                    get: function () {
                        return control.registeredValidators;
                    },
                });
            }
        });
        _this.registeredValidatorsMap = map;
        return _this;
    }
    /** @inheritdoc */
    TypedFormGroup.prototype.patchValue = function (value, options) {
        _super.prototype.patchValue.call(this, value, options);
    };
    /** @inheritdoc */
    TypedFormGroup.prototype.get = function (path) {
        return _super.prototype.get.call(this, path);
    };
    /**
     * Returns group if available.
     *
     * @param path path to group
     */
    TypedFormGroup.prototype.getNestedGroup = function (path) {
        var control = this.get(path);
        if (control instanceof TypedFormGroup) {
            return control;
        }
        return null;
    };
    /**
     * Detects if an error is present for given control name.
     *
     * @param name control name of the form group
     */
    TypedFormGroup.prototype.hasControlErrors = function (name) {
        var control = this.get(name);
        return !!(control && control.errors);
    };
    /**
     * Detects if control has validator for given control name and validator name.
     *
     * @param name control name of the form group
     * @param validatorName validator name
     */
    TypedFormGroup.prototype.isValidatorRegistered = function (name, validatorName) {
        return (this.registeredValidatorsMap[name] &&
            this.registeredValidatorsMap[name].some(function (errorKey) { return errorKey === validatorName; }));
    };
    /**
     * Returns an error key for the next error.
     *
     * @param name control key of the form group
     */
    TypedFormGroup.prototype.nextControlErrorKey = function (name) {
        var control = this.get(name);
        if (control && control.errors) {
            // try client side keys first for correct order
            var error = this.registeredValidatorsMap[name] &&
                this.registeredValidatorsMap[name].find(function (validatorKey) { return control.hasError(validatorKey); });
            if (!error) {
                // fallback to all errors including custom errors set after backend calls
                error = Object.keys(control.errors).shift();
            }
            if (error) {
                return error;
            }
        }
        return '';
    };
    /**
     * Dispatches errors to this control and to child controls using given error map.
     *
     * @param errors error map
     * @param contextPath optional context path to errors set to
     */
    TypedFormGroup.prototype.dispatchErrors = function (errors, contextPath) {
        var _this = this;
        var paths = Object.keys(errors);
        paths.forEach(function (path) {
            var control = _this.get((contextPath ? contextPath + "." + path : path));
            if (control) {
                // enables showing errors in view
                control.enable();
                control.markAsTouched();
                control.setErrors(errors[path]);
            }
        });
    };
    return TypedFormGroup;
}(forms.FormGroup));

exports.BaseFormControlFactory = BaseFormControlFactory;
exports.TypedFormControl = TypedFormControl;
exports.TypedFormGroup = TypedFormGroup;
