const db = require("../db/queries");
const { getFolderPath } = require("../utils/getFolderPath");

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
    if (!req.user) {
        res.redirect("/log-in");
    }

    let folder = null;
    let files = [];
    let subfolders = [];

    folder = await db.getFolderById(parseInt(req.params.folderId, 10));
    files = await db.getFilesInFolder(folder.id);
    subfolders = await db.getSubfolders(folder.id);
    const parentFolder = folder.parentId
        ? await db.getFolderById(folder.parentId)
        : null;

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const file of files) {
        const formattedTime = new Intl.DateTimeFormat("default", {
            timeZone: userTimeZone,
            dateStyle: "medium",
            timeStyle: "short",
        }).format(file.uploadTime);

        file.uploaded = formattedTime;
    }

    const folderPath = await getFolderPath(req.params.folderId);

    res.render("drive", {
        user: req.user,
        folder,
        files,
        subfolders,
        parentFolder,
        folderPath,
    });
}

module.exports = {
    renderIndex,
    renderLogIn,
    renderSignUp,
    renderDrive,
};
