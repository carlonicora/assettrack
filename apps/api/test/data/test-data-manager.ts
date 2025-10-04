import { Driver } from "neo4j-driver";
import { generateCompanyTestData } from "./loaders/company.loader";
import { generateUserTestData } from "./loaders/user.loader";

export class TestDataManager {
  constructor(private driver: Driver) {}

  async executeQuery(query: string, params: any = {}): Promise<any> {
    const session = this.driver.session({ database: process.env.NEO4J_DATABASE });
    try {
      const result = await session.run(query, params);
      return result;
    } catch (error) {
      console.error("💥 Query failed:", error.message);
      console.error("💥 Query was:", query);
      throw error;
    } finally {
      await session.close();
    }
  }

  async clearDatabase(full?: boolean): Promise<void> {
    try {
      // Delete only test data, preserve system data and authentication data
      if (full) {
        await this.executeQuery(`
        MATCH (n)
        DETACH DELETE n
      `);
      } else {
        await this.executeQuery(`
        MATCH (n)
        WHERE NOT n:Feature
        AND NOT n:Module
        AND NOT n:Migration
        AND NOT n:Role
        AND NOT n:Auth
        AND NOT n:AuthCode
        DETACH DELETE n
      `);
      }
    } catch (error) {
      console.error("❌ Failed to clear test data:", error);
      throw error;
    }
  }

  async createTestCompany(): Promise<void> {
    const companyData = generateCompanyTestData();

    for (const query of companyData) {
      await this.executeQuery(query);
    }
  }

  async createTestUsers(): Promise<void> {
    const users = generateUserTestData();

    for (const query of users) {
      await this.executeQuery(query);
    }
  }
}
