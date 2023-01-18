{#if !authPages.includes(data.pathname)}
  <header>
    <nav aria-label="Primary Navigation">
      <ul>
        <li>
          <a href="/">Home</a>
        </li>

        {#if authenticated}
          <li>
            <a href="/private">Private</a>
          </li>
        {/if}

        <li>
          <a class="auth-button" href={`/${authAction}`} data-sveltekit-preload-data="tap">{authAction}</a>
        </li>
      </ul>
    </nav>
  </header>
{/if}

<slot />

<script lang="ts">
  import type { LayoutData } from "./$types";
  import { authPages } from "$lib/utils/constants";
  import "$lib/stylesheets/global.scss";

  export let data: LayoutData;

  $: authenticated = !!data.user.id;
  $: authAction = authenticated ? "logout" : "login";
</script>

<style lang="scss">
  :root {
    --primary-color: #ff9b33;
    --input-radius: 6px;
  }

  header {
    display: flex;
    justify-content: end;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #222;

    > nav > ul {
      display: flex;
      align-items: center;
      column-gap: 24px;
      list-style: none;

      > li {
        > a {
          color: #222;
          font-weight: bold;
          font-size: 24px;
          text-decoration: none;
        }

        a.auth-button {
          display: block;
          box-sizing: border-box;
          padding: 10px;
          border: 1px solid #ee8d23;
          border-radius: var(--input-radius);

          text-align: center;
          font-family: "Times New Roman", Times, serif;
          font-size: 20px;
          text-transform: capitalize;
          color: white;
          background-color: var(--primary-color);
          transition: all 0.4s;

          @media (hover: hover) {
            &:hover {
              filter: brightness(0.95);
            }
          }
        }
      }
    }
  }
</style>
