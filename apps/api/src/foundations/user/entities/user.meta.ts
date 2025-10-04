import { DataMeta } from "src/common/interfaces/datamodel.interface";

export const userMeta: DataMeta = {
  type: "users",
  endpoint: "users",
  nodeName: "user",
  labelName: "User",
};

export const ownerMeta: DataMeta = {
  ...userMeta,
  endpoint: "owners",
  nodeName: "owner",
};
