const { Router } = require("express");
const router = Router();

const storageController = require("../controllers/storageController");
const authController = require("../controllers/authController");
const renderController = require("../controllers/renderController");

const { validateSignUp } = require("../utils/signUpValidation");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB file limit

router.get("/", renderController.renderIndex);
router.get("/sign-up", renderController.renderSignUp);
router.post("/sign-up", validateSignUp, authController.registerUser);
router.get("/log-in", renderController.renderLogIn);
router.post("/log-in", authController.logIn);
router.get("/log-out", authController.logOut);
router.get("/drive/:folderId", renderController.renderDrive);
router.post(
    "/upload-files/:folderId",
    upload.array("files"),
    storageController.uploadFiles
);
router.get("/download/:folder/:filename", storageController.downloadFile);
router.post("/create-folder/:folderId", storageController.createFolder);

module.exports = router;
