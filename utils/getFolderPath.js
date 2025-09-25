const db = require("../db/queries");

async function getFolderPath(folderId) {
    const parts = [];
    let current = await db.getFolderById(Number(folderId));

    while (current) {
        parts.unshift(current.name); // add to beginning
        if (!current.parentId) break; // stop at root
        current = await db.getFolderById(Number(current.parentId));
    }

    return parts.join("/");
}

module.exports = {
    getFolderPath,
};
