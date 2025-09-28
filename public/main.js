const input = document.querySelector(".upload-files-input");
const btn = document.querySelector(".upload-files-submit-btn");

input.addEventListener("change", () => {
    btn.disabled = input.files.length === 0;
});

const overlay = document.querySelector(".modal-overlay");

function openUploadFilesModal() {
    overlay.style.display = "block";
    document.querySelector(".upload-files-modal").style.display = "flex";
}

function openCreateFolderModal() {
    overlay.style.display = "block";
    document.querySelector(".create-folder-modal").style.display = "flex";
}

function toggleConfirmDeleteModal(folderId) {
    if (overlay.style.display == "none") {
        overlay.style.display = "block";
        document.querySelector(
            `.confirm-delete-folder-modal[data-folder-id="${folderId}"]`
        ).style.display = "flex";
    } else {
        overlay.style.display = "none";
        document.querySelector(
            `.confirm-delete-folder-modal[data-folder-id="${folderId}"]`
        ).style.display = "none";
    }
}

async function openShareModal(fileId, folderId, filename) {
    overlay.style.display = "block";
    const modal = document.querySelector(
        `.share-modal[data-file-id="${fileId}"]`
    );
    modal.style.display = "flex";

    modal.querySelector(".share-file-form").onsubmit = async (e) => {
        e.preventDefault();
        const duration = modal.querySelector(".duration-select").value;

        const res = await fetch(`/share/${folderId}/${filename}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ duration }),
        });

        const data = await res.json();

        if (data.url) {
            modal.querySelector(".share-link-textarea").value = data.url;
        } else {
            modal.querySelector(".share-link-textarea").value =
                "Error creating link";
        }
    };
}

function closeModals() {
    document.querySelector(".upload-files-modal").style.display = "none";
    document.querySelector(".create-folder-modal").style.display = "none";
    document.querySelectorAll(".share-modal").forEach((modal) => {
        modal.style.display = "none";
    });
    document
        .querySelectorAll(".confirm-delete-folder-modal")
        .forEach((modal) => {
            modal.style.display = "none";
        });
    overlay.style.display = "none";
}

overlay.addEventListener("click", closeModals);

// "Copy link" button functionality
document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const fileId = btn.dataset.fileId;
        const textarea = document.getElementById(`share-text-${fileId}`);
        if (!textarea) return;

        navigator.clipboard
            .writeText(textarea.value)
            .then(() => {
                const originalText = btn.textContent;
                btn.textContent = "Copied!";
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            })
            .catch((err) => console.error(err));
    });
});

// enter folder on click
document.querySelectorAll(".folder").forEach((folder) => {
    folder.addEventListener("click", (e) => {
        // ignore clicks "delete folder" button
        if (e.target.closest("button")) return;
        window.location.href = `/drive/${folder.dataset.id}`;
    });
});

// Loader functionality
const loader = document.querySelector(".loader-overlay");
const buttons = document.querySelectorAll(
    ".delete-btn, .upload-files-submit-btn, .create-folder-submit-btn, .confirm-delete-folder-btn"
);

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        loader.style.display = "flex";
    });
});
