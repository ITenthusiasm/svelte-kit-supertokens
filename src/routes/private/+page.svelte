<div id="private-page">
  <h1>Hello! This page is private! 🤫 Your user id: {data.user.id}</h1>
  <h2>Try submitting some data!</h2>

  <div class="form-submission-example">
    <form method="POST" use:enhance>
      <h3>Form</h3>

      <label for="text">Text Input</label>
      <input id="text" name="text" type="text" />
      <button type="submit">Submit</button>
    </form>

    <hr />

    <div>
      <h3>Response</h3>
      {#if form?.success}<pre>{JSON.stringify(form?.data, null, 2)}</pre>{/if}
    </div>
  </div>
</div>

<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  export let data: PageData;
  export let form: ActionData;
</script>

<style lang="scss">
  #private-page {
    font-family: system-ui, sans-serif;
    line-height: 1.4;

    :is(h1, h2, h3) {
      text-align: center;
    }

    > .form-submission-example {
      display: flex;
      justify-content: center;
      column-gap: 20px;
      margin: 0 auto;

      > form {
        > input[type="text"] {
          min-height: 34px;
        }

        > button[type="submit"] {
          width: 100%;
          padding: 6px;
          margin-top: 20px;
        }
      }

      > hr {
        border-right: 2px solid #222;
        margin: 0;
      }

      > :last-child {
        width: 181px;

        > pre {
          box-sizing: border-box;
          padding: 20px;
          border-radius: 4px;
          margin-top: 0;

          white-space: wrap;
          background-color: lightgray;
        }
      }
    }
  }
</style>
