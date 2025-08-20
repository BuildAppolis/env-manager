import { g as getDatabase } from '../../../chunks/session_Czm17L6L.mjs';
import { D as DraftManager } from '../../../chunks/draft-manager_Dh2gUtEF.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { projectPath, versionId } = await request.json();
    const database = getDatabase(projectPath || void 0);
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const draftManager = new DraftManager(database);
    await draftManager.restoreFromVersion(versionId);
    return new Response(JSON.stringify({
      success: true,
      message: "Version restore initiated. Check your draft for changes."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Version restore failed:", error);
    return new Response(JSON.stringify({
      error: "Restore failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
