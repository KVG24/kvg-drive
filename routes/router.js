const { Router } = require("express");
const router = Router();
const controller = require("../controllers/controller");
const { validateSignUp } = require("../controllers/validation");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB file limit

router.get("/", controller.renderIndex);
router.get("/sign-up", controller.renderSignUp);
router.post("/sign-up", validateSignUp, controller.registerUser);
router.get("/log-in", controller.renderLogIn);
router.post("/log-in", controller.logIn);
router.get("/log-out", controller.logOut);
router.get("/drive/:folderId", controller.renderDrive);
router.post(
    "/upload-files/:folderId",
    upload.array("files"),
    controller.uploadFiles
);
router.get("/download/:filename", controller.downloadFile);
router.post("/create-folder/:folderId", controller.createFolder);

module.exports = router;
