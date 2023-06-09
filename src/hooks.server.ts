import type { Handle } from "@sveltejs/kit";
import SuperTokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import SuperTokensError from "supertokens-node/lib/build/error";
import { env } from "$env/dynamic/private";
import { authCookieNames, createHeadersFromTokens } from "$lib/server/utils/supertokens/cookieHelpers";
import { commonRoutes } from "$lib/utils/constants";

/* -------------------- Super Tokens -------------------- */
SuperTokens.init({
  supertokens: {
    connectionURI: env.SUPERTOKENS_CONNECTION_URI as string,
    apiKey: env.SUPERTOKENS_API_KEY as string,
  },
  appInfo: {
    appName: "Testing Svelte Kit with Custom Backend",
    websiteDomain: env.SUPERTOKENS_WEBSITE_DOMAIN as string,
    apiDomain: env.SUPERTOKENS_API_DOMAIN as string,
    apiBasePath: env.SUPERTOKENS_API_BASE_PATH as string,
  },
  recipeList: [
    EmailPassword.init(), // Initializes signin / signup features
    Session.init(), // Initializes session features
  ],
});

/* -------------------- Svelte Kit -------------------- */
// TODO: Use `commonRoutes` instead of raw strings for safety (where possible).
const publicPages = ["/", "/login", "/reset-password", "/auth/session/refresh", "/api/email-exists"] as const;

export const handle = (async ({ event, resolve }) => {
  try {
    const accessToken = event.cookies.get(authCookieNames.access) ?? "";
    const antiCsrfToken = event.cookies.get(authCookieNames.csrf);
    const session = await Session.getSessionWithoutRequestResponse(accessToken, antiCsrfToken);
    const userId = session.getUserId();

    event.locals.user = { id: userId };
    return resolve(event);
  } catch (error) {
    if (!SuperTokensError.isErrorFromSuperTokens(error)) {
      return new Response("An unexpected error occurred", { status: 500 });
    }

    if (publicPages.includes(event.url.pathname as (typeof publicPages)[number])) {
      event.locals.user = {};
      return resolve(event);
    }

    const { url } = event;
    const basePath = error.type === Session.Error.TRY_REFRESH_TOKEN ? commonRoutes.refreshSession : commonRoutes.login;
    const returnUrl = encodeURI(`${url.pathname}${url.search}`);
    const redirectUrl = `${basePath}?returnUrl=${returnUrl}`;

    // Redirect the user to the proper auth page. Delete their tokens if they don't need to attempt a token refresh.
    const headers = Session.Error.TRY_REFRESH_TOKEN ? new Headers() : createHeadersFromTokens({});
    headers.append("Location", redirectUrl);
    return new Response(null, { status: 302, headers });
  }
}) satisfies Handle;
