import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Convert array to Set once (for fast lookups)
const disposableDomains = require('disposable-email-domains');
const disposableDomainsSet = new Set(
  disposableDomains.map((domain) => domain.toLowerCase()),
);

@ValidatorConstraint({ async: false })
export class NotDisposableEmailConstraint
  implements ValidatorConstraintInterface
{
  validate(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomainsSet.has(domain);
  }

  defaultMessage(): string {
    return 'Temporary email detected. Please use a valid email to continue.';
  }
}

export function IsNotDisposableEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NotDisposableEmailConstraint,
    });
  };
}
