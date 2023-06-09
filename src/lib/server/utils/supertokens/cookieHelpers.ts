import type { SessionContainerInterface } from "supertokens-node/lib/build/recipe/session/types";
import type { CookieSerializeOptions } from "cookie"; // `cookie` is an internal dependency of `SvelteKit`
import { serialize } from "cookie";
import { env } from "$env/dynamic/private";
import { commonRoutes } from "$lib/utils/constants";

type CookieSettings = Omit<CookieSerializeOptions, "encode">;

export type Tokens = Pick<
  ReturnType<SessionContainerInterface["getAllSessionTokensDangerously"]>,
  "accessToken" | "refreshToken" | "antiCsrfToken"
>;

/** The `name`s of the `SuperTokens` cookies used throughout the application */
export const authCookieNames = Object.freeze({ access: "sAccessToken", refresh: "sRefreshToken", csrf: "sAntiCsrf" });
const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;

const commonCookieSettings = Object.freeze({
  httpOnly: true,
  secure: env.SUPERTOKENS_WEBSITE_DOMAIN.startsWith("https"),
  sameSite: "strict",
  priority: "high",
} as const satisfies CookieSettings);

/**
 * Generates the [settings](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes)
 * for a _new_ `SuperTokens` HTTP Cookie
 *
 * @param type The type of cookie for which the settings are being generated
 */
export function createCookieSettings(type?: keyof typeof authCookieNames): CookieSettings {
  const nextYear = new Date(new Date().getTime() + oneYearInMilliseconds);

  /*
   * Note: SuperTokens is responsible for enforcing the expiration dates, not the browser. Just make sure
   * that the cookie lives long enough in the browser for SuperTokens to be able to receive it and validate it.
   */
  return { expires: nextYear, path: type === "refresh" ? commonRoutes.refreshSession : "/", ...commonCookieSettings };
}

const deleteCookieSettings = Object.freeze({ expires: new Date(0), path: "/" } as const satisfies CookieSettings);
const deleteRefreshSettings = Object.freeze({ ...deleteCookieSettings, path: commonRoutes.refreshSession });

/**
 * Generates the HTTP Headers needed to store the `SuperTokens` auth tokens in the user's browser as cookies.
 * An empty token in `tokens` indicates that its corresponding cookie should be removed from the browser.
 * For example, if `tokens` is an empty object, then _all_ SuperTokens cookies will be deleted from the browser.
 */
export function createHeadersFromTokens(tokens: Partial<Tokens>): Headers {
  const headers = new Headers();
  const headerName = "Set-Cookie";
  const { accessToken, refreshToken, antiCsrfToken } = tokens;

  if (!accessToken) headers.append(headerName, serialize(authCookieNames.access, "", deleteCookieSettings));
  else headers.append(headerName, serialize(authCookieNames.access, accessToken, createCookieSettings()));

  if (!refreshToken) headers.append(headerName, serialize(authCookieNames.refresh, "", deleteRefreshSettings));
  else headers.append(headerName, serialize(authCookieNames.refresh, refreshToken, createCookieSettings("refresh")));

  if (!antiCsrfToken) headers.append(headerName, serialize(authCookieNames.csrf, "", deleteCookieSettings));
  else headers.append(headerName, serialize(authCookieNames.csrf, antiCsrfToken, createCookieSettings()));

  return headers;
}
