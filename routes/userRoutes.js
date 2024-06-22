import { Router } from "express";
import {
  register_user,
  login_user,
  currentUser,
  allUserVerified,
  verifyUser,
  uploadProfile,
  uploadImages,
  deleteImage
} from "../controller/userController.js";
import { isAdmin, userAuth } from "../middlewere/authMiddlewere.js";

import crypto from "crypto";
import multer from "multer";

const getUniqueFileName = () => `SCHOOL${crypto.randomBytes(3).toString('hex')}T${Date.now()}`;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (_req, file, cb) {
    const extension = file.originalname.split('.').pop();
    const fileNameWithExtension = getUniqueFileName() + `${extension ? '.' + extension : ''}`;
    file.ext = extension
    cb(null, fileNameWithExtension);
  },

});

const upload = multer({
  storage,
});

const router = Router();
router.route("/register").post(register_user);
router.route("/login").post(login_user);
router.route("/current-user").get(userAuth, currentUser);
router.route("/all-user").get(userAuth, isAdmin, allUserVerified);
router.route("/verify/:id").put(userAuth, isAdmin, verifyUser);
router.route("/profile/upload").post(userAuth, upload.single('file'), uploadProfile);
router.route("/images/upload").post(userAuth, upload.array('files'), uploadImages);
router.route("/image/:image").delete(userAuth, deleteImage);

export default router;
