<main>
  <form method="POST" use:enhance>
    <h1>{`Sign ${data.mode === "signin" ? "In" : "Up"}`}</h1>

    <h2>
      {#if data.mode === "signin"}
        Not registered yet? <a href="login?mode=signup">Sign Up</a>
      {:else}
        Already have an account? <a href="/login">Sign In</a>
      {/if}
    </h2>

    <hr />

    {#if form?.errors.banner}
      <div role="alert">{form.errors.banner}</div>
    {/if}

    <label for="email">Email</label>
    <input
      id="email"
      name="email"
      placeholder="Email Address"
      type="email"
      aria-invalid={!!form?.errors.email}
      aria-errormessage="email-error"
    />
    {#if !!form?.errors.email}
      <div id="email-error" role="alert">{form.errors.email}</div>
    {/if}

    <label for="password">Password</label>
    <input
      id="password"
      name="password"
      placeholder="Password"
      type="password"
      aria-invalid={!!form?.errors.password}
      aria-errormessage="password-error"
    />
    {#if !!form?.errors.password}
      <div id="password-error" role="alert">{form.errors.password}</div>
    {/if}

    <input name="mode" type="hidden" value={data.mode} />
    <button type="submit">{`Sign ${data.mode === "signin" ? "In" : "Up"}`}</button>

    {#if data.mode === "signin"}
      <a class="forgot-password" href={commonRoutes.resetPassword}>Forgot password?</a>
    {/if}
  </form>
</main>

<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import { commonRoutes } from "$lib/utils/constants";
  import "$lib/stylesheets/auth-form.scss";

  export let data: PageData;
  export let form: ActionData;
</script>

<style lang="scss">
  main > form > a.forgot-password {
    display: block;
    width: fit-content;
    margin: 10px auto 0;
    color: #656565;
  }
</style>
