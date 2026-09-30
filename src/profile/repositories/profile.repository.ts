import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import * as schema from '../../drizzle/schema';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class ProfileRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByUserId(userId: string) {
    const [result] = await this.db
      .select({
        id: schema.profiles.id,
        userId: schema.profiles.userId,
        peso: schema.profiles.peso,
        altura: schema.profiles.altura,
        idade: schema.profiles.idade,
        nivelDificuldade: schema.profiles.nivelDificuldade,
        latitude: sql<number | null>`ST_Y(${schema.profiles.hideoutLocation}::geometry)`,
        longitude: sql<number | null>`ST_X(${schema.profiles.hideoutLocation}::geometry)`,
        hideoutRadius: schema.profiles.hideoutRadius,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId))
      .limit(1);

    return result || null;
  }

  async update(userId: string, data: UpdateProfileDto) {
    const { peso, altura, idade, nivel_dificuldade, mapa_ocultacao } = data;

    let hideoutExpr: any = undefined;
    if (mapa_ocultacao) {
      const { latitude, longitude } = mapa_ocultacao;
      hideoutExpr = sql`ST_SetSRID(ST_MakePoint(${longitude}::double precision, ${latitude}::double precision), 4326)::geometry`;
    }

    await this.db
      .insert(schema.profiles)
      .values({
        userId,
        peso,
        altura,
        idade,
        nivelDificuldade: nivel_dificuldade,
        hideoutLocation: hideoutExpr,
        hideoutRadius: mapa_ocultacao?.raio_metros,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.profiles.userId,
        set: {
          peso: peso !== undefined ? peso : sql`profiles.peso`,
          altura: altura !== undefined ? altura : sql`profiles.altura`,
          idade: idade !== undefined ? idade : sql`profiles.idade`,
          nivelDificuldade: nivel_dificuldade !== undefined ? nivel_dificuldade : sql`profiles."nivelDificuldade"`,
          hideoutLocation: hideoutExpr ?? sql`profiles."hideoutLocation"`,
          hideoutRadius: mapa_ocultacao?.raio_metros ?? sql`profiles."hideoutRadius"`,
          updatedAt: new Date(),
        },
      });

    return this.findByUserId(userId);
  }
}
