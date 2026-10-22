/* ==========================================================
   Gidado Mukhtar - Personal Site
   Shared script for index.html and blog.html.
   Each feature runs only on the page that has its elements.
   ========================================================== */

// ---------- Typing effect (home page only) ----------
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

// ---------- Mobile menu (both pages) ----------
(function () {
    const toggle = document.getElementById("menu-toggle");
    const links = document.getElementById("nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        const isOpen = links.classList.toggle("show");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the menu after tapping a link on mobile
    links.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            links.classList.remove("show");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
})();

// ---------- Blog: search and category filter (blog page only) ----------
(function () {
    const grid = document.getElementById("post-grid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".post-card"));
    const searchInput = document.getElementById("post-search");
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
    const noResults = document.getElementById("no-results");

    let activeCategory = "all";

    function applyFilters() {
        const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
        let visible = 0;

        cards.forEach(card => {
            const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
            const haystack = (card.dataset.search || card.textContent).toLowerCase();
            const matchesSearch = query === "" || haystack.includes(query);
            const show = matchesCategory && matchesSearch;
            card.hidden = !show;
            if (show) visible++;
        });

        if (noResults) noResults.hidden = visible !== 0;
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.filter;
            filterButtons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
            applyFilters();
        });
    });

    if (searchInput) searchInput.addEventListener("input", applyFilters);

    applyFilters();
})();
