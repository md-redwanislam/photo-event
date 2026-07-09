import { ResultSetHeader } from "mysql2";
import db from "../configs/db";
import cloudinary from "../libs/cloudinary";
import { CustomError, Image } from "../types";
import { bufferToUuid } from "../utils";
import getDataUri from "../utils/dataUri";

const upload = async (
  userId: string,
  caption: string,
  image: Express.Multer.File,
) => {
  const fileUri = getDataUri(image);

  const cloudResponse = await cloudinary.uploader.upload(fileUri.content!, {
    folder: "Photo Event/images",
  });

  await db.execute<ResultSetHeader>(
    `INSERT INTO images
      (
        uploader_id,
        image_url,
        public_id,
        caption
      )
     VALUES
      (
        UUID_TO_BIN(?),
        ?,
        ?,
        ?
      )`,
    [userId, cloudResponse.url, cloudResponse.public_id, caption ?? null],
  );
};

const getUserImage = async (userId: string) => {
  const [rows] = await db.execute<any[]>(
    `SELECT *
FROM images
WHERE uploader_id = UUID_TO_BIN(?);`,
    [userId],
  );

  if (rows.length === 0) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const datas = rows.map((data) => ({
    ...data,
    id: Buffer.isBuffer(data.id) ? bufferToUuid(data.id) : data.id,
    uploader_id: Buffer.isBuffer(data.uploader_id)
      ? bufferToUuid(data.uploader_id)
      : data.uploader_id,
  }));

  return datas.map((data) => ({
    id: data.id,
    image_url: data.image_url,
    caption: data.caption,
    status: data.status,
    approved_at: data.approved_at,
    rejection_reason: data.rejection_reason,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }));
};

const update = async (
  userId: string,
  imageId: string,
  caption: string,
  image?: Express.Multer.File,
) => {
  const [rows] = await db.execute<any[]>(
    `
      SELECT image_url
      FROM images
      WHERE id = UUID_TO_BIN(?)
      AND uploader_id = UUID_TO_BIN(?),
      AND status = 'rejected'
    `,
    [imageId, userId],
  );

  if (rows.length === 0) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  let imageUrl = rows[0].image_url;

  if (image) {
    if (rows[0].public_id) {
      await cloudinary.uploader.destroy(rows[0].public_id);
    }
    const fileUri = getDataUri(image);

    const cloudResponse = await cloudinary.uploader.upload(fileUri.content!, {
      folder: "Photo Event/images",
    });

    imageUrl = cloudResponse.url;
  }

  await db.execute<ResultSetHeader>(
    `
      UPDATE images
      SET
        image_url = ?,
        caption = ?,
        updated_at = NOW()
      WHERE
        id = UUID_TO_BIN(?)
        AND uploader_id = UUID_TO_BIN(?)
    `,
    [imageUrl, caption ?? null, imageId, userId],
  );
};

const remove = async (userId: string, imageId: string) => {
  const [rows] = await db.execute<any[]>(
    `
  SELECT public_id
  FROM images
  WHERE
      id = UUID_TO_BIN(?)
      AND uploader_id = UUID_TO_BIN(?),
      AND status = 'rejected'
  `,
    [imageId, userId],
  );

  if (!rows.length) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  if (rows[0].public_id) {
    await cloudinary.uploader.destroy(rows[0].public_id);
  }

  const [result] = await db.execute<ResultSetHeader>(
    `
      DELETE FROM images
      WHERE
        id = UUID_TO_BIN(?)
        AND uploader_id = UUID_TO_BIN(?)
    `,
    [imageId, userId],
  );

  if (result.affectedRows === 0) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }
};

const getAdminImages = async () => {
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
    u.updated_at AS user_updated_at,

    a.id AS admin_id,
    a.name AS admin_name,
    a.email AS admin_email,
    a.role AS admin_role,
    a.profile_pic AS admin_profile_pic,
    a.bio AS admin_bio

FROM images i
JOIN users u 
    ON i.uploader_id = u.id

LEFT JOIN admins a
    ON i.approved_by = a.id

ORDER BY i.created_at DESC;`);

  if (rows.length <= 0) {
    const err = new Error("No image found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const datas = rows.map((data: any) => {
    return {
      id: bufferToUuid(data.image_id),

      user: {
        id: bufferToUuid(data.uploader_id),
        name: data.uploader_name,
        phone: data.uploader_phone,
        institute_name: data.institute_name,
        class_name: data.class_name,
        created_at: data.user_created_at,
        updated_at: data.user_updated_at,
      },

      image_url: data.image_url,
      caption: data.caption,
      status: data.status,

      approved_by: data.approved_by ? bufferToUuid(data.approved_by) : null,

      approved_at: data.approved_at,
      rejection_reason: data.rejection_reason,

      created_at: data.image_created_at,
      updated_at: data.image_updated_at,

      admin: data.admin_id
        ? {
            id: bufferToUuid(data.admin_id),
            name: data.admin_name,
            email: data.admin_email,
            role: data.admin_role,
            profile_pic: data.admin_profile_pic,
            bio: data.admin_bio,
          }
        : null,
    };
  });

  return datas;
};

const getAdminImageById = async (imageId: string) => {
  const [rows] = await db.execute<any[]>(
    `
    SELECT 
      i.id AS image_id,
      i.uploader_id,
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
      u.updated_at AS user_updated_at,

      a.id AS admin_id,
      a.name AS admin_name,
      a.email AS admin_email,
      a.role AS admin_role,
      a.profile_pic AS admin_profile_pic,
      a.bio AS admin_bio

    FROM images i
    JOIN users u ON i.uploader_id = u.id
    LEFT JOIN admins a ON i.approved_by = a.id
    WHERE i.id = UUID_TO_BIN(?)
    `,
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

    user: {
      id: bufferToUuid(row.uploader_id),
      name: row.uploader_name,
      phone: row.uploader_phone,
      institute_name: row.institute_name,
      class_name: row.class_name,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    },

    image_url: row.image_url,
    caption: row.caption,
    status: row.status,

    approved_by: row.approved_by ? bufferToUuid(row.approved_by) : null,

    approved_at: row.approved_at,
    rejection_reason: row.rejection_reason,

    created_at: row.image_created_at,
    updated_at: row.image_updated_at,

    admin: row.admin_id
      ? {
          id: bufferToUuid(row.admin_id),
          name: row.admin_name,
          email: row.admin_email,
          role: row.admin_role,
          profile_pic: row.admin_profile_pic,
          bio: row.admin_bio,
        }
      : null,
  };
};

const deleteImageById = async (imageId: string) => {
  const [result] = await db.execute<ResultSetHeader>(
    `DELETE FROM images WHERE id = UUID_TO_BIN(?)`,
    [imageId],
  );

  if (result.affectedRows === 0) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return { message: "Image deleted successfully" };
};

const updateImageStatus = async (
  adminId: string,
  imageId: string,
  caption: string,
  status: "approved" | "rejected",
  reason: string | null,
) => {
  const data = await getAdminImageById(imageId);
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE images
     SET
       caption = ?,
       status = ?,
       approved_by = UUID_TO_BIN(?),
       approved_at = ?,
       rejection_reason = ?
     WHERE id = UUID_TO_BIN(?)`,
    [
      caption || data.caption,
      status || data.status,
      adminId,
      new Date(),
      reason || data.rejection_reason,
      imageId,
    ],
  );

  if (result.affectedRows === 0) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return `Image updated successfully`;
};

export {
  deleteImageById,
  getAdminImageById,
  getAdminImages,
  getUserImage,
  remove,
  update,
  updateImageStatus,
  upload,
};
