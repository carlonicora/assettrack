// Load environment variables FIRST before any other imports
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.e2e" });

// Register tsconfig paths before any imports that use path mapping
import { register } from "tsconfig-paths";
register({
  baseUrl: "./",
  paths: {
    "src/*": ["src/*"],
  },
});

import { ValidationPipe } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import neo4j, { Driver } from "neo4j-driver";
import { createData } from "test/setup/database.setup";
import { AppModule } from "../../src/app.module";
import { AppMode } from "../../src/core/appmode/constants/app.mode.constant";
import { TestDataManager } from "../data/test-data-manager";
import { testState } from "./test-state";

export class TestSetup {
  static get app(): NestFastifyApplication {
    return testState.app!;
  }

  static get driver(): Driver {
    return testState.driver!;
  }

  static async setupApplication(): Promise<void> {
    try {
      const testModeConfig = {
        mode: AppMode.API,
        enableControllers: true,
        enableWorkers: false,
        enableCronJobs: false,
      };

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot(testModeConfig)],
      }).compile();

      testState.app = moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter({
          ignoreTrailingSlash: true,
          bodyLimit: 30 * 1024 * 1024,
        }),
      );

      // Apply the same ValidationPipe configuration as in main.ts
      testState.app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
          validateCustomDecorators: true,
          stopAtFirstError: false,
          enableDebugMessages: true,
        }),
      );

      await testState.app.init();
      await testState.app.getHttpAdapter().getInstance().ready();
    } catch (error) {
      console.error("❌ Failed to setup application:", error);
      throw error;
    }
  }

  static async setupNeo4j(): Promise<void> {
    testState.driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
    );

    const testSession = testState.driver.session({ database: process.env.NEO4J_DATABASE });
    try {
      await testSession.run("RETURN 1");

      const dataManager = new TestDataManager(testState.driver);
      await dataManager.clearDatabase(true);
    } catch (error) {
      console.error("❌ Failed to connect to Neo4j or setup test data:", error);
      throw error;
    } finally {
      await testSession.close();
    }
  }

  static async createTestData(): Promise<void> {
    const testSession = testState.driver.session({ database: process.env.NEO4J_DATABASE });
    try {
      const dataManager = new TestDataManager(testState.driver);

      await createData(dataManager);
    } catch (error) {
      console.error("❌ Failed to connect to Neo4j or setup test data:", error);
      throw error;
    } finally {
      await testSession.close();
    }
  }

  static async teardown(): Promise<void> {
    try {
      if (testState.app) {
        await testState.app.close();
        testState.app = null;
      }

      if (testState.driver) {
        await testState.driver.close();
        testState.driver = null;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("❌ Error during teardown:", error);
    }
  }
}

export default async (): Promise<void> => {
  try {
    await TestSetup.setupNeo4j();
    await TestSetup.setupApplication();
    await TestSetup.createTestData();

    const { setupAuthentication } = await import("./auth-setup");
    await setupAuthentication();
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  }
};
