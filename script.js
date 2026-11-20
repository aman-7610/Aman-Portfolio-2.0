// Aman Jha portfolio interactions
const CONFIG = {
  githubUsername: "aman-7610",
  // Optional EmailJS setup. Leave placeholders until you create your own EmailJS account.
  emailjsPublicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  emailjsServiceId: "YOUR_EMAILJS_SERVICE_ID",
  emailjsTemplateId: "YOUR_EMAILJS_TEMPLATE_ID"
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const menuButton = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  function updateThemeIcon() {
    if (themeButton) themeButton.textContent = root.dataset.theme === "dark" ? "☀" : "☾";
  }
  updateThemeIcon();
  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("aman-theme", root.dataset.theme); } catch (error) {}
    updateThemeIcon();
  });

  menuButton?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "✕" : "☰";
  });
  navLinks?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) menuButton.textContent = "☰";
  }));

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Keep content visible even when JavaScript or animation observers are unavailable.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => backToTop?.classList.toggle("visible", window.scrollY > 450));
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const typing = document.getElementById("typing-text");
  if (typing) {
    const words = ["Aspiring Developer", "C++ Learner", "Frontend Developer", "Problem Solver"];
    let wordIndex = 0, charIndex = 0, deleting = false;
    function type() {
      const word = words[wordIndex];
      typing.textContent = word.slice(0, charIndex);
      if (!deleting && charIndex < word.length) { charIndex++; setTimeout(type, 85); }
      else if (!deleting) { deleting = true; setTimeout(type, 1100); }
      else if (charIndex > 0) { charIndex--; setTimeout(type, 42); }
      else { deleting = false; wordIndex = (wordIndex + 1) % words.length; setTimeout(type, 300); }
    }
    type();
  }

  loadGithubProfile();
  loadGithubRepos();
  setupProjectFilters();
  setupContactForm();
});

async function loadGithubProfile() {
  const repoEl = document.getElementById("github-repos");
  if (!repoEl) return;
  const status = document.getElementById("github-status");
  try {
    const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}`);
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const user = await response.json();
    repoEl.textContent = user.public_repos ?? "—";
    document.getElementById("github-followers").textContent = user.followers ?? "—";
    document.getElementById("github-following").textContent = user.following ?? "—";
    if (status) status.textContent = "Live public profile data from GitHub.";
  } catch (error) {
    if (status) status.textContent = "GitHub stats are temporarily unavailable. Visit my profile directly.";
  }
}

let allRepositories = [];
async function loadGithubRepos() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  const status = document.getElementById("project-status");
  try {
    const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=100&type=owner`);
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const repos = await response.json();
    allRepositories = repos.filter(repo => !repo.fork).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
    renderRepositories("all");
    if (status) status.textContent = allRepositories.length ? "Showing public repositories from GitHub." : "No public repositories found yet. Check back as I add projects.";
  } catch (error) {
    if (status) status.textContent = "Could not load repositories right now. GitHub may be rate-limiting requests; visit my profile to see the latest work.";
    grid.innerHTML = `<article class="project-card"><h3>GitHub repositories</h3><p>Repositories could not be loaded right now. You can still view them directly on GitHub.</p><div class="project-links"><a href="https://github.com/${CONFIG.githubUsername}" target="_blank" rel="noopener">Open GitHub ↗</a></div></article>`;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function renderRepositories(filter) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  const filtered = allRepositories.filter(repo => {
    if (filter === "all") return true;
    const language = (repo.language || "").toLowerCase();
    if (filter === "C++") return language === "c++" || language === "cpp";
    return language === filter.toLowerCase();
  });
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-card"><h3>No repositories in this filter yet</h3><p>Try another filter or check back later.</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(repo => {
    const description = escapeHTML(repo.description || "No description added yet.");
    const language = escapeHTML(repo.language || "Not specified");
    const name = escapeHTML(repo.name);
    const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "";
    return `<article class="project-card">
      <p class="eyebrow">GITHUB REPOSITORY</p><h3>${name}</h3><p>${description}</p>
      <div class="project-meta"><span>⌘ ${language}</span><span>★ ${repo.stargazers_count}</span><span>⑂ ${repo.forks_count}</span></div>
      <div class="project-links"><a href="${repo.html_url}" target="_blank" rel="noopener">View code ↗</a>${repo.homepage && /^https?:\/\//i.test(repo.homepage) ? `<a href="${escapeHTML(repo.homepage)}" target="_blank" rel="noopener">Live demo ↗</a>` : ""}</div>
      <small class="muted">Updated ${escapeHTML(updated)}</small>
    </article>`;
  }).join("");
}
function setupProjectFilters() {
  const filters = document.getElementById("project-filters");
  if (!filters) return;
  filters.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filters.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active", item === button));
    renderRepositories(button.dataset.filter);
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const configured = !Object.values(CONFIG).some(value => value.startsWith("YOUR_EMAILJS"));
  if (!configured) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (status) status.textContent = "The online form is not configured yet. Please email 2630BTECH1663@KIET.EDU directly.";
    });
    return;
  }
  const sdk = document.createElement("script");
  sdk.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  sdk.onload = () => {
    emailjs.init({ publicKey: CONFIG.emailjsPublicKey });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true; button.textContent = "Sending…";
      try {
        await emailjs.sendForm(CONFIG.emailjsServiceId, CONFIG.emailjsTemplateId, form);
        status.textContent = "Message sent successfully. Thank you!";
        form.reset();
      } catch (error) {
        status.textContent = "Message could not be sent. Please email me directly.";
      } finally {
        button.disabled = false; button.textContent = "Send message ↗";
      }
    });
  };
  sdk.onerror = () => { if (status) status.textContent = "Contact service could not load. Please email me directly."; };
  document.head.appendChild(sdk);
}
