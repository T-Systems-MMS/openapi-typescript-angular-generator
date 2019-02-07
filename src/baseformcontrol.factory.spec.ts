import { BaseFormControlFactory } from './baseformcontrol.factory';
import { Validators } from '@angular/forms';

interface TestType {
  value: string;
}

test('Test FormControl creation', () => {
  const factory = new BaseFormControlFactory<TestType>(
    { value: 'testValue' },
    { value: [['req', Validators.required]] }
  );

  expect(Array.from(factory['map'].entries())).toEqual([
    ['value', { validators: [['req', Validators.required]], value: 'testValue' }],
  ]);

  const control = factory.createFormControl('value');
  expect(control.registeredValidators).toEqual(['req']);
});
