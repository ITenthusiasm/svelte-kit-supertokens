import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import SuperTokens from "supertokens-node";
import type { HTTPMethod } from "supertokens-node/lib/build/types";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { SuperTokensData } from "$lib/server/utils/supertokens";

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
const publicPages = ["/", "/login", "/reset-password", "/auth/session/refresh", "/api/email-exists"] as const;

export const handle = (async ({ event, resolve }) => {
  try {
    const { headers, method } = event.request;
    const input = new SuperTokensData.Input({ headers: new Map(headers), method: method.toLowerCase() as HTTPMethod });
    const output = new SuperTokensData.Output();

    const session = await Session.getSession(input, output);
    const userId = session.getUserId();

    event.locals.user = { id: userId };
    return resolve(event);
  } catch (error) {
    if (publicPages.includes(event.url.pathname as typeof publicPages[number])) {
      event.locals.user = {};
      return resolve(event);
    }

    const { type: errorType } = error as { type: "TRY_REFRESH_TOKEN" | "UNAUTHORISED" };
    const { url } = event;

    const basePath = errorType === "UNAUTHORISED" ? "/login" : "/auth/session/refresh";
    const returnUrl = encodeURI(`${url.pathname}${url.search}`);
    const redirectUrl = `${basePath}?returnUrl=${returnUrl}`;

    return new Response(null, { status: 302, headers: { Location: redirectUrl } });
  }
}) satisfies Handle;
