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

async function getFolder(ownerId, parentId, name) {
    return await prisma.folder.findFirst({
        where: {
            ownerId,
            parentId,
            name,
        },
    });
}

async function getFiles(folderName) {
    return await prisma.file.findMany({
        where: {
            folder: {
                name: folderName,
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

module.exports = {
    getUser,
    getUserById,
    getLatestUserId,
    getFolder,
    getFiles,
    registerUser,
    uploadFile,
};
