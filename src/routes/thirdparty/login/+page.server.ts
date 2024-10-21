import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import SuperTokensHelpers from "$lib/server/utils/supertokens";
import {
  authCookieNames,
  createCookieSettings,
  deleteCookieSettings,
} from "$lib/server/utils/supertokens/cookieHelpers";

const pkceCookieName = "sPKCE";
type Errors = Partial<{ banner: string }>;

export const load = (async (event) => {
  if (event.locals.user?.id) throw redirect(303, "/");
  const { searchParams } = event.url;

  // User is visiting Login Page
  if (!searchParams.has("provider")) return { banner: null };

  // User is being redirected from Provider's Login Page
  const pkceCodeVerifier = event.cookies.get(pkceCookieName);
  const { status, tokens } = await SuperTokensHelpers.thirdPartySignin(searchParams, pkceCodeVerifier);

  // Auth Failed
  if (status === "UNRECOGNIZED_PROVIDER") return { banner: "Provider was not recognized" };
  if (status === "NO_EMAIL_FOUND_FOR_USER") return { banner: "Account lacks a valid email" };
  if (status === "EMAIL_NOT_VERIFIED") return { banner: "Email not verified with provider" };
  if (status === "SIGN_IN_UP_NOT_ALLOWED") return { banner: "Account was rejected" };
  if (status === "EMAIL_CHANGE_NOT_ALLOWED_ERROR") return { banner: "Unsupported email change detected" };

  // Either our implementation is incorrect, or an error status was not handled properly.
  if (status !== "OK") return { banner: "Authorization failed" };

  // Auth succeeded. Set auth tokens and clear PKCE data.
  const cookieSettings = createCookieSettings();
  const refreshCookieSettings = createCookieSettings("refresh");

  event.cookies.set(authCookieNames.access, tokens.accessToken, cookieSettings);
  event.cookies.set(authCookieNames.refresh, tokens.refreshToken as string, refreshCookieSettings);
  if (tokens.antiCsrfToken) event.cookies.set(authCookieNames.csrf, tokens.antiCsrfToken, cookieSettings);

  event.cookies.delete(pkceCookieName, deleteCookieSettings);
  throw redirect(303, searchParams.get("returnUrl") || "/");
}) satisfies PageServerLoad;

export const actions: Actions = {
  async default(event) {
    if (event.locals.user?.id) throw redirect(303, "/");

    const returnUrl = event.url.searchParams.get("returnUrl");
    const provider = (await event.request.formData()).get("provider");
    const normalizedProvider = typeof provider === "string" ? provider : "";
    const redirectDetails = await SuperTokensHelpers.getThirdPartyRedirectDetails(normalizedProvider, returnUrl);

    // Provider was not recognized. (This should only happen if there is a bug in our code or the user is malicious.)
    if (redirectDetails === null) return fail<Errors>(500, { banner: "Could not authorize with provider" });

    // Redirect user to Provider's Login Page
    const { redirectUrl, pkceCodeVerifier } = redirectDetails;
    if (pkceCodeVerifier) event.cookies.set(pkceCookieName, pkceCodeVerifier, createCookieSettings("pkce"));
    throw redirect(303, redirectUrl);
  },
};
