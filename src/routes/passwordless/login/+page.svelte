{#if data.mode === "link-signin"}
  <!-- Note: Users will only get here if their Login Link is invalid -->
  <main>
    <div class="auth-card">
      <h1>Invalid Login Link</h1>
      <p>This login link is either expired or invalid.<br aria-hidden="true" />Please use a different one.</p>
    </div>
  </main>
{:else if data.mode === "messaged"}
  <!-- TODO: Consider implementing a `resend` Link -->
  <main>
    <div class="auth-card">
      <h1>{`Check Your ${data.contact === "email" ? "Email" : "Phone"}`}</h1>
      <p>{`A link was sent to your ${data.contact === "email" ? "email" : "phone"}. Use it to log in.`}</p>
    </div>
  </main>
{:else if data.mode === "code-signin"}
  <!-- TODO: Consider implementing a `resend` Button -->
  <main>
    <form method="post" use:enhance={submitFunction} use:autoObserve>
      <h1>Enter Verification Code</h1>
      <h2>{`A verification code was sent to your ${data.contact === "email" ? "email" : "phone"}`}</h2>

      <label for="code">Code</label>
      <input
        id="code"
        name="code"
        type="text"
        inputMode="numeric"
        required
        aria-invalid={!!errors?.code}
        aria-describedby="code-error"
      />
      <div id="code-error" role="alert">{errors?.code ?? ""}</div>

      <input name="mode" type="hidden" value={data.mode} />
      <button type="submit">Sign In</button>
    </form>
  </main>
{:else}
  <main>
    <form method="post" use:enhance={submitFunction} use:autoObserve>
      <h1>Sign Up / Sign In</h1>
      <hr class="two-sided-margin" aria-hidden="true" />

      <div class="@flex @justify-between @items-center">
        <label for={data.contact}>{data.contact === "email" ? "Email" : "Phone Number"}</label>
        <a href={`?${searchParams.toString()}`}>{`Use ${data.contact === "email" ? "a Phone Number" : "an Email"}`}</a>
      </div>

      <input
        id={data.contact}
        inputMode={data.contact === "phoneNumber" ? "numeric" : undefined}
        required
        aria-invalid={!!errors?.[data.contact]}
        aria-describedby={`${data.contact}-error`}
        {...configure(data.contact, {
          type: data.contact === "email" ? { value: "email", message: "Email is invalid" } : "text",
        })}
      />
      <div id={`${data.contact}-error`} role="alert">{errors?.[data.contact] ?? ""}</div>

      <input name="mode" type="hidden" value={data.mode} />
      <button type="submit">Continue</button>
    </form>
  </main>
{/if}

<script>
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import { createFormValidityObserver } from "@form-observer/svelte";
  import "$lib/stylesheets/auth-form.scss";

  /** @type {import("./$types.d.ts").PageData} */ export let data;
  /** @type {URLSearchParams} */ let searchParams;
  $: {
    searchParams = new URLSearchParams($page.url.searchParams);
    searchParams.set("contact", data.contact === "email" ? "phoneNumber" : "email");
  }

  /** @type {import("./$types.d.ts").ActionData} */ export let form;
  $: errors = form ?? {};

  // Manage form errors.
  /** @param {HTMLInputElement} field */
  const required = (field) => `${field.labels?.[0].textContent} is required`;

  const { autoObserve, configure, validateFields } = createFormValidityObserver("focusout", {
    renderByDefault: true,
    defaultErrors: { required },
    renderer(errorContainer, errorMessage) {
      const fieldName = /** @type {keyof typeof errors} */ (errorContainer.id.replace(/-error$/, ""));
      errors[fieldName] = errorMessage;
    },
  });

  /** @type {import("./$types.d.ts").SubmitFunction} */
  const submitFunction = ({ cancel }) => (validateFields({ focus: true }) ? undefined : cancel());
</script>
