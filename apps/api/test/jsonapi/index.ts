import { COMPANIES } from "test/data/fixtures/company";
import { USERS } from "test/data/fixtures/user";
import { authValidator } from "test/jsonapi/validators/authValidator";
import { companyValidator } from "test/jsonapi/validators/companyValidator";
import { roleValidator } from "test/jsonapi/validators/roleValidator";
import { userValidator } from "test/jsonapi/validators/userValidator";
import { jsonApiValidator } from "./JsonApiValidator";

// Register all validators
jsonApiValidator.registerValidator(authValidator);
jsonApiValidator.registerValidator(userValidator, USERS);
jsonApiValidator.registerValidator(companyValidator, COMPANIES);
jsonApiValidator.registerValidator(roleValidator);

export { ValidationContext } from "./JsonApiValidator";
export * from "./types";
export { jsonApiValidator };
