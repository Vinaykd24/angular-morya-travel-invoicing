import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function dropDateAfterPickUpDate(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pickUpDate = group.get('pickUpDate')?.value;
    const dropDate = group.get('dropDate')?.value;

    if (!pickUpDate || !dropDate) {
      return null; // If one of the dates is not provided, no validation is needed
    }

    // Compare dates (assuming both are Date objects)
    return new Date(dropDate) < new Date(pickUpDate)
      ? { dropDateBeforePickUp: true }
      : null;
  };
}

export function droptimeAfterPickUptime(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pickUpTime = group.get('pickUpTime')?.value;
    const dropTime = group.get('dropTime')?.value;

    if (!pickUpTime || !dropTime) {
      return null; // If one of the dates is not provided, no validation is needed
    }

    // Compare dates (assuming both are Date objects)
    return new Date(dropTime) < new Date(pickUpTime)
      ? { dropTimeBeforePickUp: true }
      : null;
  };
}
