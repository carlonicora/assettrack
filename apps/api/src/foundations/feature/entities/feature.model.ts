import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Feature } from "src/foundations/feature/entities/feature.entity";
import { mapFeature } from "src/foundations/feature/entities/feature.map";
import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { FeatureSerialiser } from "src/foundations/feature/serialisers/feature.serialiser";
import { moduleMeta } from "src/foundations/module/entities/module.meta";

export const FeatureModel: DataModelInterface<Feature> = {
  ...featureMeta,
  entity: undefined as unknown as Feature,
  mapper: mapFeature,
  serialiser: FeatureSerialiser,
  childrenTokens: [moduleMeta.nodeName],
};
