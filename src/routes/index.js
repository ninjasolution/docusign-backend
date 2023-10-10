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

router.post("/auth/signup", [middlewares.verifySignUp.checkRolesExisted], authController.signup)
router.post("/auth/signin", authController.signin)
router.post("/auth/signout", authController.signout)
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
router.post("/admin/upload-social-raffle", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], fileController.uploadCVS, fileController.csvUploader);

router.get("/user", middlewares.authJwt.verifyToken, userController.allUsers);
router.get("/user/check-verification", middlewares.authJwt.verifyToken, userController.checkVerification);
router.delete("/user/:id([0-9]+)", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.delete);
router.get("/dashboard", middlewares.authJwt.verifyToken, userController.dashboard);
router.get("/payment-info", [middlewares.authJwt.verifyToken], userController.getpaymentinfo);
router.post("/withdraw", [middlewares.authJwt.verifyToken], userController.withdraw);

//Avatar
router.get("/avatar/:fileName", fileController.getFile);
router.delete("/avatar/:fileName", middlewares.authJwt.isAdmin, fileController.delete);

//Country
router.get("/country/list", countryController.list)

//Comment
router.get("/comment/list", commentController.list)
router.post("/comment", middlewares.authJwt.verifyToken, commentController.create)


router.get("/admin/db/drop", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], adminController.drop)

module.exports = router;
