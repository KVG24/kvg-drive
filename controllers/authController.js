const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db/queries");

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
            return res.redirect(`/drive/${req.user.rootFolderId}`);
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

module.exports = {
    registerUser,
    logIn,
    logOut,
};
