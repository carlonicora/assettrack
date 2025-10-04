import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Push } from "src/foundations/push/entities/push.entity";

export const mapPush = (params: { data: any; record: any; entityFactory: EntityFactory }): Push => {
  return {
    ...mapEntity({ record: params.data }),
    endpoint: params.data.endpoint,
    p256dh: params.data.p256dh,
    auth: params.data.auth,
    subscription: {
      endpoint: params.data.endpoint,
      keys: {
        p256dh: params.data.p256dh,
        auth: params.data.auth,
      },
    },
  };
};
