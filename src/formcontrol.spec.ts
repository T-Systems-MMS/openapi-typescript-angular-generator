import { TypedFormControl } from './formcontrol';
import { Validators, ValidationErrors, AbstractControl } from '@angular/forms';

test('Create TypedFormControl', () => {
  const formControl = new TypedFormControl('test', {
    validators: [['req', Validators.required]],
    asyncValidators: [
      [
        'asyncReq',
        (control: AbstractControl) => {
          return new Promise<ValidationErrors>(resolve => {
            resolve({ asyncReq: 'Is required!' });
          });
        },
      ],
    ],
  });

  expect(formControl.registeredValidators).toEqual(['req', 'asyncReq']);
});

test('Create TypedFormControl with only validators', () => {
  const formControl = new TypedFormControl('test', {
    validators: [['req', Validators.required]],
  });

  expect(formControl.registeredValidators).toEqual(['req']);
});
