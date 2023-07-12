import { Image } from '../types/image';
import { User } from './user';

export type Film = {
  id: string;
  title: string;
  release: string;
  genre: 'Action' | 'Drama' | 'Comedy' | 'Horror' | 'Sci-Fi' | 'Animation';
  synopsis: string;
  poster: Image;
  owner: User;
  comments: Comment[];
};

export type Comment = {
  comment: string;
  owner: User;
};
