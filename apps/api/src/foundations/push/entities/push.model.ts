import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Push } from "src/foundations/push/entities/push.entity";
import { mapPush } from "src/foundations/push/entities/push.map";
import { pushMeta } from "src/foundations/push/entities/push.meta";

export const PushModel: DataModelInterface<Push> = {
  ...pushMeta,
  entity: undefined as unknown as Push,
  mapper: mapPush,
};
