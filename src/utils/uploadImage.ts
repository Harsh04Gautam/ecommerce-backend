import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

const storage = (folderName: string) => {
  return multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, path.join("uploads", folderName));
    },
    filename: function (_req, file, cb) {
      cb(null, `${uuid()}.${file.mimetype.split("/")[1]}`);
    },
  });
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image"))
    return cb(new Error("you can only upload image files"));
  return cb(null, true);
};

export const uploadProfilePicture = multer({
  storage: storage("users"),
  fileFilter,
});

export const uploadProductImage = multer({
  storage: storage("products"),
  fileFilter,
});
