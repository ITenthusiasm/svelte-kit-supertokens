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
    <form method="post" bind:this={formElement} use:enhance use:autoObserve on:submit={handleSubmit}>
      <h1>Change your password</h1>
      <h2>Enter a new password below to change your password</h2>
      {#if form?.errors?.banner}<div role="alert">{form?.errors.banner}</div>{/if}

      <label for="password">New password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="New password"
        aria-invalid={!!form?.errors?.password}
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
      <div id="password-error" role="alert">{form?.errors?.password ?? ""}</div>

      <label for="confirm-password">Confirm password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        type="password"
        placeholder="Confirm your password"
        aria-invalid={!!form?.errors?.["confirm-password"]}
        aria-describedby="confirm-password-error"
        {...configure("confirm-password", {
          required,
          validate(input) {
            const password = /** @type {HTMLInputElement} */ (input.form?.elements.namedItem("password"));
            if (input.value !== password?.value) return "Confirmation Password doesn't match";
          },
        })}
      />
      <div id="confirm-password-error" role="alert">{form?.errors?.["confirm-password"] ?? ""}</div>

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
    <form method="post" bind:this={formElement} use:enhance use:autoObserve on:submit={handleSubmit}>
      <h1>Reset your password</h1>
      <h2>We will send you an email to reset your password</h2>
      {#if form?.errors?.banner}<div role="alert">{form?.errors.banner}</div>{/if}

      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        aria-invalid={!!form?.errors?.email}
        aria-describedby="email-error"
        {...configure("email", { required, type: { value: "email", message: "Email is invalid" } })}
      />
      <div id="email-error" role="alert">{form?.errors.email ?? ""}</div>

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
  /** @type {HTMLFormElement} */ let formElement;

  // Manage form errors.
  const { autoObserve, configure, setFieldError, clearFieldError, validateField, validateFields } =
    createFormValidityObserver("focusout");

  /** @param {HTMLInputElement} field */
  const required = (field) => `${field.labels?.[0].textContent} is required`;

  /** @param {SubmitEvent} event */
  const handleSubmit = (event) => (validateFields() ? undefined : event.preventDefault());

  $: if (formElement) {
    Array.prototype.forEach.call(
      formElement.elements,
      /** @param {HTMLInputElement} field */ (field) => {
        const message = form?.errors?.[/** @type {keyof typeof form.errors} */ (field.name)];
        return message == null ? clearFieldError(field.name) : setFieldError(field.name, message);
      },
    );
  }
</script>
