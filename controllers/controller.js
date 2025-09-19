const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db/queries");

async function renderIndex(req, res) {
    res.render("index");
}

function renderSignUp(req, res) {
    res.render("sign-up", {
        errors: null,
        inputValues: {
            username: "",
            email: "",
        },
    });
}

function renderLogIn(req, res) {
    res.render("log-in", { error: null });
}

function renderDrive(req, res) {
    res.render("drive", { user: req.user });
}

async function registerUser(req, res, next) {
    try {
        const { username, password, email } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("sign-up", {
                errors: errors.array(),
                inputValues: {
                    username: username || "",
                    email: email || "",
                },
            });
        }

        const registeredUsername = await db.getUser(username);
        if (registeredUsername) {
            return res.render("sign-up", {
                errors: [{ msg: "Username already taken" }],
                inputValues: {
                    username: username || "",
                    email: email || "",
                },
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.registerUser(email, username, hashedPassword);
        res.redirect("/log-in");
    } catch (err) {
        console.error(err);
        next(err);
    }
}

function logIn(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.render("log-in", {
                error: info?.message,
            });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect("/drive");
        });
    })(req, res, next);
}

function logOut(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
}

function uploadFile(req, res, next) {}

module.exports = {
    renderIndex,
    renderSignUp,
    renderLogIn,
    renderDrive,
    registerUser,
    logIn,
    logOut,
    uploadFile,
};
