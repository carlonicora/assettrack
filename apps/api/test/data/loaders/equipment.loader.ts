import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const generateEquipmentTestData = (): string[] => {
  const response: string[] = [];
  for (const equipment of Object.values(EQUIPMENTS)) {
    response.push(`
      CREATE (equipment:Equipment {
        id: "${equipment.id}",
        name: "${equipment.name}",
        barcode: ${equipment.barcode ? `"${equipment.barcode}"` : "null"},
        description: ${equipment.description ? `"${equipment.description}"` : "null"},
        startDate: datetime("${equipment.startDate.toISOString()}"),
        endDate: ${equipment.endDate ? `datetime("${equipment.endDate.toISOString()}")` : "null"},
        status: "${equipment.status}",
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH equipment
      MATCH (company:Company {id: "${equipment.company.id}"})
      MERGE (equipment)-[:BELONGS_TO]->(company)
      WITH equipment
      MATCH (supplier:Supplier {id: "${equipment.supplier.id}"})
      MERGE (equipment)<-[:SUPPLIES]-(supplier)
    `);
  }
  return response;
};