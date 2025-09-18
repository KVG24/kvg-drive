const { Router } = require("express");
const controller = require("../controllers/controller");
const { validateSignUp } = require("../controllers/validation");

const router = Router();

router.get("/", controller.renderIndex);
router.get("/sign-up", controller.renderSignUp);
router.post("/sign-up", validateSignUp, controller.registerUser);
router.get("/log-in", controller.renderLogIn);
router.post("/log-in", controller.logIn);
router.get("/log-out", controller.logOut);
router.get("/drive", controller.renderDrive);

module.exports = router;
