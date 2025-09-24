const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db/queries");
const path = require("node:path");

async function renderIndex(req, res) {
    if (req.user) {
        res.redirect(`/drive/${req.user.rootFolderId}`);
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
    let folder = null;
    let files = [];
    let subfolders = [];

    folder = await db.getFolderById(parseInt(req.params.folderId, 10));
    files = await db.getFilesInFolder(folder.id);
    subfolders = await db.getSubfolders(folder.id);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const file of files) {
        const formatted = new Intl.DateTimeFormat("default", {
            timeZone: userTimeZone,
            dateStyle: "medium",
            timeStyle: "short",
        }).format(file.uploadTime);

        file.uploaded = formatted;
    }
    res.render("drive", { user: req.user, folder, files, subfolders });
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

async function uploadFiles(req, res, next) {
    try {
        if (!req.files) {
            return res.status(400).send("No file uploaded.");
        }

        const folder = await db.getFolderById(Number(req.params.folderId));

        for (const file of req.files) {
            await db.uploadFile(
                file.originalname,
                file.filename,
                folder.id,
                file.size
            );
        }

        res.redirect(
            req.params.folderId
                ? `/drive/${req.params.folderId}`
                : `/drive/${req.user.rootFolderId}`
        );
    } catch (err) {
        next(err);
    }
}

async function downloadFile(req, res, next) {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, "..", "uploads", filename);
        const originalName = filename.replace(/^\d+-/, "");

        res.download(filePath, originalName, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).send("Error downloading file");
            }
        });
    } catch (err) {
        next(err);
    }
}

async function createFolder(req, res, next) {
    try {
        const parentId = parseInt(req.params.folderId, 10);

        await db.createFolder(req.body.createFolderName, req.user.id, parentId);

        res.redirect(
            req.params.folderId
                ? `/drive/${req.params.folderId}`
                : `/drive/${req.user.rootFolderId}`
        );
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
    uploadFiles,
    downloadFile,
    createFolder,
};
