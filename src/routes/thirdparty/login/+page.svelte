<main>
  <form method="post" use:enhance>
    <h1>Sign In / Sign Up</h1>
    <hr class="two-sided-margin" />
    {#if error}<div role="alert">{error}</div>{/if}

    <ul class="providers">
      <li>
        <button name="provider" type="submit" value="github">
          <img src="/logos/github.png" alt="GitHub Logo" aria-hidden="true" />
          Continue with GitHub
        </button>
      </li>

      <li>
        <button name="provider" type="submit" value="planningcenter">
          <img src="/logos/planning-center.svg" alt="Planning Center Logo" aria-hidden="true" />
          Continue with Planning Center
        </button>
      </li>
    </ul>
  </form>
</main>

<script>
  import { enhance } from "$app/forms";
  import "$lib/stylesheets/auth-form.scss";

  /** @type {import("./$types.d.ts").PageData} */ export let data;
  /** @type {import("./$types.d.ts").ActionData} */ export let form;
  $: error = data.banner ?? form?.banner;
</script>
