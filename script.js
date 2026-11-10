/* ==========================================================
   Gidado Mukhtar - Personal Site
   Shared script for index.html and blog.html.
   Each feature runs only on the page that has its elements.
   ========================================================== */

// ---------- Typing effect (home page) ----------
(function () {
    const target = document.getElementById("typing");
    if (!target) return;

    const words = [
        "Software Engineer",
        "Backend Developer",
        "Cloud Enthusiast",
        "Founder of Gid Paragon"
    ];

    let wordIndex = 0;
    let charCount = 0;
    let deleting = false;

    function type() {
        const word = words[wordIndex];
        charCount += deleting ? -1 : 1;
        target.textContent = word.substring(0, charCount);

        if (!deleting && charCount === word.length) {
            deleting = true;
            setTimeout(type, 1000);
            return;
        }
        if (deleting && charCount === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }
        setTimeout(type, deleting ? 60 : 100);
    }

    type();
})();

// ---------- Scroll reveal ----------
(function () {
    const items = document.querySelectorAll(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
        items.forEach(el => el.classList.add("active"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach(el => observer.observe(el));
})();

// ---------- Mobile menu (all pages) ----------
(function () {
    const toggle = document.getElementById("menu-toggle");
    const links = document.getElementById("nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        const isOpen = links.classList.toggle("show");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            links.classList.remove("show");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
})();

// ---------- Blog (blog.html only) ----------
(function () {
    const listView = document.getElementById("list-view");
    if (!listView) return;

    const grid = document.getElementById("post-grid");
    const filtersEl = document.getElementById("filters");
    const searchEl = document.getElementById("post-search");
    const noResults = document.getElementById("no-results");
    const loadError = document.getElementById("load-error");
    const postView = document.getElementById("post-view");

    let posts = [];
    let cards = [];
    let activeCategory = "All";

    // Build elements with textContent only, so post text can never run as HTML
    function make(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function formatDate(iso) {
        const date = new Date(iso + "T00:00:00");
        if (!iso || isNaN(date)) return "";
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }

    // Tiny body format: blank line between blocks, "## " heading, "### " subheading, "- " bullets
    function renderBody(container, text) {
        String(text || "").split(/\n\s*\n/).forEach(block => {
            const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
            if (!lines.length) return;

            if (lines.every(line => line.startsWith("- "))) {
                const list = make("ul");
                lines.forEach(line => list.appendChild(make("li", "", line.slice(2))));
                container.appendChild(list);
            } else if (lines.length === 1 && lines[0].startsWith("## ")) {
                container.appendChild(make("h2", "", lines[0].slice(3)));
            } else if (lines.length === 1 && lines[0].startsWith("### ")) {
                container.appendChild(make("h3", "", lines[0].slice(4)));
            } else {
                container.appendChild(make("p", "", lines.join(" ")));
            }
        });
    }

    function buildCard(post) {
        const card = make("article", "post-card");
        card.dataset.category = post.category || "";
        card.dataset.search = [post.title, post.excerpt, post.category].join(" ").toLowerCase();

        card.appendChild(make("span", "badge", post.category || ""));
        card.appendChild(make("h3", "", post.title || ""));
        card.appendChild(make("p", "", post.excerpt || ""));
        card.appendChild(make("p", "meta", formatDate(post.date)));

        const hasBody = Boolean(post.body && post.body.trim());
        if (hasBody) {
            const button = make("a", "btn btn-outline", "Read full blog");
            button.href = "#post=" + encodeURIComponent(post.id);
            card.appendChild(button);
        } else if (post.link) {
            const button = make("a", "btn btn-outline", post.linkLabel || "Read more");
            button.href = post.link;
            button.target = "_blank";
            button.rel = "noopener";
            card.appendChild(button);
        }
        return card;
    }

    function applyFilters() {
        const query = (searchEl ? searchEl.value : "").trim().toLowerCase();
        let visible = 0;

        cards.forEach(card => {
            const matchesCategory = activeCategory === "All" || card.dataset.category === activeCategory;
            const matchesSearch = query === "" || card.dataset.search.includes(query);
            const show = matchesCategory && matchesSearch;
            card.hidden = !show;
            if (show) visible++;
        });

        noResults.hidden = visible !== 0 || posts.length === 0;
    }

    function buildFilters() {
        const categories = ["All"].concat(
            Array.from(new Set(posts.map(p => p.category).filter(Boolean))).sort()
        );

        filtersEl.textContent = "";
        categories.forEach(category => {
            const button = make("button", "filter-btn", category);
            button.type = "button";
            button.setAttribute("aria-pressed", String(category === activeCategory));
            button.addEventListener("click", () => {
                activeCategory = category;
                buildFilters();
                applyFilters();
            });
            filtersEl.appendChild(button);
        });
    }

    function renderList() {
        grid.textContent = "";
        cards = posts.map(post => {
            const card = buildCard(post);
            grid.appendChild(card);
            return card;
        });
        buildFilters();
        applyFilters();
    }

    function showList() {
        postView.hidden = true;
        listView.hidden = false;
        document.title = "Blog | Gidado Mukhtar";
    }

    function showPost(post) {
        listView.hidden = true;
        postView.hidden = false;
        document.title = post.title + " | Gidado Mukhtar";

        document.getElementById("post-category").textContent = post.category || "";
        document.getElementById("post-title").textContent = post.title || "";
        document.getElementById("post-meta").textContent = formatDate(post.date);

        const body = document.getElementById("post-body");
        body.textContent = "";
        renderBody(body, post.body);

        const actions = document.getElementById("post-link");
        actions.textContent = "";
        if (post.link) {
            const link = make("a", "btn btn-outline", post.linkLabel || "Read more");
            link.href = post.link;
            link.target = "_blank";
            link.rel = "noopener";
            actions.appendChild(link);
        }
        window.scrollTo(0, 0);
    }

    function route() {
        const match = location.hash.match(/^#post=(.+)$/);
        const id = match ? decodeURIComponent(match[1]) : null;
        const post = id ? posts.find(p => p.id === id) : null;

        if (post && post.body && post.body.trim()) {
            showPost(post);
        } else {
            showList();
        }
    }

    searchEl.addEventListener("input", applyFilters);
    window.addEventListener("hashchange", () => {
        if (posts.length) route();
    });

    fetch("posts.json", { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        })
        .then(data => {
            posts = (data.posts || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
            renderList();
            route();
        })
        .catch(() => {
            loadError.hidden = false;
        });
})();
