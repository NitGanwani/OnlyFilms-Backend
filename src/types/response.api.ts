import { User } from '../entities/user.js';

export type ApiResponse = {
  count: number;
  items: { [key: string]: unknown }[];
  next: string | null;
  previous: string | null;
};

export type LoginResponse = {
  token: string;
  user: User;
};
