import { ResultSetHeader } from "mysql2";
import db from "../configs/db";
import cloudinary from "../libs/cloudinary";
import { CustomError, Image } from "../types";
import { bufferToUuid } from "../utils";
import getDataUri from "../utils/dataUri";
import { getById } from "./user.service";

const upload = async (
  userId: string,
  caption: string,
  image: Express.Multer.File,
) => {
  const { user } = await getById(userId);
  const [rows] = await db.execute<Image[]>(
    `
    SELECT id
    FROM images
    WHERE uploader_id = UUID_TO_BIN(?)
    LIMIT 1
  `,
    [user.id],
  );

  if (rows.length > 0) {
    const err = new Error("You have already uploaded an image.") as CustomError;
    err.statusCode = 409;
    throw err;
  }

  const fileUri = getDataUri(image);

  const cloudResponse = await cloudinary.uploader.upload(fileUri.content!, {
    folder: "Photo Event/images",
    transformation: [{ width: 200, height: 200, crop: "fill" }],
  });

  await db.execute<ResultSetHeader>(
    `INSERT INTO images
      (
        uploader_id,
        image_url,
        caption
      )
     VALUES
      (
        UUID_TO_BIN(?),
        ?,
        ?
      )`,
    [user.id, cloudResponse.url, caption ?? null],
  );
};

const get = async () => {
  const [rows] = await db.execute<Image[]>(`SELECT 
    i.id AS image_id,
    i.image_url,
    i.caption,
    i.status,
    i.approved_by,
    i.approved_at,
    i.rejection_reason,
    i.created_at AS image_created_at,
    i.updated_at AS image_updated_at,

    u.id AS uploader_id,
    u.name AS uploader_name,
    u.phone AS uploader_phone,
    u.institute_name,
    u.class_name,
    u.created_at AS user_created_at,
    u.updated_at AS user_updated_at

FROM images i
JOIN users u 
    ON i.uploader_id = u.id
    order by i.created_at desc;`);

  if (rows.length <= 0) {
    const err = new Error("No data found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const datas = rows.map((data: any) => {
    return {
      id: bufferToUuid(data.image_id),
      uploader_id: bufferToUuid(data.uploader_id),

      image_url: data.image_url,
      caption: data.caption,
      status: data.status,

      approved_by: data.approved_by ? bufferToUuid(data.approved_by) : null,

      approved_at: data.approved_at,
      rejection_reason: data.rejection_reason,

      created_at: data.created_at,
      updated_at: data.updated_at,

      // joined user info
      uploader_name: data.uploader_name,
      institute_name: data.institute_name,
      class_name: data.class_name,
    };
  });

  return datas;
};

const getImageById = async (imageId: string) => {
  const [rows] = await db.execute<any[]>(
    `SELECT 
      i.id AS image_id,
      i.uploader_id,
      i.image_url,
      i.caption,
      i.status,
      i.approved_by,
      i.approved_at,
      i.rejection_reason,
      i.created_at,
      i.updated_at,

      u.name AS uploader_name,
      u.institute_name,
      u.class_name

    FROM images i
    JOIN users u ON i.uploader_id = u.id
    WHERE i.id = UUID_TO_BIN(?)`,
    [imageId],
  );

  if (rows.length === 0) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const row = rows[0];

  return {
    id: bufferToUuid(row.image_id),
    uploader_id: bufferToUuid(row.uploader_id),

    image_url: row.image_url,
    caption: row.caption,
    status: row.status,

    approved_by: row.approved_by ? bufferToUuid(row.approved_by) : null,

    approved_at: row.approved_at,
    rejection_reason: row.rejection_reason,

    created_at: row.created_at,
    updated_at: row.updated_at,

    uploader_name: row.uploader_name,
    institute_name: row.institute_name,
    class_name: row.class_name,
  };
};

const updateImageById = async (
  adminId: string,
  imageId: string,
  status: string,
  reason: string,
) => {
  await db.execute<Image[]>(
    `update images set 
      status = coalesce(?, status), 
      approved_by = coalesce(UUID_TO_BIN(?), approved_by), 
      approved_at = coalesce(?, approved_at), 
      rejection_reason = coalesce(?, rejection_reason)
     where id = UUID_TO_BIN(?)`,
    [
      status ?? null,
      adminId ?? null,
      new Date() ?? null,
      reason ?? null,
      imageId,
    ],
  );
};

export { get, getImageById, updateImageById, upload };
