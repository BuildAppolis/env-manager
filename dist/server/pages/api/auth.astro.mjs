import { g as getDatabase } from '../../chunks/session_CMQvN_Ad.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const database = getDatabase();
    const { password } = await request.json();
    if (!password) {
      return new Response(JSON.stringify({ error: "Password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isValid = database.authenticate(password);
    if (isValid) {
      return new Response(JSON.stringify({
        success: true,
        message: "Authentication successful"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({
        error: "Invalid password"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return new Response(JSON.stringify({
      error: "Authentication failed"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  try {
    const database = getDatabase();
    const isAuthenticated = database.isAuthenticated();
    return new Response(JSON.stringify({
      authenticated: isAuthenticated
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return new Response(JSON.stringify({
      authenticated: false
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
