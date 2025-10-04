import { Entity } from "src/common/abstracts/entity";

export type Module = Entity & {
  name: string;
  isCore?: boolean;

  permissions: {
    create?: boolean | string;
    read?: boolean | string;
    update?: boolean | string;
    delete?: boolean | string;
  };
};
