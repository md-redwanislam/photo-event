import multer from "multer";

const storage = multer.memoryStorage();

const singleUpload = multer({ storage }).single("profile_pic");

export default singleUpload;
