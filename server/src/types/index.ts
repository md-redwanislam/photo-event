import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: Buffer; // BINARY(16)
  name: string;
  phone: string;
  institute_name: string;
  class_name: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface Admin extends RowDataPacket {
  id: Buffer; // BINARY(16)
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
  id: Buffer; // BINARY(16)
  user_id: Buffer; // References users.id

  image_url: string;
  uploader_id: string;
  caption: string | null;

  status: ImageStatus;

  approved_by: Buffer | null; // References admins.id
  approved_at: Date | null;
  rejection_reason: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface CustomError extends Error {
  statusCode: number;
}

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

/* 

If you convert UUIDs to strings

Many projects use BIN_TO_UUID(id) in SQL so that the application works with UUID strings instead of Buffers.

Example:

SELECT
    BIN_TO_UUID(id) AS id,
    BIN_TO_UUID(user_id) AS user_id,
    image_url,
    public_id
FROM images;

Then your interfaces become:

export interface User extends RowDataPacket {
  id: string;
  name: string;
  phone: string;
  institute_name: string;
  class_name: string;
  created_at: Date;
  updated_at: Date;
}

and similarly for Admin and Image, where all UUID fields (id, user_id, approved_by) are string instead of Buffer.
*/
