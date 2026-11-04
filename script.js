(() => {
  const ROUTES = {
    "/": "home",
    "/work": "work",
    "/about": "about",
  };

  const TITLES = {
    home: "Lorenzo Cicinato",
    work: "Lorenzo Cicinato – Work",
    about: "Lorenzo Cicinato – About",
  };

  const useHash = location.protocol === "file:";

  const currentPath = () =>
    (useHash ? location.hash.slice(1) : location.pathname).replace(/\/+$/, "") || "/";

  function render(announce = false) {
    const view = ROUTES[currentPath()] || "home";

    document.documentElement.dataset.view = view;
    document.title = TITLES[view];

    const live = document.getElementById("announce");
    if (live && announce) live.textContent = TITLES[view];

    document.querySelectorAll(".nav a").forEach((a) => {
      if (a.dataset.link === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function go(path) {
    if (path === currentPath()) return;

    if (useHash) {
      location.hash = path;
      return;
    }
    history.pushState(null, "", path);
    render(true);
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (!link) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    go(link.getAttribute("href"));
  });

  window.addEventListener("popstate", () => render(true));
  window.addEventListener("hashchange", () => render(true));

  render();

  if (document.documentElement.dataset.view === "home") {
    document.documentElement.classList.add("intro");
    document.addEventListener("animationend", (e) => {
      if (e.target.matches(".footer")) document.documentElement.classList.remove("intro");
    });
  }
  document.addEventListener("DOMContentLoaded", () => render());
})();
