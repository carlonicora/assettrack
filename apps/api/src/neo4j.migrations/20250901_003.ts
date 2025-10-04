/**
 * This migration creates the initial set of user roles in the database.
 */

import { MigrationInterface } from "src/core/migrator/interfaces/migration.interface";
import { roleQuery } from "src/neo4j.migrations/queries/migration.queries";

export const migration: MigrationInterface[] = [
  {
    query: roleQuery,
    queryParams: {
      roleId: "53394cb8-1e87-11ef-8b48-bed54b8f8aba",
      roleName: "Administrators",
      isSelectable: false,
    },
  },
  {
    query: roleQuery,
    queryParams: {
      roleId: "2e1eee00-6cba-4506-9059-ccd24e4ea5b0",
      roleName: "Company Administrator",
      isSelectable: true,
    },
  },
];
