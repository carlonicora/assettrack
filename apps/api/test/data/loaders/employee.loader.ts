import { EMPLOYEES } from "test/data/fixtures/employee";

export const generateEmployeeTestData = (): string[] => {
  const response: string[] = [];
  for (const employee of Object.values(EMPLOYEES)) {
    response.push(`
      CREATE (employee:Employee {
        id: "${employee.id}",
        name: "${employee.name}",
        phone: ${employee.phone ? `"${employee.phone}"` : "null"},
        email: ${employee.email ? `"${employee.email}"` : "null"},
        avatar: ${employee.avatar ? `"${employee.avatar}"` : "null"},
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH employee
      MATCH (company:Company {id: "${employee.company.id}"})
      MERGE (employee)-[:BELONGS_TO]->(company)
    `);
  }
  return response;
};
