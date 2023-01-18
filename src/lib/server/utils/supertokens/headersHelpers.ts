import type { Cookies } from "@sveltejs/kit";

/** A `Map.forEach` helper that sets cookies to the provided `Headers`  */
export function setCookiesFromMap(headers: Headers) {
  return function setCookies(value: string): void {
    headers.append("Set-Cookie", value);
  };
}

/** A `Map.forEach` helper that sets headers for the provided `Headers` */
export function setHeadersFromMap(headers: Headers) {
  return function setHeaders(value: string | string[], name: string): void {
    if (typeof value === "string") headers.set(name, value);
    else value.forEach((v) => headers.append(name, v));
  };
}

type CookieOptions = Omit<NonNullable<Parameters<Cookies["set"]>[2]>, "encode">;
interface CookieData {
  name: string;
  value: string;
  options: CookieOptions;
}

/** Transforms an HTTP Cookie string into an object compatible with `SvelteKit` */
export function extractCookieData(cookie: string): CookieData {
  const [nameValuePair, ...cookieOptionPairs] = cookie.split("; ");
  const [name, value] = nameValuePair.split("; ")[0].split("=");

  const options = cookieOptionPairs.reduce((cookieOptions, keyValuePair) => {
    const [rawKey, value] = keyValuePair.split("=");
    const key = `${rawKey.charAt(0).toLowerCase()}${rawKey.slice(1)}` as keyof CookieOptions;

    if (key === "expires") cookieOptions[key] = new Date(value);
    else if (key === "maxAge") cookieOptions[key] = new Date(value).getTime();
    else if (key === "httpOnly") cookieOptions[key] = true;
    else if (key === "secure") cookieOptions[key] = true;
    else if (key === "sameSite") cookieOptions[key] = value.toLowerCase() as CookieOptions["sameSite"];
    else if (key === "priority") cookieOptions[key] = value.toLowerCase() as CookieOptions["priority"];
    else cookieOptions[key] = value;

    return cookieOptions;
  }, {} as CookieOptions);

  // SuperTokens uses the `cookie` NPM package, which URI-encodes the cookie value. We need to account for that.
  return { name, value: decodeURIComponent(value), options };
}
