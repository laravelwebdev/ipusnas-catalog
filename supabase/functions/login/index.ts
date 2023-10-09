// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import {
  CLIENT_ID,
  CLIENT_SECRET,
  BASE_URL,
  USER_AGENT,
} from "../_shared/consts.ts";
import { corsHeaders } from "../_shared/cors.ts";

async function postLogin(username: string, password: string) {
  const reqUrl = `${BASE_URL}/login`;
  return await fetch(reqUrl, {
    method: "POST",
    headers: { "user-agent": USER_AGENT, "content-type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  }).then((r) => r.json());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { username, password } = await req.json();
  const data = await postLogin(username, password);

  if (data.meta.error_message) {
    return new Response(JSON.stringify(data.meta), {
      status: data.meta.code || 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data.data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
