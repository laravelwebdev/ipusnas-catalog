// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import * as QueryString from "querystring";
import { CLIENT_ID, BASE_URL, USER_AGENT } from "../_shared/consts.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { BookItem } from "../_shared/interfaces.ts";

async function getBooks(query: QueryString.ParsedQuery) {
  const accessToken = <string>query.access_token;
  const queryParams = new URLSearchParams([["client_id", CLIENT_ID]]);

  const currentPage = query.page || 1;
  const pageSize = query.page_size || 20;
  const category = query.category_id;
  const publisher = query.publisher_id;
  const sort = query.sort_by;

  let base = BASE_URL;
  if (category) {
    base += "/books/sort/category";
    queryParams.append("category_id", category.toString());
  } else if (publisher) {
    base += "/books/sort/publisher";
    queryParams.append("publisher_id", publisher.toString());
  } else if (sort === "oldest") {
    base += "/books/sort/oldest";
  } else if (sort === "newest") {
    base += "/books/sort/newest";
  } else if (sort === "borrowed") {
    base += "/books/borrow_histories";
  } else if (sort === "borrowing") {
    base += "/items/index";
  } else if (sort === "queued") {
    base += "/queues/index";
  } else {
    base += "/books/sort/index";
  }
  queryParams.append("per_page", pageSize.toString());
  queryParams.append("page", currentPage.toString());

  if (accessToken) {
    queryParams.append("access_token", accessToken);
  }

  const reqUrl = `${base}?${queryParams.toString()}`;
  return await fetch(reqUrl, {
    headers: { "user-agent": USER_AGENT },
  })
    .then((r) => r.json())
    .then((d) => d?.data)
    .then((d) => ({
      data: (d?.data as BookItem[]) || [],
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
  const data = await getBooks(query);
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
