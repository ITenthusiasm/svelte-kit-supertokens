import type { Handle } from "@sveltejs/kit";
import SuperTokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Passwordless from "supertokens-node/recipe/passwordless";
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
    // Initializes passwordless features
    Passwordless.init({ contactMethod: "EMAIL_OR_PHONE", flowType: "USER_INPUT_CODE_AND_MAGIC_LINK" }),

    EmailPassword.init(), // Initializes signin / signup features
    Session.init(), // Initializes session features
  ],
});

/* -------------------- Svelte Kit -------------------- */
const publicPages = [
  "/",
  commonRoutes.login,
  commonRoutes.resetPassword,
  commonRoutes.emailExists,
  commonRoutes.loginPasswordless,
] as const;

export const handle = (async ({ event, resolve }) => {
  try {
    const accessToken = event.cookies.get(authCookieNames.access) ?? "";
    const antiCsrfToken = event.cookies.get(authCookieNames.csrf);
    const session = await Session.getSessionWithoutRequestResponse(accessToken, antiCsrfToken);
    const userId = session.getUserId();

    event.locals.user = { id: userId };
    return resolve(event);
  } catch (error) {
    if (!Session.Error.isErrorFromSuperTokens(error)) {
      return new Response("An unexpected error occurred", { status: 500 });
    }

    const userNeedsSessionRefresh = error.type === Session.Error.TRY_REFRESH_TOKEN;

    const requestAllowed =
      publicPages.includes(event.url.pathname as (typeof publicPages)[number]) ||
      (userNeedsSessionRefresh && event.url.pathname === commonRoutes.refreshSession);

    if (requestAllowed) {
      event.locals.user = {};
      return resolve(event);
    }

    const { url } = event;
    const basePath = userNeedsSessionRefresh ? commonRoutes.refreshSession : commonRoutes.login;
    const returnUrl = encodeURI(`${url.pathname}${url.search}`);
    const redirectUrl = `${basePath}?returnUrl=${returnUrl}`;

    // Redirect the user to the proper auth page. Delete their tokens if they don't need to attempt a token refresh.
    const headers = userNeedsSessionRefresh ? new Headers() : createHeadersFromTokens({});
    headers.set("Location", redirectUrl);
    return new Response(null, { status: userNeedsSessionRefresh ? 307 : 303, headers });
  }
}) satisfies Handle;
