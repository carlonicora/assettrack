import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Driver } from "neo4j-driver";

// Use global object to store state that persists across Jest module contexts
declare global {
  var __TEST_APP__: NestFastifyApplication | undefined;
  var __TEST_DRIVER__: Driver | undefined;
  var __ADMIN_TOKEN__: string | undefined;
  var __USER_TOKEN__: string | undefined;
  var __OTHER_TOKEN__: string | undefined;
}

// Global test state that will be shared across all test files
export const testState = {
  get app(): NestFastifyApplication | null {
    return global.__TEST_APP__ || null;
  },
  set app(value: NestFastifyApplication | null) {
    global.__TEST_APP__ = value || undefined;
  },
  get driver(): Driver | null {
    return global.__TEST_DRIVER__ || null;
  },
  set driver(value: Driver | null) {
    global.__TEST_DRIVER__ = value || undefined;
  },
  get token(): string | undefined {
    return global.__ADMIN_TOKEN__;
  },
  set token(value: string | undefined) {
    global.__ADMIN_TOKEN__ = value;
  },
  get userToken(): string | undefined {
    return global.__USER_TOKEN__;
  },
  set userToken(value: string | undefined) {
    global.__USER_TOKEN__ = value;
  },
  get companyTwoToken(): string | undefined {
    return global.__OTHER_TOKEN__;
  },
  set companyTwoToken(value: string | undefined) {
    global.__OTHER_TOKEN__ = value;
  },
};
