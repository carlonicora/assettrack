import { LOANS } from "test/data/fixtures/loan";

export const generateLoanTestData = (): string[] => {
  const response: string[] = [];
  for (const loan of Object.values(LOANS)) {
    response.push(`
      CREATE (loan:Loan {
        id: "${loan.id}",
        startDate: datetime("${loan.startDate.toISOString()}"),
        endDate: ${loan.endDate ? `datetime("${loan.endDate.toISOString()}")` : "null"},
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH loan
      MATCH (company:Company {id: "${loan.company.id}"})
      MERGE (loan)-[:BELONGS_TO]->(company)
      WITH loan
      MATCH (employee:Employee {id: "${loan.employee.id}"})
      MERGE (loan)<-[:RECEIVES]-(employee)
      WITH loan
      MATCH (equipment:Equipment {id: "${loan.equipment.id}"})
      MERGE (loan)<-[:LOANED_THROUGH]-(equipment)
    `);
  }
  return response;
};