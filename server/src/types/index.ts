import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: Buffer;
  name: string;
  phone: string;
  institute_name: string;
  class_name: string;
  password: string;
  otp: string | null;
  otp_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Admin extends RowDataPacket {
  id: Buffer;
  name: string;
  email: string;
  password: string;
  role: string;
  bio: string;
  profile_pic: string;
  public_id: string;
  otp: string | null;
  otp_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type ImageStatus = "pending" | "approved" | "rejected";

export interface Image extends RowDataPacket {
  id: Buffer;
  user_id: Buffer;

  image_url: string;
  public_id: string;
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
