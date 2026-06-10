import { appointmentSchema, patientSchema } from '../../src/utils/validation';

describe('Validation Schemas', () => {
  describe('Appointment Schema', () => {
    it('should validate a correct appointment', () => {
      const validData = {
        patientId: '123',
        date: '2026-06-07',
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Routine checkup',
      };
      const result = appointmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if end time is before start time', () => {
      const invalidData = {
        patientId: '123',
        date: '2026-06-07',
        startTime: '10:00',
        endTime: '09:00',
      };
      const result = appointmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('End time must be after start time');
      }
    });
  });

  describe('Patient Schema', () => {
    it('should validate a correct patient', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        dateOfBirth: '1990-01-01',
      };
      const result = patientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '1234567890',
        dateOfBirth: '1990-01-01',
      };
      const result = patientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });
  });
});