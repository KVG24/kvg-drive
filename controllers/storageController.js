const db = require("../db/queries");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { getFolderPath } = require("../utils/getFolderPath");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function uploadFiles(req, res, next) {
    try {
        for (const file of req.files) {
            // add "date-" to filename for unique name
            file.filename = Date.now() + "-" + file.originalname;

            // get full path to file
            const folderPath = await getFolderPath(req.params.folderId);
            const storagePath = `${folderPath}/${file.filename}`;

            const { data, error } = await supabase.storage
                .from("files")
                .upload(storagePath, file.buffer, { upsert: false });
            if (error) {
                console.error("Supabase error: " + error);
            }

            file.path = data.path;
            file.url = data.path;

            await db.uploadFile(
                file.originalname,
                file.filename,
                Number(req.params.folderId),
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
        const { folder, filename } = req.params;

        // get full path to file
        const folderPath = await getFolderPath(folder);
        const storagePath = `${folderPath}/${filename}`;

        // download from Supabase
        const { data, error } = await supabase.storage
            .from("files")
            .download(storagePath);

        if (error) {
            console.error("Supabase error:", error.message);
            return res.status(500).send("Error downloading file");
        }

        // convert supabase blob to buffer
        const buffer = Buffer.from(await data.arrayBuffer());

        // remove "date-" from filename
        const originalName = filename.replace(/^\d+-/, "");

        res.set({
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${originalName}"`,
            "Content-Length": buffer.length,
        });

        return res.send(buffer);
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
