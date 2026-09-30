import { HideoutZoneVO } from '../domain/value-objects/hideout-zone.vo';

export class Profile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly peso?: number | null,
    public readonly altura?: number | null,
    public readonly idade?: number | null,
    public readonly nivelDificuldade?: string | null,
    public readonly mapaOcultacao?: HideoutZoneVO | null,
  ) {}
}
