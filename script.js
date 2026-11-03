/* ==========================================================================
   Router minimale: tre viste (home, work, about) in un'unica pagina.

   Cosa fa, e basta:
   1. legge l'URL e ne ricava la vista attiva;
   2. la scrive in <html data-view="...">  (il CSS fa il resto, animazioni incluse);
   3. intercetta i click sui link interni [data-link] e aggiorna l'URL
      senza ricaricare la pagina (History API);
   4. aggiorna il titolo della scheda e la voce attiva della nav.

   Il tasto indietro/avanti funziona perché ascoltiamo "popstate".
   ========================================================================== */
(() => {
  // percorso -> vista
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

  // Aprendo il file con doppio clic (file://) il browser non permette di
  // cambiare il percorso dell'URL: in quel caso usiamo l'hash (#/work).
  // Su un server vero (http/https) gli URL sono quelli puliti: /work, /about.
  const useHash = location.protocol === "file:";

  // Percorso corrente, senza slash finale ("/work/" -> "/work", "" -> "/")
  const currentPath = () =>
    (useHash ? location.hash.slice(1) : location.pathname).replace(/\/+$/, "") || "/";

  function render(announce = false) {
    const view = ROUTES[currentPath()] || "home";

    document.documentElement.dataset.view = view;
    document.title = TITLES[view];

    // Chi usa uno screen reader non "vede" il cambio di vista: lo annunciamo
    // (solo dopo una navigazione, non al primo caricamento).
    const live = document.getElementById("announce");
    if (live && announce) live.textContent = TITLES[view];

    // Voce attiva della nav (la rende nera: vedi .nav a[aria-current] nel CSS).
    // Questa parte ha senso solo quando la nav esiste già: per questo
    // render() viene richiamata anche a DOMContentLoaded.
    document.querySelectorAll(".nav a").forEach((a) => {
      if (a.dataset.link === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function go(path) {
    if (path === currentPath()) return;       // già lì: niente da fare

    if (useHash) {
      location.hash = path;                   // "hashchange" richiama render()
      return;
    }
    history.pushState(null, "", path);        // cambia l'URL senza ricaricare
    render(true);
  }

  // Click sui link interni (quelli con data-link). Lasciamo stare i click
  // con Cmd/Ctrl/Shift (apri in nuova scheda) e quelli col tasto non sinistro.
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (!link) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    go(link.getAttribute("href"));
  });

  window.addEventListener("popstate", () => render(true));     // indietro / avanti
  window.addEventListener("hashchange", () => render(true));   // solo modalità file://

  render();                                        // subito: imposta data-view

  // Intro: solo quando la pagina SI APRE (o si ricarica) sulla Home.
  // Questo codice gira una volta sola, al caricamento: navigando da Work o
  // About verso la Home non viene rieseguito, quindi l'intro non riparte.
  // La classe si toglie quando finisce l'ultimo elemento (il footer).
  if (document.documentElement.dataset.view === "home") {
    document.documentElement.classList.add("intro");
    document.addEventListener("animationend", (e) => {
      if (e.target.matches(".footer")) document.documentElement.classList.remove("intro");
    });
  }
  document.addEventListener("DOMContentLoaded", () => render());   // poi sistema la nav
})();
