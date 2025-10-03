// File: functions/login/index.ts
import { CLIENT_ID, CLIENT_SECRET, BASE_URL, USER_AGENT } from "../_shared/consts.ts";
import { corsHeaders } from "../_shared/cors.ts";
/**
 * Fungsi untuk melakukan POST login ke API.
 * Mengembalikan JSON jika valid, atau throw error jika response bukan JSON.
 */ async function postLogin(username, password) {
  const reqUrl = `${BASE_URL}/auth/login`;
  console.log("DEBUG: reqUrl =", reqUrl);
  console.log("DEBUG: CLIENT_ID =", CLIENT_ID);
  const res = await fetch(reqUrl, {
    method: "POST",
    headers: {
      "user-agent": USER_AGENT,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      email: username,
      password: password,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });
  const text = await res.text();
  try {
    return JSON.parse(text); // parse JSON jika valid
  } catch  {
    console.error("Non-JSON response from server:", text);
    throw new Error(`Server returned non-JSON response, status=${res.status}`);
  }
}
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  let body;
  try {
    body = await req.json();
  } catch  {
    return new Response(JSON.stringify({
      error: "Invalid JSON body"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  const { username, password } = body;
  if (!username || !password) {
    return new Response(JSON.stringify({
      error: "Missing username or password"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const data = await postLogin(username, password);
    if (data.meta?.error_message) {
      return new Response(JSON.stringify(data.meta), {
        status: data.meta.code || 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify(data.data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
