import { validateEmail, validatePassword, keywordSchema } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate password with 6+ characters', () => {
      expect(validatePassword('password123')).toBe(true);
    });

    it('should reject password with less than 6 characters', () => {
      expect(validatePassword('pass')).toBe(false);
    });

    it('should reject empty password', () => {
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('keywordSchema', () => {
    it('should validate correct keyword', () => {
      const result = keywordSchema.safeParse({
        palabra: 'test',
        descripcion: 'Test keyword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject keyword with short palabra', () => {
      const result = keywordSchema.safeParse({
        palabra: 'a',
      });
      expect(result.success).toBe(false);
    });
  });
});
