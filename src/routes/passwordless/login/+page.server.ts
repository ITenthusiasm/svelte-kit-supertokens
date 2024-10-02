import { fail, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import SuperTokensHelpers from "$lib/server/utils/supertokens";
import type { PasswordlessFlow } from "$lib/server/utils/supertokens";
import {
  authCookieNames,
  deviceCookieNames,
  createCookieSettings,
  deleteCookieSettings,
} from "$lib/server/utils/supertokens/cookieHelpers";
import { validateEmail, validatePhone } from "$lib/utils/validation";

export const load = (async (event) => {
  if (event.locals.user?.id) throw redirect(303, "/");

  const { searchParams } = event.url;
  const token = searchParams.get("token");
  let mode: "request" | "code-signin" | "link-signin" | "messaged";

  if (token) mode = "link-signin";
  else if (searchParams.has("mode")) mode = searchParams.get("mode") as typeof mode;
  else mode = "request";

  if (token) await attemptSigninWith(event, token, true); // Note: Should redirect unless sign-in fails

  const contact: "email" | "phoneNumber" = searchParams.get("contact") === "phoneNumber" ? "phoneNumber" : "email";
  return { mode, contact };
}) satisfies PageServerLoad;

type FormErrors = { [key in "banner" | "email" | "phoneNumber" | "code"]?: string | null };
export const actions: Actions = {
  async default(event) {
    if (event.locals.user?.id) throw redirect(303, "/");

    // Form Data
    const formData = Object.fromEntries(await event.request.formData()) as Record<string, string | null>;
    const { mode } = formData;

    if (mode === "request") {
      // Note: Type casting is just for convenience. We expect EITHER `email` OR `phoneNumber` to be provided. Not both.
      const { email, phoneNumber } = formData as Record<string, string>;

      // Only troublesome users will get here.
      if (email == null && phoneNumber == null) {
        return fail<FormErrors>(400, { banner: "Please provide an email or a phone number" });
      }

      // Only troublesome users will get here too.
      if (email != null && phoneNumber != null) {
        return fail<FormErrors>(400, { banner: "You may provide an email or a phone number, but not both" });
      }

      if (email != null) {
        if (!email) return fail<FormErrors>(400, { email: "Email is required" });
        if (!validateEmail(email)) return fail<FormErrors>(400, { email: "Email is invalid" });
      }

      if (phoneNumber != null) {
        if (!phoneNumber) return fail<FormErrors>(400, { phoneNumber: "Phone Number is required" });
        if (!validatePhone(phoneNumber)) return fail<FormErrors>(400, { phoneNumber: "Phone Number is invalid" });
      }

      // Send a code/link
      const flow: PasswordlessFlow = "both" as PasswordlessFlow; // Note: You can change this depending on your needs.
      const code = await SuperTokensHelpers.sendPasswordlessInvite({ email, phoneNumber, flow });

      // Redirect to relevant page (with Device Details), preserving `returnUrl` if it previously existed
      const cookieSettings = createCookieSettings();
      event.cookies.set(deviceCookieNames.deviceId, code.deviceId, cookieSettings);
      event.cookies.set(deviceCookieNames.preAuthSessionId, code.preAuthSessionId, cookieSettings);

      const url = new URL(event.request.url);
      url.searchParams.set("mode", flow === "link" ? "messaged" : "code-signin");
      if (flow === "link") url.searchParams.delete("returnUrl"); // `returnUrl` is no longer relevant in this case

      throw redirect(303, `${url.pathname}${url.search}`);
    }

    if (mode === "code-signin") {
      const { code } = formData;
      return code ? attemptSigninWith(event, code) : fail<FormErrors>(400, { code: "Code is required" });
    }

    // Fallthrough
    return fail<FormErrors>(400, { banner: "Invalid Request" });
  },
};

// TODO: SuperTokens seems to `THROW` an error when there's a bad `preAuthSessionId`. What should we do about that?
async function attemptSigninWith(event: Pick<RequestEvent, "url" | "cookies">, code: string, link?: boolean) {
  // Get Credentials
  const deviceId = event.cookies.get(deviceCookieNames.deviceId) as string;
  const preAuthSessionId = event.cookies.get(deviceCookieNames.preAuthSessionId) as string;

  // Validate Code
  const credentials = link ? { linkCode: code, preAuthSessionId } : { userInputCode: code, deviceId, preAuthSessionId };
  const { status, tokens } = await SuperTokensHelpers.passwordlessSignin(credentials);

  // Auth Failed
  if (status === "RESTART_FLOW_ERROR") return fail<FormErrors>(401, { banner: "Please request a new code" });
  if (status === "EXPIRED_USER_INPUT_CODE_ERROR") return fail<FormErrors>(401, { code: "This code has expired" });
  if (status === "LINKING_TO_SESSION_USER_FAILED") return fail<FormErrors>(400, { banner: "Account linking failed" });
  if (status !== "OK") return fail<FormErrors>(401, { code: "Code is invalid " });

  // Auth succeeded. Set auth tokens and clear device data.
  const cookieSettings = createCookieSettings();
  event.cookies.set(authCookieNames.access, tokens.accessToken, cookieSettings);
  if (tokens.antiCsrfToken) event.cookies.set(authCookieNames.csrf, tokens.antiCsrfToken, cookieSettings);

  const refreshCookieSettings = createCookieSettings("refresh");
  event.cookies.set(authCookieNames.refresh, tokens.refreshToken as string, refreshCookieSettings);

  event.cookies.delete(deviceCookieNames.deviceId, deleteCookieSettings);
  event.cookies.delete(deviceCookieNames.preAuthSessionId, deleteCookieSettings);
  throw redirect(303, event.url.searchParams.get("returnUrl") || "/");
}
