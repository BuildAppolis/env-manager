import { c as createComponent, d as renderComponent, r as renderTemplate } from '../chunks/astro/server_DE_7F_eO.mjs';
import { V as VersionFooter, $ as $$Layout8Bit } from '../chunks/VersionFooter_Vpp1rbF1.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { FolderOpen, RefreshCw, Key, GitBranch, Lock, Square, Play, Trash2 } from 'lucide-react';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

function ProjectSelector({ onProjectSelect }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMode, setPasswordMode] = useState("setup");
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
    recoveryPhrase: "",
    projectPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [hasGlobalPassword, setHasGlobalPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    loadProjects();
    checkPasswordStatus();
  }, []);
  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };
  const checkPasswordStatus = async () => {
    try {
      const response = await fetch("/api/password");
      const data = await response.json();
      setHasGlobalPassword(data.hasGlobalPassword);
    } catch (error) {
      console.error("Failed to check password status:", error);
    }
  };
  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    if (project.hasProjectPassword) {
      setPasswordMode("verify");
      setShowPasswordModal(true);
    } else {
      if (onProjectSelect) {
        onProjectSelect(project);
      }
    }
  };
  const handlePasswordSubmit = async () => {
    setPasswordError("");
    try {
      if (passwordMode === "setup") {
        if (passwordForm.password !== passwordForm.confirmPassword) {
          setPasswordError("Passwords do not match");
          return;
        }
        const response = await fetch("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "setup",
            password: passwordForm.password
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error);
          return;
        }
        setRecoveryPhrase(data.recoveryPhrase);
        setHasGlobalPassword(true);
        alert(`Password set! Your recovery phrase is:

${data.recoveryPhrase}

SAVE THIS PHRASE! You'll need it to recover your password.`);
        setShowPasswordModal(false);
        resetPasswordForm();
      }
      if (passwordMode === "verify") {
        const response = await fetch("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify",
            password: passwordForm.password,
            projectPath: selectedProject?.path
          })
        });
        const data = await response.json();
        if (!response.ok || !data.valid) {
          setPasswordError("Invalid password");
          return;
        }
        if (data.requiresProjectPassword && !data.projectValid) {
          setPasswordError("Project password required");
          return;
        }
        setShowPasswordModal(false);
        resetPasswordForm();
        if (selectedProject && onProjectSelect) {
          onProjectSelect(selectedProject);
        }
      }
      if (passwordMode === "change") {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setPasswordError("New passwords do not match");
          return;
        }
        const response = await fetch("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "change",
            password: passwordForm.password,
            newPassword: passwordForm.newPassword
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error);
          return;
        }
        setRecoveryPhrase(data.recoveryPhrase);
        alert(`Password changed! Your new recovery phrase is:

${data.recoveryPhrase}

SAVE THIS PHRASE!`);
        setShowPasswordModal(false);
        resetPasswordForm();
      }
      if (passwordMode === "recover") {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setPasswordError("New passwords do not match");
          return;
        }
        const response = await fetch("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "recover",
            recoveryPhrase: passwordForm.recoveryPhrase,
            newPassword: passwordForm.newPassword
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error);
          return;
        }
        setRecoveryPhrase(data.recoveryPhrase);
        alert(`Password recovered! Your new recovery phrase is:

${data.recoveryPhrase}

SAVE THIS PHRASE!`);
        setShowPasswordModal(false);
        resetPasswordForm();
      }
    } catch (error) {
      setPasswordError("Operation failed. Please try again.");
    }
  };
  const handleProjectAction = async (project, action) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          projectPath: project.path,
          port: project.port
        })
      });
      if (response.ok) {
        await loadProjects();
      }
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
    }
  };
  const resetPasswordForm = () => {
    setPasswordForm({
      password: "",
      newPassword: "",
      confirmPassword: "",
      recoveryPhrase: "",
      projectPassword: ""
    });
    setPasswordError("");
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setTimeout(() => setRefreshing(false), 500);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "animate-pulse text-yellow-400", children: "Loading projects..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "pixel-borders bg-gray-900 p-6 rounded-lg", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-xl text-yellow-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(FolderOpen, { className: "w-6 h-6" }),
        "Projects"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleRefresh,
            className: `pixel-button bg-blue-600 hover:bg-blue-700 text-white p-2 ${refreshing ? "animate-spin" : ""}`,
            title: "Refresh",
            children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
          }
        ),
        hasGlobalPassword && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setPasswordMode("change");
              setShowPasswordModal(true);
            },
            className: "pixel-button bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Key, { className: "w-4 h-4" }),
              "Change Password"
            ]
          }
        )
      ] })
    ] }),
    projects.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-400", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2", children: "No projects found" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: 'Run "env-manager init" in a project directory to get started' })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: projects.map((project) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `pixel-borders bg-gray-800 p-4 rounded-lg transition-all hover:bg-gray-700 ${project.isActive ? "ring-2 ring-yellow-400" : ""}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg text-cyan-400", children: project.packageInfo?.name || project.name }),
              project.isRunning && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-green-400 text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full animate-pulse" }),
                "LIVE"
              ] }),
              project.gitBranch && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-purple-400 text-xs", children: [
                /* @__PURE__ */ jsx(GitBranch, { className: "w-3 h-3" }),
                project.gitBranch
              ] }),
              project.hasProjectPassword && /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-yellow-400" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-400 space-y-1", children: [
              project.packageInfo?.version && /* @__PURE__ */ jsxs("p", { children: [
                "Version: ",
                project.packageInfo.version
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "truncate", title: `Full path: ${project.path}`, children: [
                "Path: ",
                project.path
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Port: ",
                project.port
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Last accessed: ",
                new Date(project.lastAccessed).toLocaleDateString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: project.exists ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleProjectSelect(project),
                className: "pixel-button bg-green-600 hover:bg-green-700 text-white p-2",
                title: "Open project",
                children: /* @__PURE__ */ jsx(FolderOpen, { className: "w-4 h-4" })
              }
            ),
            project.isRunning ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleProjectAction(project, "stop"),
                className: "pixel-button bg-red-600 hover:bg-red-700 text-white p-2",
                title: "Stop project",
                children: /* @__PURE__ */ jsx(Square, { className: "w-4 h-4" })
              }
            ) : /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleProjectAction(project, "start"),
                className: "pixel-button bg-blue-600 hover:bg-blue-700 text-white p-2",
                title: "Start project",
                children: /* @__PURE__ */ jsx(Play, { className: "w-4 h-4" })
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleProjectAction(project, "remove"),
              className: "pixel-button bg-red-600 hover:bg-red-700 text-white p-2",
              title: "Remove from list (project not found)",
              children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
            }
          ) })
        ] })
      },
      project.id
    )) }),
    showPasswordModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "pixel-borders bg-gray-900 p-6 rounded-lg max-w-md w-full", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-xl text-yellow-400 mb-4", children: [
        passwordMode === "setup" && "🔐 Setup Master Password",
        passwordMode === "verify" && "🔓 Enter Password",
        passwordMode === "change" && "🔄 Change Password",
        passwordMode === "recover" && "🔑 Recover Password"
      ] }),
      passwordError && /* @__PURE__ */ jsx("div", { className: "mb-4 p-2 bg-red-900 border border-red-400 rounded text-red-300 text-sm", children: passwordError }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        handlePasswordSubmit();
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          passwordMode === "recover" ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-cyan-400 text-sm mb-1", children: "Recovery Phrase" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: passwordForm.recoveryPhrase,
                onChange: (e) => setPasswordForm({ ...passwordForm, recoveryPhrase: e.target.value }),
                className: "pixel-input w-full bg-gray-800 text-white p-2 rounded",
                placeholder: "Enter your recovery phrase"
              }
            )
          ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: (passwordMode === "verify" || passwordMode === "change") && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-cyan-400 text-sm mb-1", children: passwordMode === "change" ? "Current Password" : "Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                value: passwordForm.password,
                onChange: (e) => setPasswordForm({ ...passwordForm, password: e.target.value }),
                className: "pixel-input w-full bg-gray-800 text-white p-2 rounded",
                placeholder: "Enter password"
              }
            )
          ] }) }),
          (passwordMode === "setup" || passwordMode === "change" || passwordMode === "recover") && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-cyan-400 text-sm mb-1", children: passwordMode === "setup" ? "Password" : "New Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  value: passwordMode === "setup" ? passwordForm.password : passwordForm.newPassword,
                  onChange: (e) => setPasswordForm({
                    ...passwordForm,
                    [passwordMode === "setup" ? "password" : "newPassword"]: e.target.value
                  }),
                  className: "pixel-input w-full bg-gray-800 text-white p-2 rounded",
                  placeholder: "Enter new password (min 6 chars)"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-cyan-400 text-sm mb-1", children: "Confirm Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  value: passwordForm.confirmPassword,
                  onChange: (e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }),
                  className: "pixel-input w-full bg-gray-800 text-white p-2 rounded",
                  placeholder: "Confirm password"
                }
              )
            ] })
          ] }),
          selectedProject?.hasProjectPassword && passwordMode === "verify" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-cyan-400 text-sm mb-1", children: "Project Password (if different)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                value: passwordForm.projectPassword,
                onChange: (e) => setPasswordForm({ ...passwordForm, projectPassword: e.target.value }),
                className: "pixel-input w-full bg-gray-800 text-white p-2 rounded",
                placeholder: "Enter project-specific password"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-6", children: [
          passwordMode === "verify" && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setPasswordMode("recover");
                resetPasswordForm();
              },
              className: "text-purple-400 hover:text-purple-300 text-sm",
              children: "Forgot password?"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 ml-auto", children: [
            passwordMode !== "setup" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                },
                className: "pixel-button bg-gray-600 hover:bg-gray-700 text-white px-4 py-2",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                className: "pixel-button bg-green-600 hover:bg-green-700 text-white px-4 py-2",
                children: [
                  passwordMode === "setup" && "Setup Password",
                  passwordMode === "verify" && "Unlock",
                  passwordMode === "change" && "Change Password",
                  passwordMode === "recover" && "Reset Password"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
}

function MainApp() {
  const handleProjectSelect = (project) => {
    const projectName = project.packageInfo?.name || project.name || "project";
    const branch = project.gitBranch || "main";
    const cleanProjectName = projectName.replace(/^@[^/]+\//, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    window.location.href = `/${cleanProjectName}/${branch}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-900 p-4 pb-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl mb-2 text-yellow-400 animate-pulse", children: "🔧 ENV MANAGER" }),
        /* @__PURE__ */ jsx("p", { className: "text-cyan-300 text-sm", children: "SELECT A PROJECT TO MANAGE ENVIRONMENT VARIABLES" })
      ] }),
      /* @__PURE__ */ jsx(ProjectSelector, { onProjectSelect: handleProjectSelect })
    ] }),
    /* @__PURE__ */ jsx(VersionFooter, {})
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout8Bit", $$Layout8Bit, { "projectName": "Env Manager", "gitBranch": null }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MainApp", MainApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/cory-ubuntu/coding/projects/env-manager/src/components/MainApp", "client:component-export": "default" })} ` })}`;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/pages/index.astro", void 0);

const $$file = "/home/cory-ubuntu/coding/projects/env-manager/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
