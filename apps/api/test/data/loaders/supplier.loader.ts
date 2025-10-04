import { SUPPLIERS } from "test/data/fixtures/supplier";

export const generateSupplierTestData = (): string[] => {
  const response: string[] = [];
  for (const supplier of Object.values(SUPPLIERS)) {
    response.push(`
      CREATE (supplier:Supplier {
        id: "${supplier.id}",
        name: "${supplier.name}",
        address: ${supplier.address ? `"${supplier.address}"` : "null"},
        email: ${supplier.email ? `"${supplier.email}"` : "null"},
        phone: ${supplier.phone ? `"${supplier.phone}"` : "null"},
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH supplier
      MATCH (company:Company {id: "${supplier.company.id}"})
      MERGE (supplier)-[:BELONGS_TO]->(company)
    `);
  }
  return response;
};