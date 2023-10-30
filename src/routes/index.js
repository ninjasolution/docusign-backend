const express = require("express");
const router = express.Router();
const middlewares = require("../middleware");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const fileController = require("../controllers/file.controller");
const projectController = require("../controllers/project.controller");
const adminController = require("../controllers/admin.controller");
const countryController = require("../controllers/country.controller");
const commentController = require("../controllers/comment.controller");
const documentController = require("../controllers/document.controller");
const folderController = require("../controllers/folder.controller");
const versionFileController = require("../controllers/versionFile.controller");

router.post("/auth/signup", [middlewares.verifySignUp.checkDuplicateusernameOrEmail], authController.signup)
router.post("/auth/signin", authController.signin)
router.post("/auth/signout", authController.signout)
// router.get("/auth/profile", authController.profile)
// router.post("/auth/profile", authController.updateprofile)
router.get("/auth/verifyEmail/:id/:token", authController.verifyEmail)
router.get("/auth/verifyPhoneNumber/:id/:token", authController.verifyPhoneNumber)
router.post("/auth/forgot", authController.forgot)
router.get("/auth/requestEmailVerify", middlewares.authJwt.verifyToken, authController.requestEmailVerify)
router.get("/auth/requestPhoneVerify", middlewares.authJwt.verifyToken, authController.requestPhoneVerify)
router.get("/auth/rest/:token", authController.reset)
router.put("/auth/rest", authController.changePassword)

router.put("/super-admin/approve", userController.approve);
router.post("/admin/create", authController.signup);
router.get("/admin/get-nonce/:address", userController.getUserNonce);
router.get("/admin/single/:id([0-9]+)", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.getUser);
router.put("/admin/edit", middlewares.authJwt.verifyToken, userController.update);
router.get("/admin/gen-snapshot", middlewares.authJwt.verifyToken, projectController.genSnapshot);
router.get("/admin/get-whitelisted-user", middlewares.authJwt.verifyToken, projectController.getWhiteList);
router.get("/admin/get-snapshot-data", middlewares.authJwt.verifyToken, projectController.getSnapshot);

router.get("/admin/list", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.getUnApprovedAdmins);
// router.post("/admin/upload-social-raffle", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], fileController.uploadCVS, fileController.csvUploader);

router.get("/user", middlewares.authJwt.verifyToken, userController.allUsers);
router.get("/user/check-verification", middlewares.authJwt.verifyToken, userController.checkVerification);
router.delete("/user/:id([0-9]+)", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.delete);
router.get("/dashboard", middlewares.authJwt.verifyToken, userController.dashboard);
router.get("/payment-info", [middlewares.authJwt.verifyToken], userController.getpaymentinfo);
router.post("/withdraw", [middlewares.authJwt.verifyToken], userController.withdraw);

//Avatar
// router.get("/avatar/:fileName", fileController.getFile);
// router.delete("/avatar/:fileName", middlewares.authJwt.isAdmin, fileController.delete);

router.get("/file/:fileName", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.get)
router.delete("/file/:fileName", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.delete)
router.post("/file", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.create)


//Country
router.get("/country/list", countryController.list)

//Comment
router.get("/comment/list", commentController.list)
router.post("/comment", middlewares.authJwt.verifyToken, commentController.create)


router.get("/admin/db/drop", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], adminController.drop)

// Folder
router.get("/folders", middlewares.authJwt.verifyToken, folderController.list);
router.get("/folder/:id", middlewares.authJwt.verifyToken, folderController.getById);
router.post("/folder", middlewares.authJwt.verifyToken, folderController.create);
router.delete("/folder/:id", middlewares.authJwt.verifyToken, folderController.delete);
router.put("/folder/:id", middlewares.authJwt.verifyToken, folderController.update);

// Docuemnt
router.get("/documents/:folder_id", middlewares.authJwt.verifyToken, documentController.list);
router.get("/document/:id", middlewares.authJwt.verifyToken, documentController.getById);
router.post("/document", middlewares.authJwt.verifyToken, documentController.create);
router.delete("/document/:id", middlewares.authJwt.verifyToken, documentController.delete);
router.put("/document/:id", middlewares.authJwt.verifyToken, documentController.update);


// Version
router.get("/versions/:document_id", middlewares.authJwt.verifyToken, versionFileController.list);
router.get("/version/:id", middlewares.authJwt.verifyToken, versionFileController.getById);
router.post("/version", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.versioncreate, versionFileController.create);
router.delete("/version/:id", middlewares.authJwt.verifyToken, versionFileController.delete);
router.put("/version/:id", middlewares.authJwt.verifyToken, versionFileController.update);

// Comments
router.get("/comments/:version_id", middlewares.authJwt.verifyToken, commentController.list);
router.get("/members/:version_id", middlewares.authJwt.verifyToken, commentController.members)
// router.get("/comment/:id", middlewares.authJwt.verifyToken, commentController.getById);
router.post("/comment", middlewares.authJwt.verifyToken, commentController.create);
router.delete("/comment/:id", middlewares.authJwt.verifyToken, commentController.delete);
router.put("/comment/:id", middlewares.authJwt.verifyToken, commentController.update);

module.exports = router;
