import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { S3 } from "src/foundations/s3/entities/s3.entity";

export const mapS3 = (params: { data: any; record: any; entityFactory: EntityFactory }): S3 => {
  return {
    ...mapEntity({ record: params.data }),
    url: params.data.url,
    storageType: params.data.storageType,
    contentType: params.data.contentType,
    blobType: params.data.blobType,
    acl: params.data.acl,
  };
};
