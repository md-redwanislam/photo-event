import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

const singleUpload = (fieldName: string) => upload.single(fieldName);

export default singleUpload;
