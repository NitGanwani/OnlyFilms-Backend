import { User } from '../entities/user.js';

export type ApiResponse = {
  count: number;
  page: number;
  items: { [key: string]: unknown }[];
};

export type LoginResponse = {
  token: string;
  user: User;
};
