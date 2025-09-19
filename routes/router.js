const { Router } = require("express");
const controller = require("../controllers/controller");
const { validateSignUp } = require("../controllers/validation");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = Router();

router.get("/", controller.renderIndex);
router.get("/sign-up", controller.renderSignUp);
router.post("/sign-up", validateSignUp, controller.registerUser);
router.get("/log-in", controller.renderLogIn);
router.post("/log-in", controller.logIn);
router.get("/log-out", controller.logOut);
router.get("/drive", controller.renderDrive);
router.post("/upload", upload.single("file"), controller.uploadFile);

module.exports = router;
