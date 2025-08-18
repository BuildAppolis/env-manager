import { c as createComponent, a as createAstro, m as maybeRenderHead, r as renderTemplate, b as addAttribute, d as renderHead, e as renderComponent } from '../chunks/astro/server_dQA6Nnp7.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro$2 = createAstro();
const $$AuthStatus = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AuthStatus;
  const { authenticated = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="auth-status" id="authStatus" data-astro-cid-kme7x277> <span class="status-indicator" id="statusIndicator" data-astro-cid-kme7x277> ${authenticated ? "\u{1F513}" : "\u{1F512}"} </span> <span id="statusText" data-astro-cid-kme7x277> ${authenticated ? "Authenticated" : "Not Authenticated"} </span> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/AuthStatus.astro", void 0);

const $$LoginForm = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="loginSection" class="section" data-astro-cid-kl5b6njz> <h2 data-astro-cid-kl5b6njz>Authentication Required</h2> <form id="loginForm" data-astro-cid-kl5b6njz> <div class="form-group" data-astro-cid-kl5b6njz> <label for="password" data-astro-cid-kl5b6njz>Password:</label> <input type="password" id="password" name="password" required data-astro-cid-kl5b6njz> </div> <button type="submit" class="btn-primary" data-astro-cid-kl5b6njz>Login</button> </form> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/LoginForm.astro", void 0);

const $$Astro$1 = createAstro();
const $$TabBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$TabBar;
  const { activeTab = "variables" } = Astro2.props;
  const tabs = [
    { id: "variables", label: "Variables" },
    { id: "snapshots", label: "Snapshots" },
    { id: "project", label: "Project Status" }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="tabs" data-astro-cid-s6oy5d3q> ${tabs.map((tab) => renderTemplate`<button${addAttribute(`tab-button ${activeTab === tab.id ? "active" : ""}`, "class")}${addAttribute(tab.id, "data-tab")} data-astro-cid-s6oy5d3q> ${tab.label} </button>`)} </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/TabBar.astro", void 0);

const $$Astro = createAstro();
const $$VariablesList = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$VariablesList;
  const { variables = [] } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div id="variablesTab" class="tab-content active" data-astro-cid-ov4a2g3u> <div class="section-header" data-astro-cid-ov4a2g3u> <h2 data-astro-cid-ov4a2g3u>Environment Variables</h2> <div class="header-actions" data-astro-cid-ov4a2g3u> <button id="exportExampleBtn" class="btn-secondary" data-astro-cid-ov4a2g3u>Export .env.example</button> <button id="exportEnvBtn" class="btn-warning" data-astro-cid-ov4a2g3u>Export .env</button> <button id="addVariableBtn" class="btn-primary" data-astro-cid-ov4a2g3u>Add Variable</button> </div> </div> <div class="filters" data-astro-cid-ov4a2g3u> <input type="text" id="searchFilter" placeholder="Search variables..." data-astro-cid-ov4a2g3u> <select id="categoryFilter" data-astro-cid-ov4a2g3u> <option value="" data-astro-cid-ov4a2g3u>All Categories</option> <option value="database" data-astro-cid-ov4a2g3u>Database</option> <option value="auth" data-astro-cid-ov4a2g3u>Authentication</option> <option value="api" data-astro-cid-ov4a2g3u>API Keys</option> <option value="debug" data-astro-cid-ov4a2g3u>Debug</option> <option value="other" data-astro-cid-ov4a2g3u>Other</option> </select> </div> <div id="variablesList" class="variables-list" data-astro-cid-ov4a2g3u> <!-- Variables will be rendered dynamically --> </div> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/VariablesList.astro", void 0);

const $$SnapshotsList = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="snapshotsTab" class="tab-content" data-astro-cid-ccj23ybu> <div class="section-header" data-astro-cid-ccj23ybu> <h2 data-astro-cid-ccj23ybu>Environment Snapshots</h2> <button id="createSnapshotBtn" class="btn-primary" data-astro-cid-ccj23ybu>Create Snapshot</button> </div> <div id="snapshotsList" class="snapshots-list" data-astro-cid-ccj23ybu> <!-- Snapshots will be loaded dynamically --> </div> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/SnapshotsList.astro", void 0);

const $$ProjectStatus = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="projectTab" class="tab-content" data-astro-cid-fgkqps4c> <div class="section-header" data-astro-cid-fgkqps4c> <h2 data-astro-cid-fgkqps4c>Project Environment Status</h2> <button id="refreshProjectBtn" class="btn-secondary" data-astro-cid-fgkqps4c>Refresh</button> </div> <div id="projectStatus" class="project-status" data-astro-cid-fgkqps4c> <!-- Project status will be loaded dynamically --> </div> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/ProjectStatus.astro", void 0);

const $$VariableModal = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="variableModal" class="modal" data-astro-cid-trsdrok4> <div class="modal-content" data-astro-cid-trsdrok4> <span class="close" data-astro-cid-trsdrok4>&times;</span> <h2 id="modalTitle" data-astro-cid-trsdrok4>Add Variable</h2> <form id="variableForm" data-astro-cid-trsdrok4> <div class="form-group" data-astro-cid-trsdrok4> <label for="varName" data-astro-cid-trsdrok4>Name:</label> <input type="text" id="varName" name="name" required data-astro-cid-trsdrok4> </div> <div class="form-group" data-astro-cid-trsdrok4> <label for="varValue" data-astro-cid-trsdrok4>Value:</label> <textarea id="varValue" name="value" rows="3" data-astro-cid-trsdrok4></textarea> </div> <div class="form-group" data-astro-cid-trsdrok4> <label for="varCategory" data-astro-cid-trsdrok4>Category:</label> <select id="varCategory" name="category" data-astro-cid-trsdrok4> <option value="database" data-astro-cid-trsdrok4>Database</option> <option value="auth" data-astro-cid-trsdrok4>Authentication</option> <option value="api" data-astro-cid-trsdrok4>API Keys</option> <option value="debug" data-astro-cid-trsdrok4>Debug</option> <option value="other" data-astro-cid-trsdrok4>Other</option> </select> </div> <div class="form-group" data-astro-cid-trsdrok4> <label for="varDescription" data-astro-cid-trsdrok4>Description:</label> <textarea id="varDescription" name="description" rows="2" data-astro-cid-trsdrok4></textarea> </div> <div class="form-group" data-astro-cid-trsdrok4> <label data-astro-cid-trsdrok4> <input type="checkbox" id="varSensitive" name="sensitive" data-astro-cid-trsdrok4>
Sensitive (will be encrypted)
</label> </div> <div class="form-actions" data-astro-cid-trsdrok4> <button type="submit" class="btn-primary" data-astro-cid-trsdrok4>Save</button> <button type="button" class="btn-secondary" id="cancelBtn" data-astro-cid-trsdrok4>Cancel</button> </div> </form> </div> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/modals/VariableModal.astro", void 0);

const $$PasswordModal = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="passwordModal" class="modal" data-astro-cid-4zjwe6if> <div class="modal-content" data-astro-cid-4zjwe6if> <span class="close-password" data-astro-cid-4zjwe6if>&times;</span> <h2 data-astro-cid-4zjwe6if>⚠️ Export .env File</h2> <div class="warning-notice" data-astro-cid-4zjwe6if> <p data-astro-cid-4zjwe6if><strong data-astro-cid-4zjwe6if>Security Warning:</strong> This will export your actual environment variables with real values.</p> <p data-astro-cid-4zjwe6if><strong data-astro-cid-4zjwe6if>Important:</strong> To use the exported .env file, you must disable env-manager in your config by setting <code data-astro-cid-4zjwe6if>ENV_MANAGER_ENABLED=false</code></p> </div> <form id="passwordForm" data-astro-cid-4zjwe6if> <div class="form-group" data-astro-cid-4zjwe6if> <label for="confirmPassword" data-astro-cid-4zjwe6if>Confirm your password:</label> <input type="password" id="confirmPassword" name="password" required data-astro-cid-4zjwe6if> </div> <div class="form-actions" data-astro-cid-4zjwe6if> <button type="submit" class="btn-warning" data-astro-cid-4zjwe6if>Export .env</button> <button type="button" class="btn-secondary" id="cancelPasswordBtn" data-astro-cid-4zjwe6if>Cancel</button> </div> </form> </div> </div> `;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/components/modals/PasswordModal.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Environment Manager</title><link rel="stylesheet" href="/css/styles.css">${renderHead()}</head> <body data-astro-cid-j7pv25f6> <div class="container" data-astro-cid-j7pv25f6> <header data-astro-cid-j7pv25f6> <h1 data-astro-cid-j7pv25f6>🔧 Environment Manager</h1> ${renderComponent($$result, "AuthStatus", $$AuthStatus, { "data-astro-cid-j7pv25f6": true })} </header> ${renderComponent($$result, "LoginForm", $$LoginForm, { "data-astro-cid-j7pv25f6": true })} <div id="mainSection" class="section" style="display: none;" data-astro-cid-j7pv25f6> ${renderComponent($$result, "TabBar", $$TabBar, { "activeTab": "variables", "data-astro-cid-j7pv25f6": true })} ${renderComponent($$result, "VariablesList", $$VariablesList, { "data-astro-cid-j7pv25f6": true })} ${renderComponent($$result, "SnapshotsList", $$SnapshotsList, { "data-astro-cid-j7pv25f6": true })} ${renderComponent($$result, "ProjectStatus", $$ProjectStatus, { "data-astro-cid-j7pv25f6": true })} </div> </div> ${renderComponent($$result, "VariableModal", $$VariableModal, { "data-astro-cid-j7pv25f6": true })} ${renderComponent($$result, "PasswordModal", $$PasswordModal, { "data-astro-cid-j7pv25f6": true })}   </body> </html>`;
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
