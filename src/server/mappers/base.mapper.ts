// src/server/mappers/base.mapper.ts
import { z } from "zod";

export abstract class BaseMapper<
  TPrisma extends Record<string, unknown>,
  TResponse
> {
  /**
   * Zod schema สำหรับ validate response
   */
  protected abstract readonly schema: z.ZodType<TResponse>;

  /**
   * ฟิลด์ที่จะ map (Optional)
   */
  protected pickFields?: (keyof TPrisma)[];

  /**
   * แปลง request body → Prisma entity
   * มี default (Return as is)
   */
  public toEntity(data: Partial<TPrisma>): Partial<TPrisma> {
    return { ...data };
  }

  /**
   * Prisma model → DTO ก่อน validate
   * ต้องให้ mapper ลูก override
   */
  protected abstract mapToResponse(entity: TPrisma): unknown;

  /**
   * Prisma model → validated DTO
   */
  public toResponse(entity: TPrisma): TResponse {
    let raw: unknown = this.mapToResponse(entity);

    // ถ้ากำหนด pickFields → filter เฉพาะ field
    if (this.pickFields && this.isRecord(raw)) {
      raw = this.pickObject(raw, this.pickFields);
    }

    // เพิ่ม hook สำหรับการปรับแต่งก่อน validate
    raw = this.beforeValidate(raw);

    return this.schema.parse(raw);
  }

  /**
   * Array model → validated array DTO
   */
  public toResponseList(entities: TPrisma[]): TResponse[] {
    return entities.map((e) => this.toResponse(e));
  }

  /**
   * ✔ Hook: แก้ raw object ก่อน validate
   */
  protected beforeValidate(raw: unknown): unknown {
    return raw;
  }

  /**
   * ✔ Utility: เลือกเฉพาะฟิลด์ที่ต้องการ
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private pickObject(
    obj: Record<string, unknown>,
    fields: (keyof TPrisma)[]
  ) {
    const result: Partial<Record<string, unknown>> = {};
    for (const key of fields) {
      if (key in obj) result[key as string] = obj[key as string];
    }
    return result;
  }
}
