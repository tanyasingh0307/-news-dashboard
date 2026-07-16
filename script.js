// Change this to your deployed backend URL once it's live on Render/Railway,
// e.g. "https://news-dashboard-backend.onrender.com/api"
const API_BASE = "http://localhost:5000/api";

let currentUser = null;      // { id, name, email } once logged in
let authToken = localStorage.getItem("token") || null;
let lastResults = [];        // last fetched news articles, kept for bookmark toggling
let bookmarkedIds = new Set(); // articleIds the current user has saved
let activeTab = "all";       // "all" | "bookmarks"

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
    if (authToken) {
        restoreSession();
    }
    fetchNews();
});

// ---------- Auth: session handling ----------
async function restoreSession() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Session expired");
        const data = await res.json();
        currentUser = data.user;
        onLoginSuccess();
    } catch (err) {
        // Token invalid/expired - clear it silently and stay logged out
        authToken = null;
        localStorage.removeItem("token");
    }
}

function onLoginSuccess() {
    document.getElementById("loggedOutBar").classList.add("hidden");
    document.getElementById("loggedInBar").classList.remove("hidden");
    document.getElementById("userGreeting").textContent = `Hi, ${currentUser.name}`;
    loadBookmarkIds();
}

function logout() {
    authToken = null;
    currentUser = null;
    bookmarkedIds = new Set();
    localStorage.removeItem("token");
    document.getElementById("loggedOutBar").classList.remove("hidden");
    document.getElementById("loggedInBar").classList.add("hidden");
    showAllNews();
}

// ---------- Modal controls ----------
function openModal(mode) {
    document.getElementById("authModal").classList.remove("hidden");
    if (mode === "signup") switchToSignup();
    else switchToLogin();
}

function closeModal() {
    document.getElementById("authModal").classList.add("hidden");
    clearFormMessages();
}

function switchToLogin() {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("signupForm").classList.add("hidden");
    clearFormMessages();
}

function switchToSignup() {
    document.getElementById("signupForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    clearFormMessages();
}

function clearFormMessages() {
    setMessage("loginMessage", "");
    setMessage("signupMessage", "");
}

function setMessage(elementId, text, type = "error") {
    const el = document.getElementById(elementId);
    el.textContent = text;
    el.className = `form-message ${text ? type : ""}`;
}

// ---------- Auth: signup / login ----------
async function signup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
        return setMessage("signupMessage", "Please fill in all fields");
    }

    try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            return setMessage("signupMessage", data.message || "Signup failed");
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem("token", authToken);
        onLoginSuccess();
        closeModal();
    } catch (err) {
        setMessage("signupMessage", "Could not reach the server. Is the backend running?");
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        return setMessage("loginMessage", "Please fill in all fields");
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            return setMessage("loginMessage", data.message || "Login failed");
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem("token", authToken);
        onLoginSuccess();
        closeModal();
    } catch (err) {
        setMessage("loginMessage", "Could not reach the server. Is the backend running?");
    }
}

// ---------- Bookmarks ----------
async function loadBookmarkIds() {
    if (!authToken) return;
    try {
        const res = await fetch(`${API_BASE}/bookmarks`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        bookmarkedIds = new Set((data.bookmarks || []).map((b) => b.articleId));
        renderCurrentTab(); // refresh bookmark button states
    } catch (err) {
        console.error("Failed to load bookmarks", err);
    }
}

async function toggleBookmark(article) {
    if (!currentUser) {
        openModal("login");
        return;
    }

    const isSaved = bookmarkedIds.has(article.link);

    try {
        if (isSaved) {
            await fetch(`${API_BASE}/bookmarks/${encodeURIComponent(article.link)}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });
            bookmarkedIds.delete(article.link);
        } else {
            await fetch(`${API_BASE}/bookmarks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    articleId: article.link,
                    title: article.title,
                    imageUrl: article.image_url,
                    sourceId: article.source_id,
                    link: article.link,
                }),
            });
            bookmarkedIds.add(article.link);
        }
        renderCurrentTab();
    } catch (err) {
        console.error("Failed to toggle bookmark", err);
    }
}

async function showBookmarks() {
    activeTab = "bookmarks";
    setActiveTab("bookmarksTab");

    if (!currentUser) {
        openModal("login");
        activeTab = "all";
        setActiveTab("allNewsTab");
        return;
    }

    const container = document.getElementById("news-container");
    container.innerHTML = "<h2 style='text-align:center;'>⏳ Loading bookmarks...</h2>";

    try {
        const res = await fetch(`${API_BASE}/bookmarks`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        const bookmarks = data.bookmarks || [];
        bookmarkedIds = new Set(bookmarks.map((b) => b.articleId));

        if (bookmarks.length === 0) {
            container.innerHTML = "<h2 style='text-align:center;'>No bookmarks yet — save articles from the All News tab.</h2>";
            return;
        }

        container.innerHTML = "";
        bookmarks.forEach((b) => {
            const article = {
                title: b.title,
                image_url: b.imageUrl,
                source_id: b.sourceId,
                link: b.link,
            };
            container.appendChild(buildCard(article));
        });
    } catch (err) {
        container.innerHTML = "<h2 style='color:red; text-align:center;'>❌ Error loading bookmarks</h2>";
    }
}

function showAllNews() {
    activeTab = "all";
    setActiveTab("allNewsTab");
    renderNewsList(lastResults);
}

function setActiveTab(activeId) {
    document.getElementById("allNewsTab").classList.remove("active");
    document.getElementById("bookmarksTab").classList.remove("active");
    document.getElementById(activeId).classList.add("active");
}

function renderCurrentTab() {
    if (activeTab === "bookmarks") showBookmarks();
    else renderNewsList(lastResults);
}

// ---------- News fetching (via backend proxy) ----------
async function fetchNews() {
    const query = document.getElementById("searchInput").value || "india";
    const container = document.getElementById("news-container");
    container.innerHTML = "<h2 style='text-align:center;'>⏳ Loading...</h2>";

    activeTab = "all";
    setActiveTab("allNewsTab");

    try {
        const response = await fetch(`${API_BASE}/news?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            lastResults = [];
            container.innerHTML = "<h2 style='text-align:center;'>No news found</h2>";
            return;
        }

        lastResults = data.results.slice(0, 6);
        if (currentUser) await loadBookmarkIds();
        renderNewsList(lastResults);
    } catch (error) {
        console.error(error);
        container.innerHTML = "<h2 style='color:red; text-align:center;'>❌ Error fetching news. Is the backend running?</h2>";
    }
}

function renderNewsList(articles) {
    const container = document.getElementById("news-container");
    container.innerHTML = "";

    if (!articles || articles.length === 0) {
        container.innerHTML = "<h2 style='text-align:center;'>No news found</h2>";
        return;
    }

    articles.forEach((news) => container.appendChild(buildCard(news)));
}

function buildCard(news) {
    const card = document.createElement("div");
    card.className = "news-card";

    const isSaved = bookmarkedIds.has(news.link);

    card.innerHTML = `
        ${news.image_url ? `<img src="${news.image_url}" />` : ""}
        <h3>${news.title}</h3>
        <p><strong>Source:</strong> ${news.source_id || "unknown"}</p>
        <a href="${news.link}" target="_blank">Read More →</a>
        <button class="bookmark-btn ${isSaved ? "saved" : ""}">
            ${isSaved ? "★ Saved" : "☆ Save"}
        </button>
    `;

    card.querySelector(".bookmark-btn").addEventListener("click", () => toggleBookmark(news));

    return card;
}
