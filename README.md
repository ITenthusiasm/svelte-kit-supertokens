# Svelte Kit SuperTokens

Hello! This is my attempt at providing an example on how to use [`Svelte Kit`](https://kit.svelte.dev/) (an amazing tool for building SSR web applications in Svelte) with [`SuperTokens`](https://supertokens.com/) (an open source alternative to user authentication). Note that this repository uses the `EmailPassword` recipe/approach from `SuperTokens` for its examples. However, the code here should be easily transferrable to the other authentication repices/methods that `SuperTokens` provides.

**(Original `Svelte Kit` README is below.)**

---

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
