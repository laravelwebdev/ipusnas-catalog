// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { BASE_URL, USER_AGENT } from "../_shared/consts.ts";
import { corsHeaders } from "../_shared/cors.ts";

async function returnBook(itemId: string, accessToken: string) {
  const reqUrl = `${BASE_URL}/items/delete_current`;
  console.log(reqUrl);
  return await fetch(reqUrl, {
    method: "POST",
    headers: { "user-agent": USER_AGENT, "content-type": "application/json" },
    body: JSON.stringify({
      language: "en",
      item_id: itemId,
      access_token: accessToken || undefined,
    }),
  }).then((r) => r.json());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  } else if (req.method === "POST") {
    const { itemId, accessToken } = await req.json();
    const data = await returnBook(itemId, accessToken);

    if (data.meta.error_message) {
      return new Response(JSON.stringify(data.meta), {
        status: data.meta.code || 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else {
    return new Response("not allowed", { status: 400 });
  }
});
