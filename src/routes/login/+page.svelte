<main>
  <form method="POST" use:enhance={submitFunction} use:autoObserve>
    <h1>{`Sign ${data.mode === "signin" ? "In" : "Up"}`}</h1>

    <h2>
      {#if data.mode === "signin"}
        Not registered yet? <a href={`${commonRoutes.login}?mode=signup`}>Sign Up</a>
      {:else}
        Already have an account? <a href={commonRoutes.login}>Sign In</a>
      {/if}
    </h2>

    <hr />
    {#if errors.banner}<div role="alert">{errors.banner}</div>{/if}

    <label for="email">Email</label>
    <input
      id="email"
      name="email"
      placeholder="Email Address"
      aria-invalid={!!errors.email}
      aria-describedby="email-error"
      {...configure("email", {
        required,
        type: { value: "email", message: "Email is invalid" },
        async validate({ value }) {
          // Check email's existence during `signup`s
          if (data.mode !== "signup") return;

          const response = await fetch(`/api/email-exists?email=${value}`);
          const emailExists = await response.json().then(/** @param {boolean} body */ (body) => body);
          if (emailExists) return "This email already exists. Please sign in instead.";
        },
      })}
    />
    <div id="email-error" role="alert">{errors.email ?? ""}</div>

    <label for="password">Password</label>
    <input
      id="password"
      name="password"
      placeholder="Password"
      type="password"
      aria-invalid={!!errors.password}
      aria-describedby="password-error"
      {...configure("password", {
        required,
        pattern:
          data.mode === "signin"
            ? undefined
            : {
                value: "(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}",
                message: "Password must contain at least 8 characters, including a number",
              },
      })}
    />
    <div id="password-error" role="alert">{errors.password ?? ""}</div>

    <input name="mode" type="hidden" value={data.mode} />
    <button type="submit">{`Sign ${data.mode === "signin" ? "In" : "Up"}`}</button>

    {#if data.mode === "signin"}
      <a class="forgot-password" href={commonRoutes.resetPassword}>Forgot password?</a>
    {/if}
  </form>
</main>

<script>
  import { enhance } from "$app/forms";
  import { createFormValidityObserver } from "@form-observer/svelte";
  import { commonRoutes } from "$lib/utils/constants";
  import "$lib/stylesheets/auth-form.scss";

  /** @type {import("./$types.d.ts").PageData} */ export let data;
  /** @type {import("./$types.d.ts").ActionData} */ export let form;
  /** @type {NonNullable<typeof form>["errors"]} */ let errors;
  $: errors = form?.errors ?? {};

  // Manage form errors.
  /** @param {HTMLInputElement} field */
  const required = (field) => `${field.labels?.[0].textContent} is required`;

  const { autoObserve, configure, validateFields } = createFormValidityObserver("focusout", {
    renderByDefault: true,
    renderer(errorContainer, errorMessage) {
      const fieldName = /** @type {keyof typeof errors} */ (errorContainer.id.replace(/-error$/, ""));
      errors[fieldName] = errorMessage;
    },
  });

  /** @type {import("./$types.d.ts").SubmitFunction} */
  const submitFunction = async ({ cancel }) => ((await validateFields()) ? undefined : cancel());
</script>

<style lang="scss">
  main > form > a.forgot-password {
    display: block;
    width: fit-content;
    margin: 10px auto 0;
    color: #656565;
  }
</style>
