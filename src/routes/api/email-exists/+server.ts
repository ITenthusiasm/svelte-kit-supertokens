import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import SuperTokensHelpers from "$lib/server/utils/supertokens";

export const GET = (async ({ request }) => {
  const email = new URL(request.url).searchParams.get("email") ?? "";
  const emailExists = await SuperTokensHelpers.emailExists(email);
  return json(emailExists);
}) satisfies RequestHandler;
