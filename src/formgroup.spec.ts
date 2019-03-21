import { BaseFormControlFactory } from './baseformcontrol.factory';
import { TypedFormGroup } from './formgroup';
import { Validators } from '@angular/forms';

interface TestType {
  value: string;
  nested: NestedType;
}

interface NestedType {
  deepValue: string;
}

test('Test FormGroupControl creation #1', () => {
  const factory = new BaseFormControlFactory<TestType>(
    { value: 'testValue', nested: { deepValue: 'deepTestValue' } },
    { value: [['req', Validators.required]], nested: [] }
  );

  const nestedFactory = new BaseFormControlFactory<NestedType>(
    { deepValue: 'deepTestValue' },
    { deepValue: [['req', Validators.required]] }
  );

  expect(Array.from(factory['map'].entries())).toEqual([
    ['value', { validators: [['req', Validators.required]], value: 'testValue' }],
    ['nested', { validators: [], value: { deepValue: 'deepTestValue' } }],
  ]);
  expect(Array.from(nestedFactory['map'].entries())).toEqual([
    ['deepValue', { validators: [['req', Validators.required]], value: 'deepTestValue' }],
  ]);

  const control = factory.createFormControl('value');
  expect(control.registeredValidators).toEqual(['req']);

  const valueControl = factory.createFormControl('value');
  const nestedControl = nestedFactory.createFormControl('deepValue');
  const nestedGroup = new TypedFormGroup<NestedType>({
    deepValue: nestedControl,
  });
  const group = new TypedFormGroup<TestType>({
    nested: nestedGroup,
    value: valueControl,
  });

  expect(nestedGroup.registeredValidatorsMap.deepValue).toEqual(['req']);
  expect(group.registeredValidatorsMap.value).toEqual(['req']);

  valueControl.setErrors({ req: 'Is Required!', other: 'Other Error!' });
  nestedControl.setErrors({ req: 'Is Required!' });

  expect(group.parent).toBeUndefined();
  expect(valueControl.parent).toEqual(group);
  expect(nestedControl.parent).toEqual(nestedGroup);

  expect(group.hasControlErrors('value')).toBe(true);
  expect(group.controls['nested'].status).toBe('INVALID');
  const returnedGroup = group.getNestedGroup<NestedType>('nested');
  expect(returnedGroup ? returnedGroup.hasControlErrors('deepValue') : false).toBe(true);
  expect(nestedGroup.hasControlErrors('deepValue')).toBe(true);
  expect(group.isValidatorRegistered('value', 'required')).toBe(false);
  expect(nestedGroup.isValidatorRegistered('deepValue', 'required')).toBe(false);
  expect(group.nextControlErrorKey('value')).toBe('req');
  expect(nestedGroup.nextControlErrorKey('deepValue')).toBe('req');

  valueControl.setErrors({ other: 'Other Error!' });
  expect(group.nextControlErrorKey('value')).toBe('other');
});

test('Test FormGroupControl creation #2', () => {
  const nestedFactory = new BaseFormControlFactory<NestedType>(
    { deepValue: 'deepTestValue' },
    { deepValue: [['req', Validators.required]] }
  );

  const nestedControl = nestedFactory.createFormControl('deepValue');
  const nestedGroup = new TypedFormGroup<NestedType>({
    deepValue: nestedControl,
  });

  expect(nestedGroup.registeredValidatorsMap.deepValue).toEqual(['req']);

  nestedControl.setNewValidators({ validators: [['req', Validators.required], ['max', Validators.max(2)]] });

  expect(nestedGroup.registeredValidatorsMap.deepValue).toEqual(['req', 'max']);
});
