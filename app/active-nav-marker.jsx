"use client";

import { useEffect } from "react";

export default function ActiveNavMarker() {
  useEffect(() => {
    const findCurrentLink = (nav) => {
      const links = Array.from(nav.querySelectorAll(".nav-links a"));
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === "/guides" || path.startsWith("/guides/")) {
        return links.find((link) => new URL(link.href, window.location.href).pathname === "/guides");
      }

      if (hash) {
        const byHash = links.find((link) => {
          const url = new URL(link.href, window.location.href);
          return url.pathname === path && url.hash === hash;
        });
        if (byHash) return byHash;
      }

      if (path.includes("/articles/")) {
        return links.find((link) => link.textContent.trim().toLowerCase() === "resources");
      }

      if (path.startsWith("/tools/")) {
        return links.find((link) => link.textContent.trim().toLowerCase() === "tools");
      }

      return null;
    };

    const refresh = () => {
      document.querySelectorAll(".nav-links").forEach((nav) => {
        nav.querySelectorAll("a.is-current").forEach((link) => link.classList.remove("is-current"));
        const current = findCurrentLink(nav);
        if (current) current.classList.add("is-current");
      });
    };

    const handleClick = (event) => {
      const link = event.target.closest(".nav-links a");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const nav = link.closest(".nav-links");
      if (!nav) return;
      nav.querySelectorAll("a.is-current").forEach((item) => item.classList.remove("is-current"));
      link.classList.add("is-current");
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("hashchange", refresh);
    window.addEventListener("popstate", refresh);
    refresh();

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("popstate", refresh);
    };
  }, []);

  return null;
}
