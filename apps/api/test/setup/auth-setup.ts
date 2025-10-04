import request from "supertest";
import { USERS } from "../data/fixtures/user";
import { testState } from "./test-state";

/**
 * Sets up authentication ONCE during global setup.
 * This should only be called from global-setup.ts
 */
export async function setupAuthentication(): Promise<void> {
  if (testState.token) return;

  testState.token = await getLoginToken({ email: USERS.CompanyOne_CompanyAdministrator.email });
  testState.userToken = await getLoginToken({ email: USERS.CompanyOne_User.email });
  testState.companyTwoToken = await getLoginToken({ email: USERS.CompanyTwo_CompanyAdministrator.email });
}

/**
 * Clears authentication state. Useful for tests that need to test unauthenticated scenarios.
 */
export function clearAuthentication(): void {
  testState.token = undefined;
}

export async function getLoginToken(props: { email: string }): Promise<string> {
  const app = testState.app!;

  const loginData = {
    data: {
      type: "auth",
      attributes: {
        email: props.email,
        password: "password",
      },
    },
  };

  const loginRes = await request(app.getHttpServer()).post("/auth/login").send(loginData).expect(201);

  return loginRes.body.data.attributes.token;
}
