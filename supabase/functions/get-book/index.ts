// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import * as QueryString from "querystring";
import { CLIENT_ID, BASE_URL, USER_AGENT } from "../_shared/consts.ts";
import {
  decrypt,
  resolvePassKey,
  resolvePassZip,
  resolvePassPdf,
} from "../_shared/decrpt.ts";
import { corsHeaders } from "../_shared/cors.ts";
import type { BookItem } from "../_shared/interfaces.ts";

async function getBook(query: QueryString.ParsedQuery): Promise<BookItem> {
  const bookId = <string>query.book_id;
  const accessToken = <string>query.access_token;
  const queryParams = new URLSearchParams([
    ["client_id", CLIENT_ID],
    ["book_id", bookId],
  ]);
  if (accessToken) {
    queryParams.append("access_token", accessToken);
  }
  const base = `${BASE_URL}/books/detail`;
  const reqUrl = `${base}?${queryParams.toString()}`;

  return await fetch(reqUrl, {
    headers: { "user-agent": USER_AGENT },
  })
    .then((r) => r.json())
    .then((d) => d?.data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const query = QueryString.parse(new URL(req.url).search);
  const data = await getBook(query);
  if (data?.Book.has_book) {
    const passKey = await resolvePassKey(data.Item);
    const decrypted = await decrypt(passKey, atob(data.Item.pass));
    data.Item.pass_zip = await resolvePassZip(decrypted);
    data.Item.pass_pdf = await resolvePassPdf(decrypted);
  }
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
