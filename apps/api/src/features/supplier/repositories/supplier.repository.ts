import { HttpException, HttpStatus, Injectable, OnModuleInit } from "@nestjs/common";
import { JsonApiCursorInterface } from "src/core/jsonapi/interfaces/jsonapi.cursor.interface";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";
import { SecurityService } from "src/core/security/services/security.service";
import { Supplier } from "src/features/supplier/entities/supplier.entity";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";
import { SupplierCypherService } from "src/features/supplier/services/supplier.cypher.service";

@Injectable()
export class SupplierRepository implements OnModuleInit {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly supplierCypherService: SupplierCypherService,
    private readonly securityService: SecurityService,
  ) {}

  async onModuleInit() {
    await this.neo4j.writeOne({
      query: `CREATE CONSTRAINT ${supplierMeta.nodeName}_id IF NOT EXISTS FOR (${supplierMeta.nodeName}:${supplierMeta.labelName}) REQUIRE ${supplierMeta.nodeName}.id IS UNIQUE`,
    });

    const indexName = "supplier_search_index";
    const expectedProperties = ["name", "address", "email", "phone"];

    const result = await this.neo4j.read(
      `
    SHOW INDEXES
    YIELD name, type, entityType, labelsOrTypes, properties
    WHERE name = $indexName AND type = 'FULLTEXT' AND entityType = 'NODE'
    RETURN labelsOrTypes AS labels, properties
  `,
      { indexName },
    );

    const match = result.records[0];
    const labels = match?.get("labels") ?? [];
    const properties = match?.get("properties") ?? [];

    const arraysEqual = (a, b) => a.length === b.length && a.every((val) => b.includes(val));

    if (!match || !arraysEqual(labels, [supplierMeta.labelName]) || !arraysEqual(properties, expectedProperties)) {
      await this.neo4j.writeOne({
        query: `
          CREATE FULLTEXT INDEX \`${indexName}\` IF NOT EXISTS
          FOR (n:${[supplierMeta.labelName].map((l) => `\`${l}\``).join(" | ")})
          ON EACH [${expectedProperties.map((p) => `n.\`${p}\``).join(", ")}]
        `,
        queryParams: {},
      });
    }
  }

  private async _validateForbidden(params: {
    response: Supplier | null;
    searchField: string;
    searchValue: string;
  }): Promise<Supplier | null> {
    if (params.response) return params.response;

    const existsQuery = this.neo4j.initQuery({ serialiser: SupplierModel });
    existsQuery.queryParams = { companyId: null, currentUserId: null, searchValue: params.searchValue };
    existsQuery.query = `
      ${this.supplierCypherService.default({ searchField: "id", blockCompanyAndUser: true })}
      ${this.supplierCypherService.returnStatement()}
    `;
    const exists = await this.neo4j.readOne(existsQuery);

    if (exists) throw new HttpException(`Forbidden`, HttpStatus.FORBIDDEN);
  }

  async find(params: {
    fetchAll?: boolean;
    term?: string;
    orderBy?: string;
    cursor?: JsonApiCursorInterface;
  }): Promise<Supplier[]> {
    const query = this.neo4j.initQuery({
      cursor: params.cursor,
      serialiser: SupplierModel,
      fetchAll: params.fetchAll,
    });

    query.queryParams = {
      ...query.queryParams,
      term: params.term,
    };

    if (params.term) {
      query.query += `CALL db.index.fulltext.queryNodes("supplier_search_index", $term)
      YIELD node, score
      WHERE (node)-[:BELONGS_TO]->(company)

      WITH node as supplier, score
      ORDER BY score DESC
    `;
    } else {
      query.query += `
      ${this.supplierCypherService.default()}
      ${this.securityService.userHasAccess({ validator: this.supplierCypherService.userHasAccess })}
      
      ORDER BY ${supplierMeta.nodeName}.${params.orderBy ? `${params.orderBy}` : `updatedAt DESC`}
    `;
    }

    query.query += `
      {CURSOR}

      ${this.supplierCypherService.returnStatement()}
    `;

    return this.neo4j.readMany(query);
  }

  async findById(params: { id: string }): Promise<Supplier> {
    const query = this.neo4j.initQuery({ serialiser: SupplierModel });

    query.queryParams = {
      ...query.queryParams,
      searchValue: params.id,
    };

    query.query += `
      ${this.supplierCypherService.default({ searchField: "id" })}
      ${this.securityService.userHasAccess({ validator: this.supplierCypherService.userHasAccess })}
      ${this.supplierCypherService.returnStatement()}
    `;

    return this._validateForbidden({
      response: await this.neo4j.readOne(query),
      searchField: "id",
      searchValue: params.id,
    });
  }

  async create(params: { id: string; name: string; address?: string; email?: string; phone?: string }): Promise<void> {
    const query = this.neo4j.initQuery();

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
      name: params.name,
      address: params.address ?? "",
      email: params.email ?? "",
      phone: params.phone ?? "",
    };

    query.query += `
      CREATE (supplier:Supplier {
        id: $id,
        name: $name,
        address: $address,
        email: $email,
        phone: $phone,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (supplier)-[:BELONGS_TO]->(company)
    `;

    await this.neo4j.writeOne(query);
  }

  async put(params: { id: string; name: string; address?: string; email?: string; phone?: string }): Promise<void> {
    const query = this.neo4j.initQuery();

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
      name: params.name ?? "",
      address: params.address ?? "",
      email: params.email ?? "",
      phone: params.phone ?? "",
    };

    const setParams: string[] = [];
    setParams.push("supplier.name = $name");
    setParams.push("supplier.address = $address");
    setParams.push("supplier.email = $email");
    setParams.push("supplier.phone = $phone");
    const set = setParams.join(", ");

    query.query += `
      MATCH (supplier:Supplier {id: $id})-[:BELONGS_TO]->(company)
      SET supplier.updatedAt = datetime(),
      ${set}
    `;

    await this.neo4j.writeOne(query);
  }

  async delete(params: { id: string }): Promise<void> {
    const query = this.neo4j.initQuery();

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
    };

    query.query += `
      MATCH (supplier:Supplier {id: $id})-[:BELONGS_TO]->(company)
      DETACH DELETE supplier;
    `;

    await this.neo4j.writeOne(query);
  }
}
