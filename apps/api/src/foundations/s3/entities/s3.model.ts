import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { S3 } from "src/foundations/s3/entities/s3.entity";
import { mapS3 } from "src/foundations/s3/entities/s3.map";
import { s3Meta } from "src/foundations/s3/entities/s3.meta";
import { S3Serialiser } from "src/foundations/s3/serialisers/s3.serialiser";

export const S3Model: DataModelInterface<S3> = {
  ...s3Meta,
  entity: undefined as unknown as S3,
  mapper: mapS3,
  serialiser: S3Serialiser,
};
