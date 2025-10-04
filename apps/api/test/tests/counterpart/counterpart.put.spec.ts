import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { COUNTERPARTS } from "test/data/fixtures/counterpart";
import { COUNTERPARTS } from "test/data/fixtures/counterpart";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { DOCUMENTS } from "test/data/fixtures/document";
import { counterpartMeta } from "src/features/counterpart/entities/counterpart.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { documentMeta } from "src/features/document/entities/document.meta";
import { jsonApiValidator } from "test/jsonapi";
import { testState } from "../../setup/test-state";

describe(`PUT /${counterpartMeta.endpoint}/{id}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 403 when unauthenticated`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .send(updateCounterpart)
      .expect(403);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 403 when updating resource from different company`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyTwo_Full.id,
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
        relationships: {
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: PROCEEDINGS.CompanyOne_Full.id
              }
            ]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(403);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 404 when resource does not exist`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "00000000-0000-0000-0000-000000000000",
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
        relationships: {
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: PROCEEDINGS.CompanyOne_Full.id
              }
            ]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(404);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 200 when updating all fields`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Nullable.id,
        attributes: {
          name: "Updated name",
          codiceFiscale: "Updated codiceFiscale",
          partitaIva: "Updated partitaIva",
          role: "Updated role",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: null
          },
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: PROCEEDINGS.CompanyOne_Full.id
              }
            ]
          },
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: COUNTERPARTS.CompanyOne_Nullable.id,
      company: COMPANIES.CompanyOne,
      counterpart: null,
      proceedings: [PROCEEDINGS.CompanyOne_Full],
      documents: [],
      name: "Updated name",
      codiceFiscale: "Updated codiceFiscale",
      partitaIva: "Updated partitaIva",
      role: "Updated role",
      isCompany: true,
    };

    // Validate the response structure matches expected entity
    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 200 when updating partial fields`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Partially Updated name",
          codiceFiscale: "Partially Updated codiceFiscale",
          partitaIva: "Partially Updated partitaIva",
          role: "Partially Updated role",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: null
          },
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: PROCEEDINGS.CompanyOne_Minimal.id
              }
            ]
          },
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(200);

    // Build expected entity based on PUT update - all values from request
    const expectedEntity = {
      id: COUNTERPARTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      counterpart: null,
      proceedings: [PROCEEDINGS.CompanyOne_Minimal],
      documents: [],
      name: "Partially Updated name",
      codiceFiscale: "Partially Updated codiceFiscale",
      partitaIva: "Partially Updated partitaIva",
      role: "Partially Updated role",
      isCompany: true,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 400 when body is malformed`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "",
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(400);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 400 when ID in path doesn't match body ID`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: "different-id-123e4567-e89b-12d3-a456-426614174000",
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(400);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 400 when relationship ID is invalid UUID`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: "invalid-uuid"
            }
          },
          proceedings: {
            data: [{
              type: proceedingMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
          documents: {
            data: [{
              type: documentMeta.endpoint,
              id: "invalid-uuid"
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(400);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 400 when relationship ID does not exist`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Full.id,
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
        relationships: {
          counterpart: {
            data: {
              type: counterpartMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }
          },
          proceedings: {
            data: [{
              type: proceedingMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
          documents: {
            data: [{
              type: documentMeta.endpoint,
              id: "00000000-0000-0000-0000-000000000000"
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(400);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 400 when relationship type is incorrect`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyTwo_Nullable.id,
        attributes: {
          name: "Updated name",
          isCompany: false,
        },
        relationships: {
          counterpart: {
            data: {
              type: "wrong-type",
              id: COUNTERPARTS.CompanyOne_Full.id
            }
          },
          proceedings: {
            data: [{
              type: "wrong-type",
              id: PROCEEDINGS.CompanyOne_Full.id
            }]
          },
          documents: {
            data: [{
              type: "wrong-type",
              id: DOCUMENTS.CompanyOne_Full.id
            }]
          },
        },
      },
    };

    await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyTwo_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(400);
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 200 when updating with multiple array relationships`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Minimal.id,
        attributes: {
          name: "Updated Multiple name",
          codiceFiscale: "Updated Multiple codiceFiscale",
          partitaIva: "Updated Multiple partitaIva",
          role: "Updated Multiple role",
          isCompany: true,
        },
        relationships: {
          counterpart: {
            data: null
          },
          proceedings: {
            data: [
              {
                type: proceedingMeta.endpoint,
                id: PROCEEDINGS.CompanyOne_Full.id
              },
              {
                type: proceedingMeta.endpoint,
                id: PROCEEDINGS.CompanyOne_Nullable.id
              }
            ]
          },
          documents: {
            data: [
              {
                type: documentMeta.endpoint,
                id: DOCUMENTS.CompanyOne_Full.id
              },
              {
                type: documentMeta.endpoint,
                id: DOCUMENTS.CompanyOne_Nullable.id
              }
            ]
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: COUNTERPARTS.CompanyOne_Minimal.id,
      company: COMPANIES.CompanyOne,
      counterpart: null,
      proceedings: [PROCEEDINGS.CompanyOne_Full, PROCEEDINGS.CompanyOne_Nullable],
      documents: [DOCUMENTS.CompanyOne_Full, DOCUMENTS.CompanyOne_Nullable],
      name: "Updated Multiple name",
      codiceFiscale: "Updated Multiple codiceFiscale",
      partitaIva: "Updated Multiple partitaIva",
      role: "Updated Multiple role",
      isCompany: true,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedEntity,
    });
  });

  it(`PUT /${counterpartMeta.endpoint}/{id} → 200 when clearing nullable array relationships`, async () => {
    const updateCounterpart = {
      data: {
        type: counterpartMeta.endpoint,
        id: COUNTERPARTS.CompanyOne_Full.id,
        attributes: {
          name: "Cleared Relationships name",
          codiceFiscale: "Cleared Relationships name",
          partitaIva: "Cleared Relationships name",
          role: "Cleared Relationships name",
          isCompany: false,
        },
        relationships: {
          counterpart: {
            data: null
          },
          proceedings: {
            data: []
          },
          documents: {
            data: []
          },
        },
      },
    };

    const res = await request(app.getHttpServer())
      .put(`/${counterpartMeta.endpoint}/${COUNTERPARTS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .send(updateCounterpart)
      .expect(200);

    // Build expected entity based on the update data - PUT replaces ALL values
    const expectedEntity = {
      id: COUNTERPARTS.CompanyOne_Full.id,
      company: COMPANIES.CompanyOne,
      counterpart: null,
      proceedings: [],
      documents: [],
      name: "Cleared Relationships name",
      codiceFiscale: "Cleared Relationships name",
      partitaIva: "Cleared Relationships name",
      role: "Cleared Relationships name",
      isCompany: false,
    };

    jsonApiValidator.validateResponse({
      body: res.body,
      type: counterpartMeta.endpoint,
      expected: expectedEntity,
    });
  });
});