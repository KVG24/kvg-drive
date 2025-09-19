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

module.exports = {
    getUser,
    getUserById,
    getLatestUserId,
    registerUser,
};
