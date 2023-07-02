import { Film } from './film';

export type User = {
  id: string;
  userName: string;
  email: string;
  password: string;
  films: Film[];
};
