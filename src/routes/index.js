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
const invitationController = require("../controllers/invitation.controller");
const verificationController = require("../controllers/verification.controller");


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
router.post("/auth/reset/:token", authController.reset)
router.put("/auth/reset", authController.changePassword)

router.put("/super-admin/approve", userController.approve);
router.post("/admin/create", authController.signup);
router.get("/admin/get-nonce/:address", userController.getUserNonce);
router.get("/admin/single/:id([0-9]+)", middlewares.authJwt.verifyToken, userController.getUser);
router.put("/admin/edit", middlewares.authJwt.verifyToken, userController.update);
router.get("/admin/gen-snapshot", middlewares.authJwt.verifyToken, projectController.genSnapshot);
router.get("/admin/get-whitelisted-user", middlewares.authJwt.verifyToken, projectController.getWhiteList);
router.get("/admin/get-snapshot-data", middlewares.authJwt.verifyToken, projectController.getSnapshot);

router.get("/admin/list", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.getUnApprovedAdmins);
// router.post("/admin/upload-social-raffle", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], fileController.uploadCVS, fileController.csvUploader);

router.get("/user", middlewares.authJwt.verifyToken, userController.allUsers);
router.get("/user/check-verification", middlewares.authJwt.verifyToken, userController.checkVerification);
router.get("/user/check-exists/:id", middlewares.authJwt.verifyToken, userController.checkUserByNameAndEmail);
router.delete("/user/:id([0-9]+)", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.delete);
router.get("/dashboard", middlewares.authJwt.verifyToken, userController.dashboard);

//Avatar
// router.get("/avatar/:fileName", fileController.getFile);
// router.delete("/avatar/:fileName", middlewares.authJwt.isAdmin, fileController.delete);

router.get("/file/:fileName", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.get)
router.delete("/file/:fileName", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.delete)
router.post("/file", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.create)


//Country
router.get("/country/list", countryController.list)
router.get("/initial", middlewares.authJwt.verifyToken, userController.getInitialStatus)

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
router.put("/document/token/:id", middlewares.authJwt.verifyToken, documentController.setToken);
router.get("/counttotalfolders", middlewares.authJwt.verifyToken, documentController.counttotallist);
router.get("/countinvitedfolders", middlewares.authJwt.verifyToken, documentController.countinvitedlist);
router.get("/recentdocuments", middlewares.authJwt.verifyToken, documentController.recentlist);
router.get("/stakeholders/:document_id", middlewares.authJwt.verifyToken, documentController.stakeholders)

// Version
router.get("/versions/:document_id", middlewares.authJwt.verifyToken, versionFileController.list);
router.get("/version/editors/:document_id", middlewares.authJwt.verifyToken, versionFileController.getEditors);
router.get("/version/:id", middlewares.authJwt.verifyToken, versionFileController.getById);
router.post("/version", middlewares.authJwt.verifyToken, fileController.upload.single('file'),  fileController.versioncreate, versionFileController.create);
router.delete("/version/:id", middlewares.authJwt.verifyToken, versionFileController.delete);
router.put("/version/:id", middlewares.authJwt.verifyToken, versionFileController.update);
router.post("/version/:id", middlewares.authJwt.verifyToken, versionFileController.docomplete);
router.post("/versionselect/:id", middlewares.authJwt.verifyToken, versionFileController.doselect);

// Comments
router.get("/comments/:version_id", middlewares.authJwt.verifyToken, commentController.list);
router.get("/members/:version_id", middlewares.authJwt.verifyToken, commentController.members)
// router.get("/comment/:id", middlewares.authJwt.verifyToken, commentController.getById);
router.post("/comment", middlewares.authJwt.verifyToken, commentController.create);
router.delete("/comment/:id", middlewares.authJwt.verifyToken, commentController.delete);
router.put("/comment/:id", middlewares.authJwt.verifyToken, commentController.update);

// Friends
router.get("/counttotalfriends", middlewares.authJwt.verifyToken, invitationController.counttotallist);
router.get("/totalfriends", middlewares.authJwt.verifyToken, invitationController.totallist);
router.get("/invitations", middlewares.authJwt.verifyToken, invitationController.list);
router.get("/invitation/:id", middlewares.authJwt.verifyToken, invitationController.getById);
router.post("/invitation", middlewares.authJwt.verifyToken, invitationController.create);
router.delete("/invitation/:id", middlewares.authJwt.verifyToken, invitationController.delete);
router.put("/invitation/:id", middlewares.authJwt.verifyToken, invitationController.update);

// Invitations
router.get("/notifications", middlewares.authJwt.verifyToken, invitationController.notificationlist);

// Verifications
router.get("/verification/:version_id", middlewares.authJwt.verifyToken, verificationController.list);
router.post("/verification", middlewares.authJwt.verifyToken, verificationController.create);
router.put("/verification/:id", middlewares.authJwt.verifyToken, verificationController.update);
router.delete("/verification/:id", middlewares.authJwt.verifyToken, verificationController.delete);
router.get("/verification/genword/:version_id", middlewares.authJwt.verifyToken, verificationController.genword);

module.exports = router;
