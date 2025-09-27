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

// Render routes
router.get("/", renderController.renderIndex);
router.get("/sign-up", renderController.renderSignUp);
router.get("/log-in", renderController.renderLogIn);
router.get("/drive/:folderId", renderController.renderDrive);

// Authentication routes
router.post("/sign-up", validateSignUp, authController.registerUser);
router.post("/log-in", authController.logIn);
router.get("/log-out", authController.logOut);

// Storage routes
router.post(
    "/upload-files/:folderId",
    upload.array("files"),
    storageController.uploadFiles
);
router.get("/download/:folderId/:filename", storageController.downloadFile);
router.get("/delete/:folderId/:filename", storageController.deleteFile);
router.post("/share/:folderId/:filename", storageController.shareFile);
router.post("/create-folder/:folderId", storageController.createFolder);
router.get("/delete/:folderId", storageController.deleteFolder);

module.exports = router;
