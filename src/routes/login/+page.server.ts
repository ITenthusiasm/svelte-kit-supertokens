import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import SuperTokensHelpers from "$lib/server/utils/supertokens";
import { authCookieNames, createCookieSettings } from "$lib/server/utils/supertokens/cookieHelpers";
import { validateEmail, validatePassword } from "$lib/utils/validation";

export const load = (({ locals, url }) => {
  if (locals.user.id) throw redirect(302, "/");

  const loginMode = url.searchParams.get("mode");
  const mode = loginMode === "signup" ? "signup" : "signin";
  return { mode };
}) satisfies PageServerLoad;

type ActionData = { banner?: string | null; email?: string | null; password?: string | null };

export const actions: Actions = {
  async default(event) {
    // Form Data
    const formData = await event.request.formData().then(Object.fromEntries);
    const { email, password, mode } = formData;

    // Validate Data
    const errors: ActionData = {};
    if (!email) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Email is invalid";

    if (!password) errors.password = "Password is required";
    else if (mode === "signup" && !validatePassword(password)) {
      errors.password = "Password must contain at least 8 characters, including a number";
    }

    if (errors.email || errors.password) return fail(400, { errors });

    // Attempt Sign In / Sign Up
    const normalizedMode = mode === "signup" ? "signup" : "signin";
    const { status, tokens } = await SuperTokensHelpers[normalizedMode](email, password);

    // Auth failed
    if (status === "WRONG_CREDENTIALS_ERROR") {
      return fail(401, { errors: { banner: "Incorrect email and password combination" } as ActionData });
    }

    if (status === "EMAIL_ALREADY_EXISTS_ERROR") {
      return fail(400, { errors: { email: "This email already exists. Please sign in instead." } as ActionData });
    }

    const cookieSettings = createCookieSettings();
    const refreshCookieSettings = createCookieSettings("refresh");

    event.cookies.set(authCookieNames.access, tokens.accessToken, cookieSettings);
    event.cookies.set(authCookieNames.refresh, tokens.refreshToken as string, refreshCookieSettings);
    if (tokens.antiCsrfToken) event.cookies.set(authCookieNames.csrf, tokens.antiCsrfToken, cookieSettings);
    throw redirect(302, new URL(event.request.url).searchParams.get("returnUrl") || "/");
  },
};
