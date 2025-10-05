import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiService } from "src/core/jsonapi/services/jsonapi.service";
import { analyticMeta } from "src/features/analytic/entities/analytic.meta";
import { AnalyticModel } from "src/features/analytic/entities/analytic.model";
import { EquipmentRepository } from "src/features/equipment/repositories/equipment.repository";

@Injectable()
export class AnalyticService {
  constructor(
    private readonly builder: JsonApiService,
    private readonly equipmentRepository: EquipmentRepository,
  ) {}

  async find(): Promise<JsonApiDataInterface> {
    const equipment = await this.equipmentRepository.findActive();

    const data = {
      id: randomUUID(),
      type: analyticMeta.type,
      equipment: equipment.length,
      loan: 0,
      expiring30: 0,
      expiring60: 0,
      expiring90: 0,
      expired: 0,
    };

    for (const item of equipment) {
      if (item.loan) {
        data.loan += 1;
      }

      if (item.endDate) {
        const now = new Date();
        const endDate = new Date(item.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          data.expired += 1;
        } else if (diffDays <= 30) {
          data.expiring30 += 1;
        } else if (diffDays <= 60) {
          data.expiring60 += 1;
        } else if (diffDays <= 90) {
          data.expiring90 += 1;
        }
      }
    }

    return this.builder.buildSingle(AnalyticModel, data);
  }
}
