/** Commonly referenced routes throughout the app */
export const commonRoutes = {
  login: "/login",
  resetPassword: "/reset-password",
  refreshSession: "/auth/session/refresh",
  emailExists: "/api/email-exists",
  loginPasswordless: "/passwordless/login",
  loginThirdParty: "/thirdparty/login",
} as const;

/** Page routes related to authentication. */
export const authPages: string[] = [
  commonRoutes.login,
  commonRoutes.resetPassword,
  commonRoutes.refreshSession,
  commonRoutes.emailExists,
  commonRoutes.loginPasswordless,
  commonRoutes.loginThirdParty,
];
