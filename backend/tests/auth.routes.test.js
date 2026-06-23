jest.mock('../src/models/User');

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const mockQuery = require('./mockQuery');

afterEach(() => jest.clearAllMocks());

describe('POST /api/auth/register', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when the email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: 'secret1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the password is shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'a@b.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when the email is already registered', async () => {
    User.findOne.mockReturnValue(mockQuery({ _id: 'existing-user' }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'dup@example.com', password: 'secret1' });

    expect(res.status).toBe(409);
  });

  it('registers a new user and returns a JWT without leaking the password (201)', async () => {
    User.findOne.mockReturnValue(mockQuery(null));
    User.create.mockResolvedValue({
      _id: 'new-user-id',
      name: 'New User',
      email: 'new@example.com',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'new@example.com', password: 'secret1' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('new@example.com');
    expect(res.body.data.user.password).toBeUndefined();
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('returns 401 with a generic message when the user does not exist', async () => {
    User.findOne.mockReturnValue(mockQuery(null));

    const res = await request(app).post('/api/auth/login').send({ email: 'nouser@example.com', password: 'secret1' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('returns 401 with the same generic message when the password is wrong', async () => {
    User.findOne.mockReturnValue(
      mockQuery({
        _id: 'u1',
        name: 'A',
        email: 'a@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      })
    );

    const res = await request(app).post('/api/auth/login').send({ email: 'a@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('logs in successfully and returns a JWT (200)', async () => {
    User.findOne.mockReturnValue(
      mockQuery({
        _id: 'u1',
        name: 'A',
        email: 'a@example.com',
        createdAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
      })
    );

    const res = await request(app).post('/api/auth/login').send({ email: 'a@example.com', password: 'correct' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});
