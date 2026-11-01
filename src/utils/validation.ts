import type { Participant } from '@/types/participant';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+380\d{9}$/;

export interface FormErrors {
  name?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
}

export function validateParticipantForm(
  data: Omit<Participant, 'id'>,
  existingParticipants: Participant[],
  editingId?: string
): FormErrors {
  const errors: FormErrors = {};

  // Перевірка імені
  if (!data.name.trim()) {
    errors.name = "Поле «Ім'я» є обов'язковим";
  }

  // Перевірка дати народження
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Поле «Дата народження» є обов\'язковим';
  } else {
    const today = new Date().toISOString().split('T')[0];
    if (data.dateOfBirth > today) {
      errors.dateOfBirth = 'Дата народження не може бути в майбутньому';
    }
  }

  // Перевірка Email та його унікальності
  if (!data.email.trim()) {
    errors.email = 'Поле «Email» є обов\'язковим';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Введіть коректну адресу електронної пошти';
  } else {
    const normalizedEmail = data.email.trim().toLowerCase();
    const isDuplicate = existingParticipants.some(
      (p) => p.email.toLowerCase() === normalizedEmail && p.id !== editingId
    );
    if (isDuplicate) {
      errors.email = 'Учасник з таким email вже зареєстрований';
    }
  }

  // Перевірка телефону (+380XXXXXXXXX)
  if (!data.phone.trim()) {
    errors.phone = 'Поле «Телефон» є обов\'язковим';
  } else if (!PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = 'Телефон має бути у форматі +380XXXXXXXXX';
  }

  return errors;
}
