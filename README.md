# Svelte Kit SuperTokens

Hello! This is my attempt at providing an example on how to use [`Svelte Kit`](https://kit.svelte.dev/) (an amazing tool for building SSR web applications in Svelte) with [`SuperTokens`](https://supertokens.com/) (an open source alternative to user authentication). Note that this repository uses the `EmailPassword` recipe/approach from `SuperTokens` for its examples. However, the code here should be easily transferrable to the other authentication repices/methods that `SuperTokens` provides.

The solution here is based on my work done in the [Remix version](https://github.com/ITenthusiasm/remix-supertokens) of this app, but it has been modified to be more accustomed to Svelte Kit. Note that this application takes an SSR-only approach for two reasons: 1) Better security (big plus) and 2) Easier management (arguably).

If there are any questions, concerns, or ideas for improvement, feel free to reach out to me in the [SuperTokens Discord](https://supertokens.com/discord) or the [Svelte Discord](https://discord.com/invite/svelte). (Technically either one works. But if your question is more oriented towards SuperTokens, you should probably ping me on the SuperTokens Discord.)

## How to Run the App

Start the dev server by running `npm run dev`. **Remember to add your own `.env` file to configure SuperTokens!** You will need to configure:

- `DOMAIN` (e.g., `http://localhost:5173`)
- `SUPERTOKENS_CONNECTION_URI` (e.g., `https://try.supertokens.com`)
- `SUPERTOKENS_API_KEY` (optional if your `SUPERTOKENS_CONNECTION_URI` is `https://try.supertokens.com`)
- `SUPERTOKENS_WEBSITE_DOMAIN` (e.g., `http://localhost:5173`)
- `SUPERTOKENS_API_DOMAIN` (e.g., `http://localhost:5173`)
- `SUPERTOKENS_API_BASE_PATH` (e.g., `/auth`)

## Frequently Asked Questions

### Why Aren't You Using `supertokens-website`?

Depending too much on `supertokens-website` will result in an application that cannot run without JavaScript.\* This, in turn, means that our application won't be as accessible. By excluding `supertokens-website`, we can circumvent this problem. Moreover, if we remove `supertokens-website` from our dependencies, then our end users will receive a smaller bundle size.

\* _Although we want an application that **works** well without JavaScript, there is nothing wrong with **enhancing** our application with JavaScript. It just so happens that we can do this fairly well without relying on `supertokens-website` in Svelte Kit land._

I hope you find this useful! Let me know your thoughts here on GitHub or on their [Discord](https://supertokens.com/discord). :) If there are any ways that I can improve anything here, feel free to say so.

### Why Aren't You Using the Middleware from `supertokens-node`?

If you've seen the comments from @Rich-Harris regarding server middleware (e.g., Express Middleware), you'll know that solutions that require you to use middleware are often restricted and will prevent you from enhancing your application with other very important features. This is especially the case if you're working with an SSR framework. And unfortunately, I have found Rich Harris's statements to be correct while working with my Svelte Kit application. There are workarounds for these problem cases that allow people to still use middleware... but those aggressive approaches often end up looking more ugly and complicated (and thus being more error-prone).

Avoiding the `supertokens-node` middleware ended up being _required_ for me to use HTTPS on my application _and_ get it working with high security in Cloudflare. I'll spare you the details, but there are other edge cases like these where `supertokens-node` middleware just won't work. I've suggested that the `SuperTokens` functions/methods be refactored to not require middleware, as this gives more options to developers and potentially decreases the amount of code the team has to maintain. See the [SuperTokens Utilities README](./app/utils/supertokens/README.md) for more details.

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
