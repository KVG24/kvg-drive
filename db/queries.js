const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getUser(username) {
    return await prisma.user.findFirst({
        where: {
            username,
        },
    });
}

async function getUserById(id) {
    return await prisma.user.findUnique({
        where: {
            id,
        },
    });
}

async function getFolder(ownerId, parentId) {
    return await prisma.folder.findFirst({
        where: {
            ownerId,
            parentId,
        },
    });
}

async function getFolderById(id) {
    return await prisma.folder.findUnique({
        where: {
            id,
        },
    });
}

async function getSubfolders(folderId) {
    return await prisma.folder.findMany({
        where: {
            parentId: folderId,
        },
    });
}

async function getFilesInFolder(folderId) {
    return await prisma.file.findMany({
        where: {
            folder: {
                id: folderId,
            },
        },
    });
}

async function registerUser(email, username, password) {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: { email, username, password },
        });

        const rootFolder = await tx.folder.create({
            data: {
                name: `${username}-main`,
                ownerId: user.id,
            },
        });

        return await tx.user.update({
            where: { id: user.id },
            data: { rootFolderId: rootFolder.id },
            include: { rootFolder: true },
        });
    });
}

async function uploadFile(name, filename, folderId, size, url) {
    await prisma.file.create({
        data: {
            name,
            filename,
            folderId,
            size,
            url,
        },
    });
}

async function createFolder(name, ownerId, parentId) {
    await prisma.folder.create({
        data: {
            name,
            ownerId,
            parentId,
        },
    });
}

module.exports = {
    getUser,
    getUserById,
    getFolder,
    getFolderById,
    getSubfolders,
    getFilesInFolder,
    registerUser,
    uploadFile,
    createFolder,
};
