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
    <form method="post" use:enhance>
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
        aria-errormessage="password-error"
      />
      {#if !!form?.errors?.password}
        <div id="password-error" role="alert">{form?.errors?.password}</div>
      {/if}

      <label for="confirm-password">Confirm password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        type="password"
        placeholder="Confirm your password"
        aria-invalid={!!form?.errors?.["confirm-password"]}
        aria-errormessage="confirm-password-error"
      />
      {#if !!form?.errors?.["confirm-password"]}
        <div id="confirm-password-error" role="alert">{form?.errors?.["confirm-password"]}</div>
      {/if}

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
    <form method="post" use:enhance>
      <h1>Reset your password</h1>
      <h2>We will send you an email to reset your password</h2>
      {#if form?.errors?.banner}<div role="alert">{form?.errors.banner}</div>{/if}

      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        aria-invalid={!!form?.errors?.email}
        aria-errormessage="email-error"
      />
      {#if !!form?.errors?.email}<div id="email-error" role="alert">{form?.errors.email}</div>{/if}

      <input name="mode" type="hidden" value={data.mode} />
      <button type="submit">Email me</button>
    </form>
  </main>
{/if}

<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import { commonRoutes } from "$lib/utils/constants";
  import "$lib/stylesheets/auth-form.scss";

  export let data: PageData;
  export let form: ActionData;
</script>
