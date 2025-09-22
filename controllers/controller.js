const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db/queries");

async function renderIndex(req, res) {
    if (req.user) {
        res.redirect("/drive");
    } else {
        res.render("index");
    }
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

async function renderDrive(req, res) {
    const files = await db.getFiles(`${req.user.username}-main`);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const file of files) {
        const formatted = new Intl.DateTimeFormat("default", {
            timeZone: userTimeZone,
            dateStyle: "medium",
            timeStyle: "short",
        }).format(file.uploadTime);

        file.uploaded = formatted;
        file.size = file.size / 1000;
    }
    res.render("drive", { user: req.user, files });
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

async function uploadFile(req, res, next) {
    try {
        if (!req.files) {
            return res.status(400).send("No file uploaded.");
        }

        const folder = await db.getFolder(
            req.user.id,
            null,
            `${req.user.username}-main`
        );

        if (!folder) {
            return res.status(404).send("Main folder not found for user.");
        }

        for (const file of req.files) {
            await db.uploadFile(file.originalname, folder.id, file.size);
        }

        res.redirect("/drive");
    } catch (err) {
        next(err);
    }
}

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
