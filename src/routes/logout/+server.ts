import type { RequestHandler } from "./$types";
import { SuperTokensHelpers, setCookiesFromMap, setHeadersFromMap } from "$lib/server/utils/supertokens";
import { commonRoutes } from "$lib/utils/constants";

export const GET = (async ({ request }) => {
  const { cookies, responseHeaders } = await SuperTokensHelpers.logout(
    request.headers,
    request.method.toLowerCase() as "get"
  );

  const headers = new Headers({ Location: commonRoutes.login });
  cookies.forEach(setCookiesFromMap(headers));
  responseHeaders.forEach(setHeadersFromMap(headers));
  return new Response(null, { status: 302, statusText: "OK", headers });
}) satisfies RequestHandler;
