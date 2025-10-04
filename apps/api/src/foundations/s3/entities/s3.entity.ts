import { Entity } from "src/common/abstracts/entity";

export type S3 = Entity & {
  url?: string;
  storageType?: string;
  contentType?: string;
  blobType?: string;
  acl?: string;
};
