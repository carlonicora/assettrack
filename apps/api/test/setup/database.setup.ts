import { TestDataManager } from "test/data/test-data-manager";

export async function createData(dataManager: TestDataManager): Promise<void> {
  await dataManager.createTestClassifications();
  await dataManager.createTestCompany();
  await dataManager.createTestUsers();
  await dataManager.createTestAccounts();
  await dataManager.createTestPersons();
  await dataManager.createTestProceedings();
  await dataManager.createTestDocuments();
  await dataManager.createTestCounterparts();
}
