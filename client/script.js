const API_URL = "/api/projects";

const projectForm = document.getElementById("projectForm");
const projectGrid = document.getElementById("projectGrid");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");
const projectMessage = document.getElementById("projectMessage");

// Escape user-provided text before inserting it into HTML.
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Only allow valid HTTP or HTTPS URLs.
function validWebURL(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function showMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "#c62828" : "#16803c";
}

// Load approved projects for the public gallery.
async function loadProjects() {
    if (!projectGrid) return;

    projectGrid.innerHTML = "<p>Loading projects...</p>";

    try {
        const response = await fetch(`${API_URL}?status=approved`);
        if (!response.ok) throw new Error("Could not load projects.");

        const projects = await response.json();
        renderProjects(projects);
        updateTagOptions(projects);
    } catch (error) {
        projectGrid.textContent = error.message;
    }
}

// Display project cards and apply search/tag filters.
function renderProjects(projects) {
    if (!projectGrid) return;

    const query = (searchInput?.value || "").trim().toLowerCase();
    const selectedTag = tagFilter?.value || "";

    const filtered = projects.filter((project) => {
        const tags = Array.isArray(project.tags)
            ? project.tags
            : String(project.tags || "").split(",").map(tag => tag.trim());

        const matchesSearch = [
            project.title,
            project.student_name,
            project.description,
            ...tags
        ].some(value => String(value || "").toLowerCase().includes(query));

        const matchesTag = !selectedTag || tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    if (filtered.length === 0) {
        projectGrid.innerHTML = "<p>No matching approved projects found.</p>";
        return;
    }

    projectGrid.innerHTML = filtered.map(project => {
        const tags = Array.isArray(project.tags)
            ? project.tags
            : String(project.tags || "").split(",").map(tag => tag.trim());

        const githubURL = validWebURL(project.github_url)
            ? project.github_url
            : "";

        const demoURL = validWebURL(project.live_url)
            ? project.live_url
            : "";

        return `
      <article class="project-card">
        <h3>${escapeHTML(project.title)}</h3>
        <p>By ${escapeHTML(project.student_name)}</p>
        <p>${escapeHTML(project.description)}</p>
        <div class="project-tags">
          ${tags.map(tag =>
            `<span class="tag">${escapeHTML(tag)}</span>`
        ).join("")}
        </div>
        <div class="project-links">
          ${githubURL
                ? `<a href="${escapeHTML(githubURL)}" target="_blank" rel="noopener noreferrer">GitHub</a>`
                : ""}
          ${demoURL
                ? `<a href="${escapeHTML(demoURL)}" target="_blank" rel="noopener noreferrer">Live Demo</a>`
                : ""}
        </div>
      </article>
    `;
    }).join("");
}

function updateTagOptions(projects) {
    if (!tagFilter) return;

    const previous = tagFilter.value;
    const tags = [...new Set(projects.flatMap(project =>
        Array.isArray(project.tags)
            ? project.tags
            : String(project.tags || "").split(",").map(tag => tag.trim())
    ).filter(Boolean))].sort();

    tagFilter.innerHTML =
        '<option value="">All tags</option>' +
        tags.map(tag =>
            `<option value="${escapeHTML(tag)}">${escapeHTML(tag)}</option>`
        ).join("");

    if (tags.includes(previous)) tagFilter.value = previous;
}

// Validate and submit a new project.
if (projectForm) {
    projectForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(projectForm);
        const title = String(formData.get("title") || "").trim();
        const studentName = String(formData.get("student_name") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const tags = String(formData.get("tags") || "")
            .split(",").map(tag => tag.trim()).filter(Boolean);
        const githubURL = String(formData.get("github_url") || "").trim();
        const liveURL = String(formData.get("live_url") || "").trim();

        if (!title || !studentName || !description || tags.length === 0) {
            showMessage(projectMessage, "Please complete all required fields.", true);
            return;
        }

        if (!validWebURL(githubURL) || !validWebURL(liveURL)) {
            showMessage(projectMessage, "Enter valid HTTP or HTTPS GitHub and demo URLs.", true);
            return;
        }

        const submitButton = projectForm.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    student_name: studentName,
                    description,
                    tags,
                    github_url: githubURL,
                    live_url: liveURL
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Submission failed.");
            }

            showMessage(
                projectMessage,
                result.message || "Project submitted for admin approval!"
            );
            projectForm.reset();
            await loadProjects();
        } catch (error) {
            showMessage(projectMessage, error.message, true);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// Reactively update the gallery.
searchInput?.addEventListener("input", loadProjects);
tagFilter?.addEventListener("change", loadProjects);

// Admin moderation: requires an admin page with these elements.
async function loadAdminProjects() {
    const adminGrid = document.getElementById("adminProjectGrid");
    const adminMessage = document.getElementById("adminMessage");
    if (!adminGrid) return;

    adminGrid.innerHTML = "<p>Loading submissions...</p>";

    try {
        const response = await fetch(`${API_URL}?status=pending`);
        if (!response.ok) throw new Error("Could not load pending submissions.");

        const projects = await response.json();

        if (!projects.length) {
            adminGrid.innerHTML = "<p>No pending submissions.</p>";
            return;
        }

        adminGrid.innerHTML = projects.map(project => `
      <article class="project-card">
        <h3>${escapeHTML(project.title)}</h3>
        <p>Student: ${escapeHTML(project.student_name)}</p>
        <p>${escapeHTML(project.description)}</p>
        <p>Tags: ${escapeHTML(
            Array.isArray(project.tags) ? project.tags.join(", ") : project.tags
        )}</p>
        <button type="button" data-moderate="approved" data-id="${Number(project.id)}">
          Approve
        </button>
        <button type="button" data-moderate="rejected" data-id="${Number(project.id)}">
          Reject
        </button>
      </article>
    `).join("");

        adminGrid.querySelectorAll("[data-moderate]").forEach(button => {
            button.addEventListener("click", async () => {
                button.disabled = true;

                try {
                    const result = await fetch(
                        `${API_URL}/${Number(button.dataset.id)}/moderate`,
                        {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: button.dataset.moderate })
                        }
                    );

                    const data = await result.json();
                    if (!result.ok) {
                        throw new Error(data.error || "Moderation failed.");
                    }

                    showMessage(adminMessage, data.message || "Submission updated.");
                    await loadAdminProjects();
                    await loadProjects();
                } catch (error) {
                    showMessage(adminMessage, error.message, true);
                    button.disabled = false;
                }
            });
        });
    } catch (error) {
        adminGrid.textContent = error.message;
    }
}

document.getElementById("refreshAdmin")
    ?.addEventListener("click", loadAdminProjects);

loadProjects();
loadAdminProjects();
