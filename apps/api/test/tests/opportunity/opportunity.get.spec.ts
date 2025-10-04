import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { opportunityMeta } from "src/features/opportunity/entities/opportunity.meta";
import request from "supertest";
import { COMPANIES } from "test/data/fixtures/company";
import { jsonApiValidator } from "test/jsonapi";
import { OPPORTUNITYS } from "test/data/fixtures/opportunity";
import { CLASSIFICATIONS } from "test/data/fixtures/classification";
import { STAGES } from "test/data/fixtures/stage";
import { ACCOUNTS } from "test/data/fixtures/account";
import { PERSONS } from "test/data/fixtures/person";
import { PIPELINES } from "test/data/fixtures/pipeline";
import { ANSWERS } from "test/data/fixtures/answer";
import { PROCEEDINGS } from "test/data/fixtures/proceeding";
import { PAINS } from "test/data/fixtures/pain";
import { VALUES } from "test/data/fixtures/value";
import { OBJECTIONS } from "test/data/fixtures/objection";
import { REBUTTALS } from "test/data/fixtures/rebuttal";
import { classificationMeta } from "src/features/classification/entities/classification.meta";
import { stageMeta } from "src/features/stage/entities/stage.meta";
import { accountMeta } from "src/features/account/entities/account.meta";
import { personMeta } from "src/features/person/entities/person.meta";
import { pipelineMeta } from "src/features/pipeline/entities/pipeline.meta";
import { answerMeta } from "src/features/answer/entities/answer.meta";
import { proceedingMeta } from "src/features/proceeding/entities/proceeding.meta";
import { painMeta } from "src/features/pain/entities/pain.meta";
import { valueMeta } from "src/features/value/entities/value.meta";
import { objectionMeta } from "src/features/objection/entities/objection.meta";
import { rebuttalMeta } from "src/features/rebuttal/entities/rebuttal.meta";
import { testState } from "../../setup/test-state";

describe(`GET /${opportunityMeta.endpoint}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (!testState.app) {
      throw new Error("testState.app is not initialized. Global setup may have failed.");
    }
    app = testState.app;
  });

  it(`GET /${opportunityMeta.endpoint}/:opportunityId → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .expect(403);
  });

  it(`GET /${opportunityMeta.endpoint}/:opportunityId → 403 when opportunity from another company`, async () => {
    await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyTwo_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(403);
  });

  it(`GET /${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    await request(app.getHttpServer()).get(`/${opportunityMeta.endpoint}`).expect(403);
  });

  it(`GET /${opportunityMeta.endpoint}/:opportunityId → 200 returns opportunity with full data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Full.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: OPPORTUNITYS.CompanyOne_Full,
    });
  });

  it(`GET /${opportunityMeta.endpoint}/:opportunityId → 200 returns opportunity with nullable data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Nullable.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: OPPORTUNITYS.CompanyOne_Nullable,
    });
  });

  it(`GET /${opportunityMeta.endpoint}/:opportunityId → 200 returns opportunity with minimal data`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}/${OPPORTUNITYS.CompanyOne_Minimal.id}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    jsonApiValidator.validateResponse({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: OPPORTUNITYS.CompanyOne_Minimal,
    });
  });

  it(`GET /${opportunityMeta.endpoint}/:opportunityId → 404 when opportunity does not exist`, async () => {
    const nonExistentOpportunityId = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}/${nonExistentOpportunityId}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(404);
  });

  it(`GET /${opportunityMeta.endpoint} → 200 returns all opportunitys for the company`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    const companyOneFixtures = Object.values(OPPORTUNITYS).filter((o) => o.company.id === COMPANIES.CompanyOne.id);

    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: companyOneFixtures,
    });
  });

  it(`GET /${opportunityMeta.endpoint}?search=CompanyOne → 200 returns filtered opportunitys`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: [OPPORTUNITYS.CompanyOne_Full, OPPORTUNITYS.CompanyOne_Nullable, OPPORTUNITYS.CompanyOne_Minimal],
    });
  });

  it(`GET /${opportunityMeta.endpoint}?search=Full → 200 returns filtered opportunitys by Full type`, async () => {
    const res = await request(app.getHttpServer())
      .get(`/${opportunityMeta.endpoint}?search=Full`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: [OPPORTUNITYS.CompanyOne_Full],
    });
  });


  // Other relationship tests - only if fixtures exist
  it(`GET /${classificationMeta.endpoint}/:classificationId/${opportunityMeta.endpoint} → 200 returns opportunitys by classification`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classification?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${opportunityMeta.endpoint} → 200 returns empty list when classification does not exist`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const nonExistentClassificationId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${nonExistentClassificationId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${classificationMeta.endpoint}/:classificationId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by classification and search`, async () => {
    if (typeof CLASSIFICATIONS === 'undefined') return;

    const companyOneFixtures = Object.values(CLASSIFICATIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${classificationMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.classification?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${stageMeta.endpoint}/:stageId/${opportunityMeta.endpoint} → 200 returns opportunitys by stage`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof STAGES === 'undefined') return;

    const companyOneFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.stages?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${stageMeta.endpoint}/:stageId/${opportunityMeta.endpoint} → 200 returns empty list when stage does not exist`, async () => {
    if (typeof STAGES === 'undefined') return;

    const nonExistentStageId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${nonExistentStageId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${stageMeta.endpoint}/:stageId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof STAGES === 'undefined') return;

    const companyOneFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${stageMeta.endpoint}/:stageId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by stage and search`, async () => {
    if (typeof STAGES === 'undefined') return;

    const companyOneFixtures = Object.values(STAGES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${stageMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.stages?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${accountMeta.endpoint}/:accountId/${opportunityMeta.endpoint} → 200 returns opportunitys by account`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.account?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${opportunityMeta.endpoint} → 200 returns empty list when account does not exist`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const nonExistentAccountId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${nonExistentAccountId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${accountMeta.endpoint}/:accountId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by account and search`, async () => {
    if (typeof ACCOUNTS === 'undefined') return;

    const companyOneFixtures = Object.values(ACCOUNTS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${accountMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.account?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${personMeta.endpoint}/:personId/${opportunityMeta.endpoint} → 200 returns opportunitys by person`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PERSONS === 'undefined') return;

    const companyOneFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.person?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${personMeta.endpoint}/:personId/${opportunityMeta.endpoint} → 200 returns empty list when person does not exist`, async () => {
    if (typeof PERSONS === 'undefined') return;

    const nonExistentPersonId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${nonExistentPersonId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${personMeta.endpoint}/:personId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PERSONS === 'undefined') return;

    const companyOneFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${personMeta.endpoint}/:personId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by person and search`, async () => {
    if (typeof PERSONS === 'undefined') return;

    const companyOneFixtures = Object.values(PERSONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${personMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.person?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${pipelineMeta.endpoint}/:pipelineId/${opportunityMeta.endpoint} → 200 returns opportunitys by pipeline`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PIPELINES === 'undefined') return;

    const companyOneFixtures = Object.values(PIPELINES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pipeline?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId/${opportunityMeta.endpoint} → 200 returns empty list when pipeline does not exist`, async () => {
    if (typeof PIPELINES === 'undefined') return;

    const nonExistentPipelineId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${nonExistentPipelineId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PIPELINES === 'undefined') return;

    const companyOneFixtures = Object.values(PIPELINES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${pipelineMeta.endpoint}/:pipelineId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by pipeline and search`, async () => {
    if (typeof PIPELINES === 'undefined') return;

    const companyOneFixtures = Object.values(PIPELINES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${pipelineMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pipeline?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${answerMeta.endpoint}/:answerId/${opportunityMeta.endpoint} → 200 returns opportunitys by answer`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof ANSWERS === 'undefined') return;

    const companyOneFixtures = Object.values(ANSWERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.answers?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${answerMeta.endpoint}/:answerId/${opportunityMeta.endpoint} → 200 returns empty list when answer does not exist`, async () => {
    if (typeof ANSWERS === 'undefined') return;

    const nonExistentAnswerId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${nonExistentAnswerId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${answerMeta.endpoint}/:answerId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof ANSWERS === 'undefined') return;

    const companyOneFixtures = Object.values(ANSWERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${answerMeta.endpoint}/:answerId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by answer and search`, async () => {
    if (typeof ANSWERS === 'undefined') return;

    const companyOneFixtures = Object.values(ANSWERS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${answerMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.answers?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${opportunityMeta.endpoint} → 200 returns opportunitys by proceeding`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.proceeding?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${opportunityMeta.endpoint} → 200 returns empty list when proceeding does not exist`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const nonExistentProceedingId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${nonExistentProceedingId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${proceedingMeta.endpoint}/:proceedingId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by proceeding and search`, async () => {
    if (typeof PROCEEDINGS === 'undefined') return;

    const companyOneFixtures = Object.values(PROCEEDINGS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${proceedingMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.proceeding?.id === companyOneFixtures[0].id);
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${painMeta.endpoint}/:painId/${opportunityMeta.endpoint} → 200 returns opportunitys by pain`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pains?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${painMeta.endpoint}/:painId/${opportunityMeta.endpoint} → 200 returns empty list when pain does not exist`, async () => {
    if (typeof PAINS === 'undefined') return;

    const nonExistentPainId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${nonExistentPainId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${painMeta.endpoint}/:painId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${painMeta.endpoint}/:painId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by pain and search`, async () => {
    if (typeof PAINS === 'undefined') return;

    const companyOneFixtures = Object.values(PAINS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${painMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.pains?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${valueMeta.endpoint}/:valueId/${opportunityMeta.endpoint} → 200 returns opportunitys by value`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof VALUES === 'undefined') return;

    const companyOneFixtures = Object.values(VALUES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.values?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${valueMeta.endpoint}/:valueId/${opportunityMeta.endpoint} → 200 returns empty list when value does not exist`, async () => {
    if (typeof VALUES === 'undefined') return;

    const nonExistentValueId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${nonExistentValueId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${valueMeta.endpoint}/:valueId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof VALUES === 'undefined') return;

    const companyOneFixtures = Object.values(VALUES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${valueMeta.endpoint}/:valueId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by value and search`, async () => {
    if (typeof VALUES === 'undefined') return;

    const companyOneFixtures = Object.values(VALUES).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${valueMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.values?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${objectionMeta.endpoint}/:objectionId/${opportunityMeta.endpoint} → 200 returns opportunitys by objection`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof OBJECTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.objections?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId/${opportunityMeta.endpoint} → 200 returns empty list when objection does not exist`, async () => {
    if (typeof OBJECTIONS === 'undefined') return;

    const nonExistentObjectionId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${nonExistentObjectionId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof OBJECTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${objectionMeta.endpoint}/:objectionId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by objection and search`, async () => {
    if (typeof OBJECTIONS === 'undefined') return;

    const companyOneFixtures = Object.values(OBJECTIONS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${objectionMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.objections?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
  // Other relationship tests - only if fixtures exist
  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId/${opportunityMeta.endpoint} → 200 returns opportunitys by rebuttal`, async () => {
    // Check if relationship fixtures exist and are accessible
    if (typeof REBUTTALS === 'undefined') return;

    const companyOneFixtures = Object.values(REBUTTALS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.rebuttals?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId/${opportunityMeta.endpoint} → 200 returns empty list when rebuttal does not exist`, async () => {
    if (typeof REBUTTALS === 'undefined') return;

    const nonExistentRebuttalId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${nonExistentRebuttalId}/${opportunityMeta.endpoint}`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId/${opportunityMeta.endpoint} → 403 when unauthenticated`, async () => {
    if (typeof REBUTTALS === 'undefined') return;

    const companyOneFixtures = Object.values(REBUTTALS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}`)
      .expect(403);
  });

  it(`GET /${rebuttalMeta.endpoint}/:rebuttalId/${opportunityMeta.endpoint}?search=term → 200 returns filtered opportunitys by rebuttal and search`, async () => {
    if (typeof REBUTTALS === 'undefined') return;

    const companyOneFixtures = Object.values(REBUTTALS).filter(r => r.company?.id === COMPANIES.CompanyOne.id);
    if (companyOneFixtures.length === 0) return;

    const res = await request(app.getHttpServer())
      .get(`/${rebuttalMeta.endpoint}/${companyOneFixtures[0].id}/${opportunityMeta.endpoint}?search=CompanyOne`)
      .set("Authorization", `Bearer ${testState.token}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    // Find which fixtures should be related to this parent resource AND match search
    const expectedFixtures = Object.values(OPPORTUNITYS).filter(f => f.company.id === COMPANIES.CompanyOne.id && f.rebuttals?.some((rel: any) => rel.id === companyOneFixtures[0].id));
    jsonApiValidator.validateResponseList({
      body: res.body,
      type: opportunityMeta.endpoint,
      expected: expectedFixtures,
    });
  });
});