(() => {
  "use strict";
  const data = window.SITE_DATA || {};
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".site-nav");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  function setMenu(open) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.querySelector(".sr-only").textContent = open ? "Close navigation" : "Open navigation";
    nav.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
  }
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.10 })
    : null;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (revealObserver) revealObserver.observe(element); else element.classList.add("visible");
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-22% 0px -58% 0px", threshold: [0, .15, .5] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  document.querySelectorAll("[data-project]").forEach((link) => {
    const url = data.projects?.[link.dataset.project];
    if (!url) return;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  const profileUrls = {
    github: data.githubUsername ? `https://github.com/${data.githubUsername}` : "",
    linkedin: data.linkedinUrl || "",
    email: data.email ? `mailto:${data.email}` : ""
  };
  document.querySelectorAll("[data-profile]").forEach((link) => {
    const url = profileUrls[link.dataset.profile];
    if (!url) return;
    link.href = url;
    if (link.dataset.profile !== "email") { link.target = "_blank"; link.rel = "noopener noreferrer"; }
  });

  const cards = [...document.querySelectorAll(".project-card[data-roles]")];
  const filterButtons = [...document.querySelectorAll(".filter-button[data-filter]")];
  const emptyState = document.querySelector("#filter-empty");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      let visibleCount = 0;
      cards.forEach((card) => {
        const roles = (card.dataset.roles || "").split(/\s+/);
        const visible = filter === "all" || roles.includes(filter);
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
  });

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
