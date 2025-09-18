const { body } = require("express-validator");

const validateSignUp = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage(`Username must be between 3 and 50 characters`)
        .escape(),
    body("email").isEmail().withMessage("Incorrect email format").escape(),
    body("password")
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Password should be minimum 5 characters"),
    body("passwordConfirmation")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Confirmation password don't match"),
];

module.exports = {
    validateSignUp,
};
