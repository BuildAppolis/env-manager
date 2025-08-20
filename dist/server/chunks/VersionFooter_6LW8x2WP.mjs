import { c as createComponent, a as createAstro, e as renderHead, f as renderSlot, r as renderTemplate } from './astro/server_DE_7F_eO.mjs';
import 'clsx';
/* empty css                          */
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

const $$Astro = createAstro();
const $$Layout8Bit = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout8Bit;
  const { projectName, gitBranch } = Astro2.props;
  let title = "Env Manager | BuildAppolis";
  if (projectName) {
    const branchPart = gitBranch ? `[${gitBranch}]` : "";
    title = `${projectName}${branchPart} | Env Manager | BuildAppolis`;
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="Env Manager - 8-bit themed environment management"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900"> <div class="relative min-h-screen"> <!-- Animated retro grid background --> <div class="fixed inset-0 overflow-hidden pointer-events-none"> <div class="absolute inset-0 bg-[linear-gradient(transparent_63%,rgba(255,0,255,0.1)_64%,rgba(255,0,255,0.1)_65%,transparent_66%),linear-gradient(90deg,transparent_63%,rgba(0,255,255,0.1)_64%,rgba(0,255,255,0.1)_65%,transparent_66%)] bg-[length:50px_50px] animate-pulse"></div> </div> <!-- Main content --> <div class="relative z-10"> ${renderSlot($$result, $$slots["default"])} </div> </div> </body></html>`;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/layouts/Layout8Bit.astro", void 0);

function VersionFooter() {
  const [versionInfo, setVersionInfo] = useState(null);
  useEffect(() => {
    fetch("/api/version").then((res) => res.json()).then((data) => setVersionInfo(data)).catch((err) => console.error("Failed to fetch version:", err));
  }, []);
  if (!versionInfo) return null;
  const getEnvironmentColor = () => {
    switch (versionInfo.environment) {
      case "development":
        return "text-yellow-400";
      case "production":
        return "text-green-400";
      case "local":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };
  const getEnvironmentIcon = () => {
    switch (versionInfo.environment) {
      case "development":
        return "🔧";
      case "production":
        return "✅";
      case "local":
        return "🏠";
      default:
        return "📦";
    }
  };
  return /* @__PURE__ */ jsx("footer", { className: "fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-gray-800 px-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex justify-between items-center text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
        "ENV MANAGER v",
        versionInfo.version
      ] }),
      /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1 ${getEnvironmentColor()}`, children: [
        getEnvironmentIcon(),
        " ",
        versionInfo.environment.toUpperCase()
      ] }),
      versionInfo.isPublished && /* @__PURE__ */ jsx("span", { className: "text-cyan-400", children: "📦 PUBLISHED" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-gray-600", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " BuildAppolis"
    ] })
  ] }) });
}

export { $$Layout8Bit as $, VersionFooter as V };
