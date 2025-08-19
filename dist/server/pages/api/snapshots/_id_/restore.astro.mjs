import { g as getDatabase } from '../../../../chunks/session_AwEyVFTC.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ params }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Snapshot ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = database.restoreSnapshot(id);
    return new Response(JSON.stringify({ success: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Restore snapshot error:", error);
    return new Response(JSON.stringify({ error: "Failed to restore snapshot" }), {
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
