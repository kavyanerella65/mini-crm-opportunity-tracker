jest.mock('../src/models/User');
jest.mock('../src/models/Opportunity');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Opportunity = require('../src/models/Opportunity');
const mockQuery = require('./mockQuery');

const OWNER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439022';

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2h' });
const authedUser = (id) => ({ _id: id, name: 'Test User', email: 'test@example.com' });

beforeEach(() => {
  // The auth middleware loads req.user via User.findById(decoded.id) — every
  // protected-route test relies on this resolving to a real-looking user.
  User.findById.mockImplementation((id) => Promise.resolve(authedUser(id)));
});

afterEach(() => jest.clearAllMocks());

describe('Authentication is required for all /api/opportunities routes', () => {
  it('rejects a request with no Authorization header (401)', async () => {
    const res = await request(app).get('/api/opportunities');
    expect(res.status).toBe(401);
  });

  it('rejects a request with a malformed/invalid token (401)', async () => {
    const res = await request(app).get('/api/opportunities').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret (401)', async () => {
    const badToken = jwt.sign({ id: OWNER_ID }, 'wrong-secret');
    const res = await request(app).get('/api/opportunities').set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/opportunities', () => {
  it('rejects creation when required fields are missing (400)', async () => {
    const res = await request(app)
      .post('/api/opportunities')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('rejects the request if the client tries to set owner/user_id/created_by directly (400)', async () => {
    const res = await request(app)
      .post('/api/opportunities')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({
        customerName: 'Acme Corp',
        requirement: 'Needs a CRM',
        owner: OTHER_USER_ID,
        user_id: OTHER_USER_ID,
      });

    expect(res.status).toBe(400);
  });

  it('creates the opportunity with the owner derived from the JWT, never the body (201)', async () => {
    Opportunity.create.mockImplementation(async (payload) => ({
      ...payload,
      _id: 'opp1',
      populate: jest.fn().mockResolvedValue(undefined),
    }));

    const res = await request(app)
      .post('/api/opportunities')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ customerName: 'Acme Corp', requirement: 'Needs a CRM', stage: 'New', priority: 'High' });

    expect(res.status).toBe(201);
    expect(Opportunity.create).toHaveBeenCalledWith(
      expect.objectContaining({ owner: OWNER_ID, customerName: 'Acme Corp' })
    );
  });

  it('rejects an invalid stage value (400)', async () => {
    const res = await request(app)
      .post('/api/opportunities')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ customerName: 'Acme Corp', requirement: 'Needs a CRM', stage: 'NotARealStage' });

    expect(res.status).toBe(400);
  });
});

describe('Ownership-based authorization on PUT/DELETE', () => {
  const fakeOpportunity = (ownerId, overrides = {}) => ({
    _id: 'opp1',
    owner: ownerId,
    customerName: 'Acme Corp',
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  it('returns 403 when a non-owner attempts to update', async () => {
    Opportunity.findById.mockResolvedValue(fakeOpportunity(OWNER_ID));

    const res = await request(app)
      .put('/api/opportunities/opp1')
      .set('Authorization', `Bearer ${tokenFor(OTHER_USER_ID)}`)
      .send({ stage: 'Won' });

    expect(res.status).toBe(403);
  });

  it('returns 403 when a non-owner attempts to delete', async () => {
    Opportunity.findById.mockResolvedValue(fakeOpportunity(OWNER_ID));

    const res = await request(app)
      .delete('/api/opportunities/opp1')
      .set('Authorization', `Bearer ${tokenFor(OTHER_USER_ID)}`);

    expect(res.status).toBe(403);
  });

  it('allows the owner to update their own opportunity (200)', async () => {
    const opp = fakeOpportunity(OWNER_ID);
    Opportunity.findById.mockResolvedValue(opp);

    const res = await request(app)
      .put('/api/opportunities/opp1')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ stage: 'Won' });

    expect(res.status).toBe(200);
    expect(opp.save).toHaveBeenCalled();
  });

  it('allows the owner to delete their own opportunity (200)', async () => {
    const opp = fakeOpportunity(OWNER_ID);
    Opportunity.findById.mockResolvedValue(opp);

    const res = await request(app)
      .delete('/api/opportunities/opp1')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`);

    expect(res.status).toBe(200);
    expect(opp.deleteOne).toHaveBeenCalled();
  });

  it('returns 404 when updating an opportunity that does not exist', async () => {
    Opportunity.findById.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/opportunities/doesnotexist')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ stage: 'Won' });

    expect(res.status).toBe(404);
  });

  it('an update body can never change who owns the record', async () => {
    const opp = fakeOpportunity(OWNER_ID);
    Opportunity.findById.mockResolvedValue(opp);

    await request(app)
      .put('/api/opportunities/opp1')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ stage: 'Won', owner: OTHER_USER_ID });

    expect(opp.owner).toBe(OWNER_ID); // unchanged despite "owner" being in the request body
  });
});

describe('GET /api/opportunities', () => {
  it('returns the shared pipeline (every user sees all opportunities) (200)', async () => {
    Opportunity.find.mockReturnValue(mockQuery([{ _id: 'opp1' }, { _id: 'opp2' }]));
    Opportunity.countDocuments.mockResolvedValue(2);

    const res = await request(app).get('/api/opportunities').set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /api/opportunities/:id', () => {
  it('returns 404 when the opportunity does not exist', async () => {
    Opportunity.findById.mockReturnValue(mockQuery(null));

    const res = await request(app)
      .get('/api/opportunities/doesnotexist')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`);

    expect(res.status).toBe(404);
  });
});
