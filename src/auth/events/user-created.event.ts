export class UserCreatedEvent {
  constructor(
    public readonly email: string,
    public readonly alias: string,
    public readonly verificationToken: string,
    public readonly verifyUrl: string,
    public readonly requestId?: string,
  ) {}
}
