export class PayloomConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayloomConfigError";
  }
}

export class PayloomValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayloomValidationError";
  }
}

export class PayloomVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayloomVerificationError";
  }
}
