import request from 'supertest';
import app from '../../app';

// create a test for signup but mock what happens inside the signup function
jest.mock('../../controllers/authController');

describe('User Routes', () => {
  it('should signup a new user', async () => {
    const response = await request(app).post('/api/v1/users/signup').send({
      name: 'John',
      lastName: 'Doe',
      email: 'jamesnoria@gmail.com',
      password: '123456',
      passwordConfirm: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.user.name).toBe('John');
  });
});
