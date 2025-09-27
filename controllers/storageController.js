const db = require("../db/queries");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { getFolderPath } = require("../utils/getFolderPath");
const path = require("node:path");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function uploadFiles(req, res, next) {
    try {
        for (const file of req.files) {
            // make filename unique with original file extension
            file.filename =
                crypto.randomUUID() + path.extname(file.originalname);

            // get full path to file
            const folderPath = await getFolderPath(req.params.folderId);
            const storagePath = `${folderPath}/${file.filename}`;

            const { data, error } = await supabase.storage
                .from("files")
                .upload(storagePath, file.buffer, { upsert: false });
            if (error) {
                console.error("Supabase error:", error.message);
                return res.status(500).json({ error: "Error uploading file" });
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
        const { folderId, filename } = req.params;

        // get full path to file
        const folderPath = await getFolderPath(folderId);
        const storagePath = `${folderPath}/${filename}`;

        // download from Supabase storage
        const { data, error } = await supabase.storage
            .from("files")
            .download(storagePath);

        if (error) {
            console.error("Supabase error:", error.message);
            return res.status(500).send("Error downloading file");
        }

        // convert supabase blob to buffer
        const buffer = Buffer.from(await data.arrayBuffer());

        // get file from db
        const dbFile = await db.getFileByFilename(filename);

        res.set({
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${dbFile.name}"`,
            "Content-Length": buffer.length,
        });

        return res.send(buffer);
    } catch (err) {
        next(err);
    }
}

async function deleteFile(req, res, next) {
    try {
        const { folderId, filename } = req.params;

        // get full path to file
        const folderPath = await getFolderPath(folderId);
        const storagePath = `${folderPath}/${filename}`;

        // delete from Supabase storage
        const { error } = await supabase.storage
            .from("files")
            .remove([storagePath]);
        if (error) {
            console.error("Supabase error:", error.message);
            return res.status(500).json({ error: "Error deleting file" });
        }

        // delete from database
        await db.deleteFile(filename);
        res.redirect(`/drive/${folderId}`);
    } catch (err) {
        next(err);
    }
}

async function shareFile(req, res, next) {
    try {
        const { folderId, filename } = req.params;
        const duration = Number(req.body.duration);

        // get full path to file
        const folderPath = await getFolderPath(folderId);
        const storagePath = `${folderPath}/${filename}`;

        const dbFile = await db.getFileByFilename(filename);

        // get link from Supabase storage
        const { data, error } = await supabase.storage
            .from("files")
            .createSignedUrl(storagePath, duration, {
                download: dbFile.name,
            });

        if (error) {
            console.error("Supabase error:", error.message);
            return res.status(500).json({ error: "Error creating signed URL" });
        }

        return res.json({ url: data.signedUrl }); // send JSON back to page
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

async function deleteFolder(req, res, next) {
    try {
        const targetFolderId = parseInt(req.params.folderId, 10);
        const targetFolderInDb = await db.getFolderById(targetFolderId);

        // Recursively delete all subfolders
        await deleteFolderRecursive(targetFolderId);

        res.redirect(`/drive/${targetFolderInDb.parentId}`);
    } catch (err) {
        next(err);
    }
}

// Helper function for folder deletion with subfolders
async function deleteFolderRecursive(folderId) {
    const filesInTargetFolder = await db.getFilesInFolder(folderId);
    const folderPath = await getFolderPath(folderId);

    if (filesInTargetFolder.length > 0) {
        // put all storage files paths in array
        const storagePaths = filesInTargetFolder.map(
            (file) => `${folderPath}/${file.filename}`
        );

        // delete all files in target folder in Supabase storage
        const { error } = await supabase.storage
            .from("files")
            .remove(storagePaths);
        if (error) {
            console.error("Supabase error:", error.message);
            return res
                .status(500)
                .json({ error: "Error deleting files in folder" });
        }

        await db.deleteFilesInFolder(folderId);
    }

    const subfolders = await db.getSubfolders(folderId);
    for (const subfolder of subfolders) {
        await deleteFolderRecursive(subfolder.id);
    }

    await db.deleteFolder(folderId);
}

module.exports = {
    uploadFiles,
    downloadFile,
    deleteFile,
    shareFile,
    createFolder,
    deleteFolder,
};
