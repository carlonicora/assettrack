import { COMPANIES } from "../fixtures/company";

export const generateCompanyTestData = (): string[] => {
  const response: string[] = [];
  for (const company of Object.values(COMPANIES)) {
    response.push(`
        CREATE (company:Company {
            id: "${company.id}", 
            name: "${company.name}", 
            availableTokens: ${company.availableTokens},
            createdAt: datetime(),
            updatedAt: datetime()
        })
        WITH company
        CREATE (configuration:Configuration {
            id: "${company.id}",
            aiApiKey: "${company.configurations.aiApiKey}",
            aiMaxConcurrentRequests: ${company.configurations.aiMaxConcurrentRequests},
            aiMaxRequestPerMinute: ${company.configurations.aiMaxRequestPerMinute},
            aiMaxTokensPerMinute: ${company.configurations.aiMaxTokensPerMinute},
            aiModel: "${company.configurations.aiModel}",
            aiType: "${company.configurations.aiType}",
            aiUrl: "${company.configurations.aiUrl}",
            emailApiKey: "${company.configurations.emailApiKey}",
            emailFrom: "${company.configurations.emailFrom}",
            emailHost: "${company.configurations.emailHost}",
            emailType: "${company.configurations.emailType}",
            emailUsername: "${company.configurations.emailUsername}",
            embedderApiKey: "${company.configurations.embedderApiKey}",
            embedderModel: "${company.configurations.embedderModel}",
            embedderType: "${company.configurations.embedderType}",
            s3Bucket: "${company.configurations.s3Bucket}",
            s3Endpoint: "${company.configurations.s3Endpoint}",
            s3Key: "${company.configurations.s3Key}",
            s3Region: "${company.configurations.s3Region}",
            s3Secret: "${company.configurations.s3Secret}",
            s3Type: "${company.configurations.s3Type}",
            securityRestrictDataToTaxonomy: ${company.configurations.securityRestrictDataToTaxonomy},
            allowPublicBot: ${company.configurations.allowPublicBot},
            transcriberApiKey: "${company.configurations.transcriberApiKey}",
            transcriberModel: "${company.configurations.transcriberModel}",
            transcriberType: "${company.configurations.transcriberType}",
            createdAt: datetime(),
            updatedAt: datetime()
        })
        MERGE (company)-[:HAS_CONFIGURATION]->(configuration)
    `);
  }
  return response;
};
