const { Router } = require("express");
const controller = require("../controllers/controller");
const { validateSignUp } = require("../controllers/validation");
const multer = require("multer");
const path = require("node:path");

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.get("/", controller.renderIndex);
router.get("/sign-up", controller.renderSignUp);
router.post("/sign-up", validateSignUp, controller.registerUser);
router.get("/log-in", controller.renderLogIn);
router.post("/log-in", controller.logIn);
router.get("/log-out", controller.logOut);
router.get("/drive", controller.renderDrive);
router.post("/upload", upload.array("files"), controller.uploadFile);
router.get("/download/:filename", controller.downloadFile);

module.exports = router;
