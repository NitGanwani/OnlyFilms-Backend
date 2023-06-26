import { AuthServices, PayloadToken } from './auth.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Given the AuthServices class', () => {
  describe('When I use createJWT method', () => {
    test('Then the JWT sign method should be called', () => {
      const payload = {} as PayloadToken;
      AuthServices.createJWT(payload);
      expect(jwt.sign).toHaveBeenCalled();
    });
  });
});
