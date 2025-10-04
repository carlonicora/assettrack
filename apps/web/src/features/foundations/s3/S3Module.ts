import { S3 } from "@/features/foundations/s3/data/S3";
import { FactoryType } from "@/permisions/types";

export const S3Module = (factory: FactoryType) =>
  factory({
    pageUrl: "/s3",
    name: "s3",
    model: S3,
    moduleId: "db41ba46-e171-4324-8845-99353eba8568",
  });
