export class PasswordResetRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly alias: string,
    public readonly token: string,
    public readonly resetUrl: string,
    public readonly requestId?: string,
  ) {}
}
