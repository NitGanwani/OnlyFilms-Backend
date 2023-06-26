export type User = {
  id: string;
  userName: string;
  email: string;
  password: string;
};

export type UserLogin = {
  user: string;
  password: string;
};
