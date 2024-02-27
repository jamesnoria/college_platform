import * as authController from '../../controllers/authController';
import User from '../../models/userModel';
import { AppError } from '../../utils/appError';
import { hashPassword } from '../../utils/crypto';
import Email from '../../utils/email';
import * as db from '../__utils__/db';
import * as JWT from '../../utils/jwt';

jest.mock('../../utils/email');
jest.mock('../../utils/jwt');

describe('Auth Controller', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  afterAll(async () => {
    setTimeout(async () => {
      await db.closeDatabase();
    }, 1500);
  });

  describe('signup', () => {
    const emailMock = (Email as jest.MockedClass<typeof Email>).mockImplementation(() => {
      return {
        to: '',
        message: '',
        subject: '',
        firstName: '',
        from: '',
        params: jest.fn().mockReturnValue({}),
        send: jest.fn().mockResolvedValue(undefined),
      };
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should create a new user', async () => {
      const signupRequest = {
        baseUrl: 'http://localhost:3000',
        body: {
          name: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.org',
          career: 'Computer Science',
          password: '123456789',
          semester: 1,
        },
        params: {},
        file: undefined,
        user: undefined,
      };

      const response = await authController.signup(signupRequest);

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('success');
      expect(response.data.token).toBeDefined();
      expect(response.data.user.email).toBe('john.doe@example.org');
      expect(emailMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('login', () => {
    const email = 'john.doe@example.org';
    const password = '1234567890';

    const jwtMock = JWT.generateJwtToken as jest.MockedFunction<typeof JWT.generateJwtToken>;
    jwtMock.mockReturnValue('token');

    beforeAll(async () => {
      await User.create({
        name: 'John',
        lastName: 'Doe',
        email: email,
        career: 'Computer Science',
        semester: 1,
        password,
      });
    });

    it('should login a user', async () => {
      const loginRequest = {
        baseUrl: 'http://localhost:3000',
        body: {
          email,
          password,
        },
        params: {},
        file: undefined,
        user: undefined,
      };

      const response = await authController.login(loginRequest);

      expect(response.status).toBe(200);
      expect(jwtMock).toHaveBeenCalledTimes(1);
      expect(response.data.status).toBe('success');
      expect(response.data.token).toBe('token');
    });
    it('should not login a user with wrong password', async () => {
      const loginRequest = {
        baseUrl: 'http://localhost:3000',
        body: {
          email,
          password: 'wrongpassword',
        },
        params: {},
        file: undefined,
        user: undefined,
      };

      const response = authController.login(loginRequest);

      expect(response).rejects.toThrow(new AppError(401, 'Email o contraseña incorrectos'));
    });
    it('should not login a user with wrong email', async () => {
      const loginRequest = {
        baseUrl: 'http://localhost:3000',
        body: {
          email: 'wrong@email.com',
          password,
        },
        params: {},
        file: undefined,
        user: undefined,
      };

      const response = authController.login(loginRequest);

      expect(response).rejects.toThrow(new AppError(401, 'Email o contraseña incorrectos'));
    });
  });
});
