const db = require("../db/queries");
const path = require("node:path");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function uploadFiles(req, res, next) {
    try {
        const folder = await db.getFolderById(Number(req.params.folderId));

        for (const file of req.files) {
            file.filename = Date.now() + "-" + file.originalname; // assign unique name

            const { data, error } = await supabase.storage
                .from("files")
                .upload(
                    `${req.params.folderId}/${file.filename}`,
                    file.buffer,
                    {
                        upsert: false,
                    }
                );
            if (error) {
                console.error("Supabase error: " + error);
            }

            file.path = data.path;
            file.url = data.path;

            await db.uploadFile(
                file.originalname,
                file.filename,
                folder.id,
                file.size,
                file.url
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
    uploadFiles,
    downloadFile,
    createFolder,
};
