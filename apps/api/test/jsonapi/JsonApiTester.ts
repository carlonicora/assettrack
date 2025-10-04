import { JsonApiResponse, jsonApiValidator } from "../index";

export class BehaviourJsonApiTester {
  static validateBehaviourResponse(props: { response: any; expectedBehaviour?: any }): JsonApiResponse {
    const validated = jsonApiValidator.validateResponse(props.response, "behaviours");

    if (props.expectedBehaviour) {
      expect(validated.data.id).toBe(props.expectedBehaviour.id);
      expect(validated.data.attributes.name).toBe(props.expectedBehaviour.name);
      if (props.expectedBehaviour.description)
        expect(validated.data.attributes.description).toBe(props.expectedBehaviour.description);
    }

    return validated;
  }

  static validateBehaviourListResponse(props: { response: any; expectedBehaviours?: any[] }): JsonApiResponse {
    if (!props.response || typeof props.response !== "object") throw new Error("Response must be an object");
    if (!Array.isArray(props.response.data)) throw new Error("List response data must be an array");

    const list = props.response.data as any[];
    if (props.expectedBehaviours) {
      expect(list.length).toBe(props.expectedBehaviours.length);
      for (const expected of props.expectedBehaviours) {
        const found = list.find((d) => d.id === expected.id);
        if (!found) throw new Error(`Expected behaviour with id ${expected.id} not found in response`);
        // Validate each item with the central validator without duplicating rules
        jsonApiValidator.validateResponse({ data: found, included: props.response.included }, "behaviours");
        expect(found.attributes.name).toBe(expected.name);
        if (expected.description) expect(found.attributes.description).toBe(expected.description);
      }
    } else {
      // Still validate each item type/shape
      for (const item of list) {
        jsonApiValidator.validateResponse({ data: item, included: props.response.included }, "behaviours");
      }
    }

    return props.response as JsonApiResponse;
  }
}
