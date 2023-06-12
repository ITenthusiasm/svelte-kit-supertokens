import type { RequestHandler } from "./$types";
import SuperTokensHelpers from "$lib/server/utils/supertokens";
import { authCookieNames, createHeadersFromTokens } from "$lib/server/utils/supertokens/cookieHelpers";
import { commonRoutes } from "$lib/utils/constants";

export const GET = (async ({ cookies, url }) => {
  const refreshToken = cookies.get(authCookieNames.refresh) ?? "";
  const antiCsrfToken = cookies.get(authCookieNames.csrf);
  const newTokens = await SuperTokensHelpers.refreshToken({ refreshToken, antiCsrfToken });

  const headers = createHeadersFromTokens(newTokens);
  headers.set("Location", newTokens.accessToken ? url.searchParams.get("returnUrl") || "/" : commonRoutes.login);
  return new Response(null, { status: 307, headers: headers });
}) satisfies RequestHandler;

export const POST = GET;
