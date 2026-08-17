export class SilentValidationError extends Error {
  constructor() {
    super('SILENT_VALIDATION');
  }
}
