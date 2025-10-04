/**
 * This migration creates the initial set of features in the database.
 */

import { MigrationInterface } from "src/core/migrator/interfaces/migration.interface";
import { featureQuery } from "src/neo4j.migrations/queries/migration.queries";

export const migration: MigrationInterface[] = [
  {
    query: featureQuery,
    queryParams: {
      featureId: "17036fb0-060b-4c83-a617-f32259819783",
      featureName: "Common",
      isProduction: true,
    },
  },
];
