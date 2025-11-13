const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.models");
const launchesDatabase = require("../../models/launches.mongo");

describe("Launches integration", () => {
  beforeAll(async () => {
    await mongoConnect();
    // ensure planets are loaded so valid targets exist
    await loadPlanetsData();
    // start with a clean launches collection for deterministic tests
    await launchesDatabase.deleteMany({});
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  test("Schedule -> appears in GET -> abort -> updated in GET", async () => {
    const newLaunch = {
      mission: "Integration Test Mission",
      rocket: "Int-1",
      target: "Kepler-62 f",
      launchDate: "January 4, 2030",
    };

    // schedule
    const postRes = await request(app)
      .post("/v1/launches")
      .send(newLaunch)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(postRes.body).toHaveProperty("flightNumber");
    const flightNumber = postRes.body.flightNumber;

    // appears in GET
    const getRes = await request(app)
      .get("/v1/launches")
      .expect("Content-Type", /json/)
      .expect(200);

    const found = getRes.body.find((l) => l.flightNumber === flightNumber);
    expect(found).toBeDefined();
    expect(found.upcoming).toBe(true);

    // abort
    const delRes = await request(app)
      .delete(`/v1/launches/${flightNumber}`)
      .expect("Content-Type", /json/)
      .expect(200);

    // DELETE now returns the updated launch document
    expect(delRes.body).toHaveProperty("flightNumber", flightNumber);
    expect(delRes.body.upcoming).toBe(false);
    expect(delRes.body.success).toBe(false);

    // verify updated in GET
    const getAfter = await request(app)
      .get("/v1/launches")
      .expect("Content-Type", /json/)
      .expect(200);

    const updated = getAfter.body.find((l) => l.flightNumber === flightNumber);
    expect(updated).toBeDefined();
    expect(updated.upcoming).toBe(false);
    expect(updated.success).toBe(false);
  });
});
