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

async function getLatestUserId() {
    const user = await prisma.user.findFirst({
        orderBy: { id: "desc" },
        select: { id: true },
    });
    return user?.id;
}

async function getFolder(ownerId, parentId) {
    return await prisma.folder.findFirst({
        where: {
            ownerId,
            parentId,
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

async function getRootSubfolders(userId) {
    return await prisma.folder.findMany({
        where: {
            ownerId: userId,
            parentId: 1,
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

async function getFilesInRoot(userId) {
    return await prisma.file.findMany({
        where: {
            folder: {
                ownerId: userId,
            },
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
    await prisma.user.create({
        data: {
            email,
            username,
            password,
            Folder: {
                create: {
                    name: `${username}-main`,
                },
            },
        },
        include: { Folder: true },
    });
}

async function uploadFile(name, filename, folderId, size) {
    await prisma.file.create({
        data: {
            name,
            filename,
            folderId,
            size,
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
    getLatestUserId,
    getFolder,
    getFolderById,
    getSubfolders,
    getRootSubfolders,
    getFilesInRoot,
    getFilesInFolder,
    registerUser,
    uploadFile,
    createFolder,
};
