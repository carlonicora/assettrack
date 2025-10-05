import { ANALYTICS } from "test/data/fixtures/analytic";

export const generateAnalyticTestData = (): string[] => {
  const response: string[] = [];
  for (const analytic of Object.values(ANALYTICS)) {
    response.push(`
      CREATE (analytic:Analytic {
        id: "${analytic.id}",
        equipment: ${analytic.equipment},
        loan: ${analytic.loan},
        expiring30: ${analytic.expiring30},
        expiring60: ${analytic.expiring60},
        expiring90: ${analytic.expiring90},
        expired: ${analytic.expired},
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH analytic
      MATCH (company:Company {id: "${analytic.company.id}"})
      MERGE (analytic)-[:BELONGS_TO]->(company)
    `);
  }
  return response;
};
