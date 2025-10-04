import { USERS } from "../fixtures/user";

export const generateUserTestData = (): string[] => {
  const response: string[] = [];
  for (const user of Object.values(USERS)) {
    response.push(`
      CREATE (user:User {
        id: "${user.id}",
        email: "${user.email}",
        name: "${user.name}",
        bio: "${user.bio}",
        isActive: ${user.isActive},
        isDeleted: ${user.isDeleted},
        password: "${user.password}",
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH user
      MATCH (company:Company {id: "${user.company.id}"})
      MERGE (user)-[:BELONGS_TO]->(company)
       ${user.roles
         .map(
           (role) => `
              WITH user
              MATCH (role:Role {id: "${role.id}"})
              MERGE (user)-[:MEMBER_OF]->(role)
          `,
         )
         .join("\n")}
    `);
  }
  return response;
};
