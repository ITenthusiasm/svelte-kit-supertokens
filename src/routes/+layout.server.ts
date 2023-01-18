import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
  return { user: locals.user, pathname: url.pathname };
}) satisfies LayoutServerLoad;
