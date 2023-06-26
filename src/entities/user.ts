export type User = {
  id: string;
  userName: string;
  email: string;
  password: string;
  avatar: Avatar;
};

export type Avatar = {
  urlOriginal: string;
  url: string;
  mimetype: string;
  size: number;
};

export type UserLogin = {
  user: string;
  password: string;
};
