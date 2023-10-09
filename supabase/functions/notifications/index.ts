// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import * as QueryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import { CLIENT_ID, BASE_URL, USER_AGENT } from "../_shared/consts.ts";
import { corsHeaders } from "../_shared/cors.ts";

async function getNotifications(query: QueryString.ParsedQuery) {
  const queryParams = new URLSearchParams([["client_id", CLIENT_ID]]);
  const currentPage = query.page || 1;
  const pageSize = query.page_size || 20;
  const accessToken = <string>query.access_token;
  queryParams.append("per_page", pageSize.toString());
  queryParams.append("page", currentPage.toString());
  if (accessToken) {
    queryParams.append("access_token", accessToken);
  }

  const reqUrl = `${BASE_URL}/notifications?${queryParams.toString()}`;
  return await fetch(reqUrl, {
    headers: { "user-agent": USER_AGENT },
  })
    .then((r) => r.json())
    .then((d) => d?.data)
    .then((d) => ({
      data: d?.data?.map((i: any) => i?.Notification) || [],
      meta: {
        page: d?.current_page,
        pageSize: d?.limit,
        pages: d?.num_pages,
        total: d?.total_result,
        reqUrl,
      },
    }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const query = QueryString.parse(new URL(req.url).search);
  const data = await getNotifications(query);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
