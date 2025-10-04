import { createData } from "test/setup/database.setup";
import { TestDataManager } from "../data/test-data-manager";
import { testState } from "./test-state";

// Track the current module to detect module changes
let currentModule: string | null = null;

// This runs before each test file
beforeAll(async () => {
  // Get the current test file path
  const testFilePath = expect.getState().testPath || "";

  // Extract module name from test file path
  const moduleMatch = testFilePath.match(/test\/tests\/([^/]+)\//);
  const moduleName = moduleMatch ? moduleMatch[1] : null;

  if (moduleName && moduleName !== currentModule) {
    if (testState.driver) {
      const dataManager = new TestDataManager(testState.driver);
      await dataManager.clearDatabase();

      // Recreate initial test data
      await createData(dataManager);
    }

    currentModule = moduleName;
  }
});
