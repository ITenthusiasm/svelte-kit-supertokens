{#if data.mode === "success"}
  <main>
    <div class="auth-card">
      <h1>Success!</h1>
      <p>Your password has been updated successfully</p>
      <a class="btn" href={commonRoutes.login}>SIGN IN</a>
    </div>
  </main>
{:else if data.mode === "attempt"}
  <main>
    <form method="post" use:enhance use:autoObserve on:submit={handleSubmit}>
      <h1>Change your password</h1>
      <h2>Enter a new password below to change your password</h2>
      {#if errors.banner}<div role="alert">{errors.banner}</div>{/if}

      <label for="password">New password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="New password"
        aria-invalid={!!errors.password}
        aria-describedby="password-error"
        {...configure("password", {
          required,
          pattern: {
            value: "(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}",
            message: "Password must contain at least 8 characters, including a number",
          },
          // Validate `confirm-password` if `password` is valid
          validate(input) {
            const confirmPasswd = /** @type {HTMLInputElement} */ (input.form?.elements.namedItem("confirm-password"));
            if (confirmPasswd?.value) validateField(confirmPasswd.name);
          },
        })}
      />
      <div id="password-error" role="alert">{errors.password ?? ""}</div>

      <label for="confirm-password">Confirm password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        type="password"
        placeholder="Confirm your password"
        aria-invalid={!!errors["confirm-password"]}
        aria-describedby="confirm-password-error"
        {...configure("confirm-password", {
          required,
          validate(input) {
            const password = /** @type {HTMLInputElement} */ (input.form?.elements.namedItem("password"));
            if (input.value !== password?.value) return "Confirmation Password doesn't match";
          },
        })}
      />
      <div id="confirm-password-error" role="alert">{errors["confirm-password"] ?? ""}</div>

      <input name="mode" type="hidden" value={data.mode} />
      {#if !!data.token}<input name="token" type="hidden" value={data.token} />{/if}
      <button type="submit">CHANGE PASSWORD</button>
    </form>
  </main>
{:else if data.mode === "emailed"}
  <main>
    <div class="auth-card">
      Please check your email for the password recovery link. <a href={commonRoutes.resetPassword}>Resend</a>
    </div>
  </main>
{:else}
  <main>
    <form method="post" use:enhance use:autoObserve on:submit={handleSubmit}>
      <h1>Reset your password</h1>
      <h2>We will send you an email to reset your password</h2>
      {#if errors.banner}<div role="alert">{errors.banner}</div>{/if}

      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        aria-invalid={!!errors.email}
        aria-describedby="email-error"
        {...configure("email", { required, type: { value: "email", message: "Email is invalid" } })}
      />
      <div id="email-error" role="alert">{errors.email ?? ""}</div>

      <input name="mode" type="hidden" value={data.mode} />
      <button type="submit">Email me</button>
    </form>
  </main>
{/if}

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
  const { autoObserve, configure, validateField, validateFields } = createFormValidityObserver("focusout", {
    renderByDefault: true,
    renderer(errorContainer, errorMessage) {
      const fieldName = /** @type {keyof typeof errors} */ (errorContainer.id.replace(/-error$/, ""));
      errors[fieldName] = errorMessage;
    },
  });

  /** @param {HTMLInputElement} field */
  const required = (field) => `${field.labels?.[0].textContent} is required`;

  /** @param {SubmitEvent} event */
  const handleSubmit = (event) => (validateFields() ? undefined : event.preventDefault());
</script>
