import { HttpException, HttpStatus, Injectable, OnModuleInit } from "@nestjs/common";
import { JsonApiCursorInterface } from "src/core/jsonapi/interfaces/jsonapi.cursor.interface";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";
import { SecurityService } from "src/core/security/services/security.service";
import { Loan } from "src/features/loan/entities/loan.entity";
import { LoanModel } from "src/features/loan/entities/loan.model";
import { LoanCypherService } from "src/features/loan/services/loan.cypher.service";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import { updateRelationshipQuery } from "src/core/neo4j/queries/update.relationship";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";

@Injectable()
export class LoanRepository implements OnModuleInit {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly loanCypherService: LoanCypherService,
    private readonly securityService: SecurityService,
  ) {}

  async onModuleInit() {
    await this.neo4j.writeOne({
      query: `CREATE CONSTRAINT ${loanMeta.nodeName}_id IF NOT EXISTS FOR (${loanMeta.nodeName}:${loanMeta.labelName}) REQUIRE ${loanMeta.nodeName}.id IS UNIQUE`,
    });

    const indexName = "loan_search_index";
    const expectedProperties = ["name",];

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

    if (!match || !arraysEqual(labels, [loanMeta.labelName]) || !arraysEqual(properties, expectedProperties)) {
      await this.neo4j.writeOne({
        query: `
          CREATE FULLTEXT INDEX \`${indexName}\` IF NOT EXISTS
          FOR (n:${[loanMeta.labelName].map((l) => `\`${l}\``).join(" | ")})
          ON EACH [${expectedProperties.map((p) => `n.\`${p}\``).join(", ")}]
        `,
        queryParams: {},
      });
    }
  }

  private async _validateForbidden(params: {
    response: Loan | null;
    searchField: string;
    searchValue: string;
  }): Promise<Loan | null> {
    if (params.response) return params.response;

    const existsQuery = this.neo4j.initQuery({ serialiser: LoanModel });
    existsQuery.queryParams = { companyId: null, currentUserId: null, searchValue: params.searchValue };
    existsQuery.query = `
      ${this.loanCypherService.default({ searchField: "id", blockCompanyAndUser: true })}
      ${this.loanCypherService.returnStatement()}
    `;
    const exists = await this.neo4j.readOne(existsQuery);

    if (exists) throw new HttpException(`Forbidden`, HttpStatus.FORBIDDEN);
  }

  async find(params: { 
    fetchAll?: boolean; 
    term?: string; 
    orderBy?: string;
    cursor?: JsonApiCursorInterface
  }): Promise<Loan[]> {
    const query = this.neo4j.initQuery({
      cursor: params.cursor,
      serialiser: LoanModel,
      fetchAll: params.fetchAll,
    });

    query.queryParams = {
      ...query.queryParams,
      term: params.term,
    };

    if (params.term) {
      query.query += `CALL db.index.fulltext.queryNodes("loan_search_index", $term)
      YIELD node, score
      WHERE (node)-[:BELONGS_TO]->(company)

      WITH node as loan, score
      ORDER BY score DESC
    `;
    } else {
      query.query += `
      ${this.loanCypherService.default()}
      ${this.securityService.userHasAccess({ validator: this.loanCypherService.userHasAccess })}
      
      ORDER BY ${loanMeta.nodeName}.${params.orderBy ? `${params.orderBy}` : `updatedAt DESC`}
    `;
    }

    query.query += `
      {CURSOR}

      ${this.loanCypherService.returnStatement()}
    `;

    return this.neo4j.readMany(query);
  }

  async findById(params: { id: string }): Promise<Loan> {
    const query = this.neo4j.initQuery({ serialiser: LoanModel });

    query.queryParams = {
      ...query.queryParams,
      searchValue: params.id,
    };

    query.query += `
      ${this.loanCypherService.default({ searchField: "id" })}
      ${this.securityService.userHasAccess({ validator: this.loanCypherService.userHasAccess })}
      ${this.loanCypherService.returnStatement()}
    `;

    return this._validateForbidden({
      response: await this.neo4j.readOne(query),
      searchField: "id",
      searchValue: params.id,
    });
  }

  async create(params: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    employeeIds: string;
    equipmentIds: string;
  }): Promise<void> {
    const query = this.neo4j.initQuery();

    await this.neo4j.validateExistingNodes({
      nodes: [
        { id: params.employeeIds, label: employeeMeta.labelName },
        { id: params.equipmentIds, label: equipmentMeta.labelName },
      ],
    });

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
      name: params.name,
      startDate: params.startDate,
      endDate: params.endDate,
      employeeIds: [params.employeeIds],
      equipmentIds: [params.equipmentIds],
    };

    query.query += `
      CREATE (loan:Loan {
        id: $id,
        name: $name,
        startDate: $startDate,
        endDate: $endDate,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (loan)-[:BELONGS_TO]->(company)
    `;

    const relationships = [
      { relationshipName: "RECEIVES", param: "employeeIds", label: employeeMeta.labelName, relationshipToNode: false },
      { relationshipName: "LOANED_THROUGH", param: "equipmentIds", label: equipmentMeta.labelName, relationshipToNode: false }
    ];

    relationships.forEach(({ relationshipName, param, label, relationshipToNode }) => {
      query.query += updateRelationshipQuery({
        node: loanMeta.nodeName,
        relationshipName: relationshipName,
        relationshipToNode: relationshipToNode,
        label: label,
        param: param,
        values: params[param],
      });
    });

    await this.neo4j.writeOne(query);
  }

  async put(params: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    employeeIds: string;
    equipmentIds: string;
  }): Promise<void> {
    const query = this.neo4j.initQuery();

    await this.neo4j.validateExistingNodes({
      nodes: [
        { id: params.employeeIds, label: employeeMeta.labelName },
        { id: params.equipmentIds, label: equipmentMeta.labelName },
      ],
    });

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
      name: params.name ?? "",
      startDate: params.startDate ?? "",
      endDate: params.endDate ?? "",
      employeeIds: [params.employeeIds],
      equipmentIds: [params.equipmentIds],
    };

    const setParams: string[] = [];
    setParams.push("loan.name = $name");
    setParams.push("loan.startDate = $startDate");
    setParams.push("loan.endDate = $endDate");
    const set = setParams.join(", ");

    query.query += `
      MATCH (loan:Loan {id: $id})-[:BELONGS_TO]->(company)
      SET loan.updatedAt = datetime(),
      ${set}
    `;

    const relationships = [
      { relationshipName: "RECEIVES", param: "employeeIds", label: employeeMeta.labelName, relationshipToNode: false },
      { relationshipName: "LOANED_THROUGH", param: "equipmentIds", label: equipmentMeta.labelName, relationshipToNode: false }
    ];

    relationships.forEach(({ relationshipName, param, label, relationshipToNode }) => {
      query.query += updateRelationshipQuery({
        node: loanMeta.nodeName,
        relationshipName: relationshipName,
        relationshipToNode: relationshipToNode,
        label: label,
        param: param,
        values: params[param] ? (Array.isArray(params[param]) ? params[param] : [params[param]]) : [],
      });
    });

    await this.neo4j.writeOne(query);
  }

  async delete(params: { id: string }): Promise<void> {
    const query = this.neo4j.initQuery();

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
    };

    query.query += `
      MATCH (loan:Loan {id: $id})-[:BELONGS_TO]->(company)
      DETACH DELETE loan;
    `;

    await this.neo4j.writeOne(query);
  }

  async findByEmployee(params: {
    employeeId: string, 
    term?: string;
    orderBy?: string;
    fetchAll?: boolean;
    cursor?: JsonApiCursorInterface;
  }) {
    const query = this.neo4j.initQuery({ 
      serialiser: LoanModel,
      cursor: params.cursor,
      fetchAll: params.fetchAll,
     });

    query.queryParams = {
      ...query.queryParams,
      employeeId: params.employeeId,
      term: params.term,
    };

    if (params.term) {
      query.query += `
        CALL db.index.fulltext.queryNodes("loan_search_index", $term)
        YIELD node, score
        WHERE (node)-[:BELONGS_TO]->(company)

        WITH node as ${loanMeta.nodeName}, score
        ORDER BY score DESC
      `;
    } else {
      query.query += `
      ${this.loanCypherService.default()}
      ${this.securityService.userHasAccess({ validator: this.loanCypherService.userHasAccess })}
      
      ORDER BY ${loanMeta.nodeName}.${params.orderBy ? `${params.orderBy}` : `updatedAt DESC`}
    `;
    }

    query.query += `
      MATCH (${loanMeta.nodeName})<-[:RECEIVES]-(:${employeeMeta.labelName} {id: $employeeId})
      {CURSOR}

      ${this.loanCypherService.returnStatement()}
    `;

    return this.neo4j.readMany(query);
  }

  async findByEquipment(params: {
    equipmentId: string, 
    term?: string;
    orderBy?: string;
    fetchAll?: boolean;
    cursor?: JsonApiCursorInterface;
  }) {
    const query = this.neo4j.initQuery({ 
      serialiser: LoanModel,
      cursor: params.cursor,
      fetchAll: params.fetchAll,
     });

    query.queryParams = {
      ...query.queryParams,
      equipmentId: params.equipmentId,
      term: params.term,
    };

    if (params.term) {
      query.query += `
        CALL db.index.fulltext.queryNodes("loan_search_index", $term)
        YIELD node, score
        WHERE (node)-[:BELONGS_TO]->(company)

        WITH node as ${loanMeta.nodeName}, score
        ORDER BY score DESC
      `;
    } else {
      query.query += `
      ${this.loanCypherService.default()}
      ${this.securityService.userHasAccess({ validator: this.loanCypherService.userHasAccess })}
      
      ORDER BY ${loanMeta.nodeName}.${params.orderBy ? `${params.orderBy}` : `updatedAt DESC`}
    `;
    }

    query.query += `
      MATCH (${loanMeta.nodeName})<-[:LOANED_THROUGH]-(:${equipmentMeta.labelName} {id: $equipmentId})
      {CURSOR}

      ${this.loanCypherService.returnStatement()}
    `;

    return this.neo4j.readMany(query);
  }
}