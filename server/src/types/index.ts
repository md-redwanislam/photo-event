import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: Buffer;
  name: string;
  phone: string;
  institute_name: string;
  class_name: string;
  otp: string | null;
  otp_expires_at: Date | null;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface Admin extends RowDataPacket {
  id: Buffer;
  name: string;
  email: string;
  password: string;
  bio: string;
  profile_pic: string;
  created_at: Date;
  updated_at: Date;
}

export type ImageStatus = "pending" | "approved" | "rejected";

export interface Image extends RowDataPacket {
  id: Buffer;
  user_id: Buffer;

  image_url: string;
  uploader_id: string;
  caption: string | null;

  status: ImageStatus;

  approved_by: Buffer | null;
  approved_at: Date | null;
  rejection_reason: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface CustomError extends Error {
  statusCode: number;
}
