import { Document } from 'mongoose';

export interface User extends Document {
  name: string;

  email: string;
  password: string;
}
export interface UserNo extends Document {
  name: string;
  email: string;
}
