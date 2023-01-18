import type { RequestHandler } from "./$types";
import { SuperTokensHelpers, setCookiesFromMap, setHeadersFromMap } from "$lib/server/utils/supertokens";
import { commonRoutes } from "$lib/utils/constants";

// TODO: Do we need to handle error cases?
export const GET = (async ({ request }) => {
  try {
    const { cookies, responseHeaders } = await SuperTokensHelpers.refreshToken(request.headers);

    const headers = new Headers({ Location: new URL(request.url).searchParams.get("returnUrl") || "/" });
    cookies.forEach(setCookiesFromMap(headers));
    responseHeaders.forEach(setHeadersFromMap(headers));
    return new Response(null, { status: 302, statusText: "OK", headers });
  } catch (error) {
    // TODO: Are there better ways to handle error cases?
    return new Response(null, { status: 302, statusText: "OK", headers: { Location: commonRoutes.login } });
  }
}) satisfies RequestHandler;
