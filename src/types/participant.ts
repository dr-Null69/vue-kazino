export interface Participant {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

export type SortKey = 'name' | 'dateOfBirth' | null;
export type SortOrder = 'asc' | 'desc';
