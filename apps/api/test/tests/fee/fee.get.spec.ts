import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { feeMeta } from "src/features/fee/entities/fee.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { FEES } from "test/data/fixtures/fee";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { STAGES } from "test/data/fixtures/stage";
import { RANGES } from "test/data/fixtures/range";
import { FEES } from "test/data/fixtures/fee";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { stageMeta } from "src/features/stage/entities/stage.meta";
import { rangeMeta } from "src/features/range/entities/range.meta";
import { feeMeta } from "src/features/fee/entities/fee.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${feeMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${feeMeta.endpoint}/:feeId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${feeMeta.endpoint}/:feeId → 403 when fee from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${FEES.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${feeMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${feeMeta.endpoint}`).expect(403);
  });

  it(`GET /${feeMeta.endpoint}/:feeId → 200 returns fee with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${FEES.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: feeMeta.endpoint,
      expected: FEES.CompanyOne_Full,
    });
  });

  it(`GET /${feeMeta.endpoint}/:feeId → 200 returns fee with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${FEES.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: feeMeta.endpoint,
      expected: FEES.CompanyOne_Nullable,
    });
  });

  it(`GET /${feeMeta.endpoint}/:feeId → 200 returns fee with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${FEES.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: feeMeta.endpoint,
      expected: FEES.CompanyOne_Minimal,
    });
  });

  it(`GET /${feeMeta.endpoint}/:feeId → 404 when fee does not exist`, async () => {
    const nonExistentFeeId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${nonExistentFeeId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${feeMeta.endpoint} → 200 returns all fees for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(FEES).filter((f) => f.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${feeMeta.endpoint}?search=CompanyOne → 200 returns filtered fees`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: [FEES.CompanyOne_Full, FEES.CompanyOne_Nullable, FEES.CompanyOne_Minimal],
    });
  });

  it(`GET /${feeMeta.endpoint}?search=Full → 200 returns filtered fees by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: [FEES.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${classificationMeta.endpoint}/:classificationId/${feeMeta.endpoint} → 200 returns fees by classification`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classification?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${feeMeta.endpoint} → 200 returns empty list when classification does not exist`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const nonExistentClassificationId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${nonExistentClassificationId}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${feeMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${feeMeta.endpoint}?search=term → 200 returns filtered fees by classification and search`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classification?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${stageMeta.endpoint}/:stageId/${feeMeta.endpoint} → 200 returns fees by stage`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof STAGES === 'undefined') return;

    const companyOneFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.stage?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${stageMeta.endpoint}/:stageId/${feeMeta.endpoint} → 200 returns empty list when stage does not exist`, async () => {
    if (typeof STAGES === 'undefined') return;

    const nonExistentStageId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${nonExistentStageId}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${stageMeta.endpoint}/:stageId/${feeMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof STAGES === 'undefined') return;

    const companyOneFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${stageMeta.endpoint}/:stageId/${feeMeta.endpoint}?search=term → 200 returns filtered fees by stage and search`, async () => {
    if (typeof STAGES === 'undefined') return;

    const companyOneFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.stage?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${rangeMeta.endpoint}/:rangeId/${feeMeta.endpoint} → 200 returns fees by range`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof RANGES === 'undefined') return;

    const companyOneFixtures = Object.values(RANGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${rangeMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.range?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${rangeMeta.endpoint}/:rangeId/${feeMeta.endpoint} → 200 returns empty list when range does not exist`, async () => {
    if (typeof RANGES === 'undefined') return;

    const nonExistentRangeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${rangeMeta.endpoint}/${nonExistentRangeId}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${rangeMeta.endpoint}/:rangeId/${feeMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof RANGES === 'undefined') return;

    const companyOneFixtures = Object.values(RANGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${rangeMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${rangeMeta.endpoint}/:rangeId/${feeMeta.endpoint}?search=term → 200 returns filtered fees by range and search`, async () => {
    if (typeof RANGES === 'undefined') return;

    const companyOneFixtures = Object.values(RANGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${rangeMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.range?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${feeMeta.endpoint}/:feeId/${feeMeta.endpoint} → 200 returns fees by fee`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof FEES === 'undefined') return;

    const companyOneFixtures = Object.values(FEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.fee?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${feeMeta.endpoint}/:feeId/${feeMeta.endpoint} → 200 returns empty list when fee does not exist`, async () => {
    if (typeof FEES === 'undefined') return;

    const nonExistentFeeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${nonExistentFeeId}/${feeMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${feeMeta.endpoint}/:feeId/${feeMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof FEES === 'undefined') return;

    const companyOneFixtures = Object.values(FEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${feeMeta.endpoint}/:feeId/${feeMeta.endpoint}?search=term → 200 returns filtered fees by fee and search`, async () => {
    if (typeof FEES === 'undefined') return;

    const companyOneFixtures = Object.values(FEES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${feeMeta.endpoint}/${companyOneFixtures[0].id}/${feeMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(FEES).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.fee?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: feeMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});