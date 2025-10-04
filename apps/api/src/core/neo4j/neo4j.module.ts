import { Module } from "@nestjs/common";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { CypherService } from "src/core/neo4j/services/cypher.service";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";
import { TokenResolverService } from "src/core/neo4j/services/token-resolver.service";

@Module({
  providers: [Neo4jService, EntityFactory, CypherService, TokenResolverService],
  exports: [Neo4jService, CypherService],
})
export class Neo4JModule {}
