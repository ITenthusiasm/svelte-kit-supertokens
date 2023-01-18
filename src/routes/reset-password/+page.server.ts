import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { SuperTokensHelpers } from "$lib/server/utils/supertokens";
import { validateEmail, validatePassword } from "$lib/utils/validation";
import { commonRoutes } from "$lib/utils/constants";

export const load = (({ locals, url }) => {
  if (locals.user.id) throw redirect(302, "/");

  const token = url.searchParams.get("token");
  let mode: "request" | "emailed" | "attempt" | "success";

  if (token) mode = "attempt";
  else if (url.searchParams.has("mode")) mode = url.searchParams.get("mode") as typeof mode;
  else mode = "request";

  return { mode, token };
}) satisfies PageServerLoad;

type ActionData = {
  banner?: string | null;
  email?: string | null;
  password?: string | null;
  "confirm-password"?: string | null;
};

export const actions: Actions = {
  async default(event) {
    if (event.locals.user.id) return redirect(302, "/");

    const formData = await event.request.formData().then(Object.fromEntries);
    const { mode } = formData;

    // Email a "reset password" link to user
    if (mode === "request") {
      // Form Data
      const { email } = formData;
      if (!email) return fail(400, { errors: { email: "Email is required" } as ActionData });
      else if (!validateEmail(email)) return fail(400, { errors: { email: "Email is invalid" } as ActionData });

      // Email a "reset password" link (or fail silently for invalid users/emails)
      await SuperTokensHelpers.sendPasswordResetEmail(email);
      throw redirect(302, `${commonRoutes.resetPassword}?mode=emailed`);
    }

    // Reset user's password
    if (mode === "attempt") {
      // Form Data
      const { password, "confirm-password": confirmPassword, token = "" } = formData;

      // Validate Data
      const errors: ActionData = {};
      if (!password) errors.password = "Password is required";
      else if (!validatePassword(password)) {
        errors.password = "Password must contain at least 8 characters, including a number";
      }

      if (!confirmPassword) errors["confirm-password"] = "Confirmation Password is required";
      else if (password !== confirmPassword) errors["confirm-password"] = "Confirmation password doesn't match";

      if (errors.password || errors["confirm-password"]) return fail(400, { errors });

      // Validate Token
      if (!token) return fail(401, { errors: { banner: "Invalid password reset link" } as ActionData });

      const status = await SuperTokensHelpers.resetPassword(token, password);
      if (status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        return fail(401, { errors: { banner: "Invalid password reset link" } as ActionData });
      }

      // Password reset succeeded
      throw redirect(302, `${commonRoutes.resetPassword}?mode=success`);
    }

    // Fallthrough
    return fail(400, { errors: { banner: "Invalid Request" } as ActionData });
  },
};
