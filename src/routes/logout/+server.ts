import type { RequestHandler } from "./$types";
import SuperTokensHelpers from "$lib/server/utils/supertokens";
import { authCookieNames, createHeadersFromTokens } from "$lib/server/utils/supertokens/cookieHelpers";
import { commonRoutes } from "$lib/utils/constants";

export const GET = (async ({ cookies }) => {
  const accessToken = cookies.get(authCookieNames.access) as string;
  const antiCsrfToken = cookies.get(authCookieNames.csrf);
  await SuperTokensHelpers.logout({ accessToken, antiCsrfToken });

  const headers = createHeadersFromTokens({});
  headers.set("Location", commonRoutes.login);
  return new Response(null, { status: 302, statusText: "OK", headers });
}) satisfies RequestHandler;
