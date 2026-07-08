import db from "../configs/db";
import { CustomError, Image } from "../types";
import { bufferToUuid } from "../utils";

const getImages = async () => {
  const [rows] = await db.execute<Image[]>(`
SELECT 
    i.id AS image_id,
    i.image_url,
    i.caption,
    i.status,
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
WHERE i.status = 'approved'
ORDER BY i.created_at DESC;
`);

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

      approved_at: data.approved_at,
      rejection_reason: data.rejection_reason,

      created_at: data.image_created_at,
      updated_at: data.image_updated_at,
    };
  });

  return datas;
};

const getImageById = async (imageId: string) => {
  const [rows] = await db.execute<any[]>(
    `Select
    i.id AS image_id,
    i.image_url,
    i.caption,
    i.status,
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
    JOIN users u ON i.uploader_id = u.id

    WHERE i.id = UUID_TO_BIN(?)
    AND i.status = ?
    `,
    [imageId, "approved"],
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
    rejection_reason: row.rejection_reason,

    created_at: row.image_created_at,
    updated_at: row.image_updated_at,
  };
};

export { getImageById, getImages };
