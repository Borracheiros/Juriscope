export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export function assertInvariant(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) {
    throw new DomainError(code, message);
  }
}
