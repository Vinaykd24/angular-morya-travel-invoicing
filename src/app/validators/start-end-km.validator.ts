import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function startKmsLessThanEndKms(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startKms = group.get('startKms')?.value;
    const endKms = group.get('endKms')?.value;

    return startKms !== null && endKms !== null && startKms > endKms
      ? { startKmsGreater: true }
      : null;
  };
}
