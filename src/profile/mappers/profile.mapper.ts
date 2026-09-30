import { Injectable } from '@nestjs/common';
import { Profile } from '../entities/profile.entity';
import { HideoutZoneVO } from '../domain/value-objects/hideout-zone.vo';

@Injectable()
export class ProfileMapper {
  toDomain(raw: any): Profile | null {
    if (!raw) return null;

    const hasHideoutZone = raw.latitude !== null && raw.longitude !== null && raw.hideoutRadius !== null;

    const hideoutZone = hasHideoutZone
      ? new HideoutZoneVO(raw.latitude, raw.longitude, raw.hideoutRadius)
      : null;

    return new Profile(
      raw.id,
      raw.userId,
      raw.peso,
      raw.altura,
      raw.idade,
      raw.nivelDificuldade,
      hideoutZone,
    );
  }
}
