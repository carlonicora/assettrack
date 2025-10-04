import { JsonApiRelationshipData, JsonApiResponse } from "./types";

export interface ValidationContext {
  [key: string]: any;
}

export interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "array" | "object" | "date" | "boolstring";
}

export interface RelationshipRule {
  type: string;
  isArray?: boolean;
  context?: string;
  validate?: (params: { id: string; relatedType: string }) => any;
  relationships?: { [key: string]: RelationshipRule };
}

export interface ResourceValidator {
  type: string;
  attributes: { [key: string]: ValidationRule };
  meta?: { [key: string]: ValidationRule };
  relationships?: { [key: string]: RelationshipRule };
}

export class JsonApiValidator {
  private validators = new Map<string, ResourceValidator>();
  private data = new Map<string, any>();

  registerValidator(validator: ResourceValidator, validatorData?: any): void {
    this.validators.set(validator.type, validator);
    if (validatorData) this.data.set(validator.type, validatorData);
  }

  validateResponseList(params: { body: any; type: string; expected: any[] }): void {
    const { body, type, expected } = params;

    if (!body || typeof body !== "object") throw new Error("Response must be an object");
    if (!Array.isArray(body.data)) throw new Error("List response data must be an array");

    const responseItems = body.data as any[];
    expect(responseItems.length).toBe(expected.length ?? 0);

    for (const expectedItem of expected) {
      const found = responseItems.find((d) => d.id === expectedItem.id);
      if (!found) throw new Error(`Expected ${type} with id ${expectedItem.id} not found in response`);
      jsonApiValidator.validateResponse({
        body: { data: found, included: body.included },
        type: type,
        expected: expectedItem,
      });
    }
  }

  validateResponse(params: {
    body: JsonApiResponse | any;
    type: string;
    expected?: any;
    validatorRelationships?: RelationshipRule;
  }): void {
    this._validateBasicStructure({ data: params.body.data });
    if (!params.expected) return;

    this._validateResource({
      resource: params.body as JsonApiResponse,
      type: params.type,
      context: params.expected,
      validatorRelationships: params.validatorRelationships,
    });
  }

  private _validateBasicStructure(params: { data: any }): void {
    const { data } = params;

    if (!data || typeof data !== "object") throw new Error("Response must be an object");
    if (!data.type || typeof data.type !== "string") throw new Error("Data must have a string type property");
    if (!data.id || typeof data.id !== "string") throw new Error("Data must have a string id property");
    if (!data.attributes || typeof data.attributes !== "object") throw new Error("Data must have an attributes object");
  }

  private _validateResource(params: {
    resource: JsonApiResponse;
    type: string;
    context: ValidationContext;
    validatorRelationships?: RelationshipRule;
  }): void {
    const { resource, type, context } = params;

    expect(resource.data.type).toBe(type);
    expect(resource.data.id).toBe(context.id);

    const validator = this.validators.get(type);
    if (!validator) throw new Error(`No validator registered for type: ${type}`);

    this._validateAttributes({
      attributes: resource.data.attributes,
      rules: validator.attributes,
      context: context,
    });

    if (resource.meta && validator.meta)
      this._validateAttributes({
        attributes: resource.data.meta,
        rules: validator.meta,
        context: context,
      });

    if (resource.data.relationships && (params.validatorRelationships || validator.relationships))
      this._validateRelationships({
        resource: params.resource,
        relationshipRules: params.validatorRelationships?.relationships || validator.relationships,
        context: context,
      });
  }

  private _validateRelationships(params: {
    resource: JsonApiResponse;
    relationshipRules: { [key: string]: RelationshipRule };
    context: ValidationContext;
  }): void {
    const { resource, relationshipRules, context } = params;

    for (const [fieldName, rule] of Object.entries(relationshipRules)) {
      const relationship = resource.data.relationships[fieldName];
      const relationshipData = resource.included?.filter((r) => r.type === rule.type);

      if (!relationship?.data || !relationshipData) continue;

      if (rule.isArray) {
        if (!Array.isArray(relationship.data)) throw new Error(`Relationship ${fieldName} should be an array`);

        relationship.data.forEach((item) => {
          expect(item.type).toBe(rule.type);

          const subData = relationshipData.find((r) => r.id === item.id && r.type === rule.type);
          if (!subData) throw new Error(`Sub-resource not found for relationship ${fieldName}`);

          const subContext = this._generateSubContext({
            fieldName: fieldName,
            rule: rule,
            context: context,
            item: item,
          });
          if (!subContext) throw new Error(`Sub-context not found for relationship ${fieldName}`);

          const subResource = { data: subData, included: resource.included };

          this.validateResponse({
            body: subResource,
            type: rule.type,
            expected: subContext,
            validatorRelationships: relationshipRules[fieldName],
          });
        });
      } else {
        expect((relationship.data as JsonApiRelationshipData).type).toBe(rule.type);

        const subData = relationshipData.find(
          (r) => r.id === (relationship.data as JsonApiRelationshipData).id && r.type === rule.type,
        );
        if (!subData) throw new Error(`Sub-resource not found for relationship ${fieldName}`);

        const subContext = this._generateSubContext({
          fieldName: fieldName,
          rule: rule,
          context: context,
        });
        if (!subContext) throw new Error(`Sub-context not found for relationship ${fieldName}`);

        const subResource = { data: subData, included: resource.included };
        this.validateResponse({ body: subResource, type: rule.type, expected: subContext });
      }
    }
  }

  private _generateSubContext(params: {
    fieldName: string;
    rule: RelationshipRule;
    context: ValidationContext;
    item?: any;
  }): any {
    const { fieldName, rule, context, item } = params;
    if (rule.context) {
      const splittedRule = rule.context.split(".");
      if (splittedRule.length === 1) {
        if (item) return context[splittedRule[0]].find((c) => c.id === item.id);
        return context[splittedRule[0]][splittedRule[1]];
      }

      if (item) return context[splittedRule[0]].map((c) => c[splittedRule[1]]).find((c) => c.id === item.id);
      return context[splittedRule[0]].map((c) => c[splittedRule[1]]);
    }

    if (item) return context[fieldName].find((c) => c.id === item.id);
    return context[fieldName];
  }

  private _validateAttributes(params: {
    attributes: any;
    rules: { [key: string]: ValidationRule };
    context: ValidationContext;
  }): void {
    const { attributes, rules, context } = params;
    const processedFields = new Set<string>();

    expect(attributes.least).toBe(rules.length);

    for (const [fieldName, rule] of Object.entries(rules)) {
      const value = attributes[fieldName];
      processedFields.add(fieldName);

      if (rule.required && (value === undefined || value === null))
        throw new Error(`Required field ${fieldName} is missing`);

      if (value === undefined || value === null) continue;

      if (
        !this._validateType({
          value: value,
          expectedType: rule.type,
        })
      ) {
        console.error(`Type validation failed for field: ${fieldName}`);
        console.error(`Expected type: ${rule.type}`);
        console.error(`Actual type: ${typeof value}`);
        console.error(`Value:`, value);
        throw new Error(`Field ${fieldName} must be of type ${rule.type}, got ${typeof value}`);
      }

      if (rule.required && value) expect(value).toBe(context[fieldName]);
    }
  }

  private _validateType(params: { value: any; expectedType?: string }): boolean {
    const { value, expectedType } = params;

    switch (expectedType) {
      case undefined:
      case "string":
      case "boolstring":
      case "date":
        return typeof value === "string";
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "array":
        return Array.isArray(value);
      case "object":
        return typeof value === "object" && !Array.isArray(value);
      default:
        return false;
    }
  }
}

export const jsonApiValidator = new JsonApiValidator();
