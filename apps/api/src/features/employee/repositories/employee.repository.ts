import { HttpException, HttpStatus, Injectable, OnModuleInit } from "@nestjs/common";
import { JsonApiCursorInterface } from "src/core/jsonapi/interfaces/jsonapi.cursor.interface";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";
import { SecurityService } from "src/core/security/services/security.service";
import { Employee } from "src/features/employee/entities/employee.entity";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { EmployeeModel } from "src/features/employee/entities/employee.model";
import { EmployeeCypherService } from "src/features/employee/services/employee.cypher.service";

@Injectable()
export class EmployeeRepository implements OnModuleInit {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly employeeCypherService: EmployeeCypherService,
    private readonly securityService: SecurityService,
  ) {}

  async onModuleInit() {
    await this.neo4j.writeOne({
      query: `CREATE CONSTRAINT ${employeeMeta.nodeName}_id IF NOT EXISTS FOR (${employeeMeta.nodeName}:${employeeMeta.labelName}) REQUIRE ${employeeMeta.nodeName}.id IS UNIQUE`,
    });

    const indexName = "employee_search_index";
    const expectedProperties = ["name", "phone", "email", "avatar"];

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

    if (!match || !arraysEqual(labels, [employeeMeta.labelName]) || !arraysEqual(properties, expectedProperties)) {
      await this.neo4j.writeOne({
        query: `
          CREATE FULLTEXT INDEX \`${indexName}\` IF NOT EXISTS
          FOR (n:${[employeeMeta.labelName].map((l) => `\`${l}\``).join(" | ")})
          ON EACH [${expectedProperties.map((p) => `n.\`${p}\``).join(", ")}]
        `,
        queryParams: {},
      });
    }
  }

  private async _validateForbidden(params: {
    response: Employee | null;
    searchField: string;
    searchValue: string;
  }): Promise<Employee | null> {
    if (params.response) return params.response;

    const existsQuery = this.neo4j.initQuery({ serialiser: EmployeeModel });
    existsQuery.queryParams = { companyId: null, currentUserId: null, searchValue: params.searchValue };
    existsQuery.query = `
      ${this.employeeCypherService.default({ searchField: "id", blockCompanyAndUser: true })}
      ${this.employeeCypherService.returnStatement()}
    `;
    const exists = await this.neo4j.readOne(existsQuery);

    if (exists) throw new HttpException(`Forbidden`, HttpStatus.FORBIDDEN);
  }

  async find(params: {
    fetchAll?: boolean;
    term?: string;
    orderBy?: string;
    cursor?: JsonApiCursorInterface;
  }): Promise<Employee[]> {
    const query = this.neo4j.initQuery({
      cursor: params.cursor,
      serialiser: EmployeeModel,
      fetchAll: params.fetchAll,
    });

    query.queryParams = {
      ...query.queryParams,
      term: params.term,
    };

    if (params.term) {
      query.query += `CALL db.index.fulltext.queryNodes("employee_search_index", $term)
      YIELD node, score
      WHERE (node)-[:BELONGS_TO]->(company)

      WITH node as employee, score
      ORDER BY score DESC
    `;
    } else {
      query.query += `
      ${this.employeeCypherService.default()}
      ${this.securityService.userHasAccess({ validator: this.employeeCypherService.userHasAccess })}
      
      ORDER BY ${employeeMeta.nodeName}.${params.orderBy ? `${params.orderBy}` : `updatedAt DESC`}
    `;
    }

    query.query += `
      {CURSOR}

      ${this.employeeCypherService.returnStatement()}
    `;

    return this.neo4j.readMany(query);
  }

  async findById(params: { id: string }): Promise<Employee> {
    const query = this.neo4j.initQuery({ serialiser: EmployeeModel });

    query.queryParams = {
      ...query.queryParams,
      searchValue: params.id,
    };

    query.query += `
      ${this.employeeCypherService.default({ searchField: "id" })}
      ${this.securityService.userHasAccess({ validator: this.employeeCypherService.userHasAccess })}
      ${this.employeeCypherService.returnStatement()}
    `;

    return this._validateForbidden({
      response: await this.neo4j.readOne(query),
      searchField: "id",
      searchValue: params.id,
    });
  }

  async create(params: { id: string; name: string; phone?: string; email?: string; avatar?: string }): Promise<void> {
    const query = this.neo4j.initQuery();

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
      name: params.name,
      phone: params.phone ?? "",
      email: params.email ?? "",
      avatar: params.avatar ?? "",
    };

    query.query += `
      CREATE (employee:Employee {
        id: $id,
        name: $name,
        phone: $phone,
        email: $email,
        avatar: $avatar,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (employee)-[:BELONGS_TO]->(company)
    `;

    await this.neo4j.writeOne(query);
  }

  async put(params: { id: string; name: string; phone?: string; email?: string; avatar?: string }): Promise<void> {
    const query = this.neo4j.initQuery();

    query.queryParams = {
      ...query.queryParams,
      id: params.id,
      name: params.name ?? "",
      phone: params.phone ?? "",
      email: params.email ?? "",
      avatar: params.avatar ?? "",
    };

    const setParams: string[] = [];
    setParams.push("employee.name = $name");
    setParams.push("employee.phone = $phone");
    setParams.push("employee.email = $email");
    setParams.push("employee.avatar = $avatar");
    const set = setParams.join(", ");

    query.query += `
      MATCH (employee:Employee {id: $id})-[:BELONGS_TO]->(company)
      SET employee.updatedAt = datetime(),
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
      MATCH (employee:Employee {id: $id})-[:BELONGS_TO]->(company)
      DETACH DELETE employee;
    `;

    await this.neo4j.writeOne(query);
  }
}
