// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { BASE_URL, USER_AGENT } from "../_shared/consts.ts";
import { corsHeaders } from "../_shared/cors.ts";

async function borrowBook(
  bookId: string,
  libraryId: string,
  accessToken: string,
  confirm = 0
) {
  const reqUrl = `${BASE_URL}/books/borrow_book`;
  console.log(reqUrl);
  return await fetch(reqUrl, {
    method: "POST",
    headers: { "user-agent": USER_AGENT, "content-type": "application/json" },
    body: JSON.stringify({
      confirm,
      language: "en",
      book_id: bookId,
      library_id: libraryId,
      access_token: accessToken || undefined,
    }),
  }).then((r) => r.json());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  } else if (req.method === "POST") {
    const { bookId, libraryId, accessToken } = await req.json();
    const request = await borrowBook(bookId, libraryId, accessToken);

    if (request.meta.error_code !== "request_confirm") {
      return new Response(JSON.stringify(request.meta), {
        status: request.meta.code || 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await borrowBook(bookId, libraryId, accessToken, 1);

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
