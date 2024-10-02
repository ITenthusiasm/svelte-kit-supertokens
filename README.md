# Svelte Kit SuperTokens

Hello! This is my attempt at providing an example of how to use [`Svelte Kit`](https://kit.svelte.dev/) (an amazing tool for building SSR web applications in Svelte) with [`SuperTokens`](https://supertokens.com/) (an open source alternative to user authentication). Note that this repository uses the `EmailPassword`/`Passwordless` recipes/approaches from `SuperTokens` for its examples. However, the code here should be easily transferrable to the other authentication repices/methods that `SuperTokens` provides.

The solution here is based on my work done in the [Remix version](https://github.com/ITenthusiasm/remix-supertokens) of this app, but it has been modified to be more accustomed to Svelte Kit. Note that this application takes an SSR-only approach for three reasons: 1&rpar; Better security (big plus), 2&rpar; Guaranteed [progressive enhancement](https://learn.svelte.dev/tutorial/progressive-enhancement) (also a big plus), and 3&rpar; Easier code management (arguably).

If there are any questions, concerns, or ideas for improvement, feel free to reach out to me in the [SuperTokens Discord](https://supertokens.com/discord) or the [Svelte Discord](https://discord.com/invite/svelte). (Technically either one works. But if your question is more oriented towards SuperTokens, you should probably ping me on the SuperTokens Discord.) If you notice any problems with the example application, feel free to open an issue here on GitHub.

## How to Run the App

Start the dev server by running `npm run dev`. **Remember to add your own `.env` file to configure SuperTokens!** You will need to configure:

- `DOMAIN` (e.g., `http://localhost:5173`)
- `SUPERTOKENS_CONNECTION_URI` (e.g., `https://try.supertokens.com`)
- `SUPERTOKENS_API_KEY` (optional if your `SUPERTOKENS_CONNECTION_URI` is `https://try.supertokens.com`)
- `SUPERTOKENS_WEBSITE_DOMAIN` (e.g., `http://localhost:5173`)
- `SUPERTOKENS_API_DOMAIN` (e.g., `http://localhost:5173`)
- `SUPERTOKENS_API_BASE_PATH` (e.g., `/auth`)

### Using Passwordless Authentication

By default, the application uses the `EmailPassword` recipe provided by SuperTokens for logging in. If you click the `Login` button, you will be directed to the `EmailPassword` login page. If you logout, you will be redirected to that page. If you lack valid credentials and attempt to visit a protected route, you will again be redirected to that page.

To authenticate using the _`Passwordless`_ recipe provided by SuperTokens, you will need to navigate to `/passwordless/login` instead of `/login`. Once you login from the `Passwordless` page, the rest of the user experience behaves the same (e.g., visiting protected routes, refreshing your auth session, logging out, etc.). If you prefer `Passwordless`, feel free to change all of the links/redirects from `/login` to `/passwordless/login`. (I know that sounds tedious. In the future, I might create an ENV var that lets you toggle this behavior instead.)

If you have more specific questions about how the `Passwordless` recipe works, you might be helped by visiting the [Q&A exchange](https://discord.com/channels/603466164219281420/1282820138151968768/1282820138151968768) between some of the developers.

### What Code Do I Actually _Need_?

- If you're using the `EmailPassword` recipe, then you _don't_ need the `passwordless.login.tsx` page (or its dependencies).
- If you're using the `Passwordless` recipe, then you _don't_ need to worry about the `login.tsx` and `reset-password.tsx` pages (or their dependencies).

Obviously, you can decide how much you care about the (S)CSS files. Besides that, the rest of the code in the codebase should be relevant for you. The (very few) parts that aren't should be obvious.

## Frequently Asked Questions

### Why Aren't You Using `supertokens-website` or `supertokens-web-js`?

Depending too much on `supertokens-website` or `supertokens-web-js` will result in an application that cannot run without JavaScript. And an application that can't run without JavaScript is actually [inaccessible to a lot of users](https://www.kryogenix.org/code/browser/everyonehasjs.html). Consequently, we've pursued a solution that works _without_ these pacakages and _without_ JavaScript. (Don't worry! We still _enhance_ the app with JS to improve the user's experience whenever possible.) This means that our application will be accessible to the broadest range of users! :smile:

As an added bonus, we decrease our JS bundle size when we avoid the use of `supertokens-website` and _especially_ `supertokens-web-js`.

### Why Aren't You Using the Middleware from `supertokens-node`?

If you've seen the comments from [@Rich-Harris](https://github.com/Rich-Harris) (creator of Svelte) regarding server middleware (e.g., Express Middleware), then you'll know that solutions which require you to use middleware are often restricted and will prevent you from enhancing your application with other very important features. This is especially true if you're working with an SSR framework. Unfortunately, I have found Rich Harris's statements to be correct while working with my own Svelte Kit application. There are workarounds for these problem cases that allow people to still use middleware... but those aggressive workarounds often end up looking more ugly and complicated. (And thus, such approachs are more prone to error).

Avoiding the `supertokens-node` middleware ended up being _required_ for me to use HTTPS in my application _and_ get it working with high security in Cloudflare. I'll spare you the details, but there are other edge cases like these where `supertokens-node` middleware just won't work (or won't work well). Thankfully, in `supertokens-node@14`, the SuperTokens team was kind enough to introduce functions that allow you to get authentication working _without_ using their custom middleware. If you're using any kind of SSR framework that leverages progressive enhancement ([SvelteKit](https://kit.svelte.dev/), [Remix](https://remix.run/), [SolidStart](https://start.solidjs.com/), etc.), then you'll want to leverage these functions instead of using the middleware as well.

### Why Are You Using JSDocs Instead of TypeScript in Some Svelte Files?

Unfortunately, unlike Vue, [Svelte does not support TypeScript type annotations in its markup](https://github.com/sveltejs/eslint-plugin-svelte/issues/255) (at the time of this writing). This is due to a [limitation](https://github.com/sveltejs/svelte/issues/4701) in how Svelte files are processed. However, you _can_ use types in Svelte's markup _if you use JSDocs_ (because JSDocs don't have to be processed by Svelte). Consequently, we use JSDocs in the Svelte files where we deemed in-markup TS types to make the code more readable.

You're free to change these files to use TypeScript if you like. However, you'll need to move all code requiring TS type annotations into the `<script>` section of your Svelte files.

## Security Insights

Although the middleware-free approach gives us many advantages when it comes to using SuperTokens with SSR frameworks, it also gives us a little more responsibility. You'll notice in this app that we have to be intentional about the settings which we use for our HTTP cookies. You don't necessarily need to use the settings that I have (though you _should_ use `HttpOnly` and you _should_ set a strict `Path`), but you should certainly ensure that your settings are the safest that they can be for your application. Here are some resources that may be helpful for you on the matter:

- [How the `Set-Cookie` HTTP Header Works](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Docs for the `cookie` NPM package](https://www.npmjs.com/package/cookie) (Svelte Kit uses this under the hood to set the options for its cookies)

Note that Svelte Kit provides some [CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF) protection out of the box. (See [sveltejs/kit#72](https://github.com/sveltejs/kit/issues/72) and [sveltejs/kit#6510](https://github.com/sveltejs/kit/pull/6510).) If you're interested in doing anything more, consider the following resources:

- [Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

SuperTokens does have some anti-CSRF features, but there are cases where it should be used and cases where it need not be used. From [@rishabhpoddar](https://github.com/rishabhpoddar):

> Basically, when you call `createNewSessionWithoutRequestResponse`, and if you get an anti csrf token, then you should pass that in when using `getSessionWithoutRequestResponse`. If you do not get an anti csrf token, you don't need it (based on your `apiDomain` and `websiteDomain` setting) and should check for custom request header before calling `getSessionWithoutRequestResponse`. You should not explicitly set the value of `disableAntiCsrf` when calling createNewSession unless you are not using cookies at all.

Bear in mind that if you're using a framework that (sufficiently) protects against CSRF by default, then you don't necessarily need to worry about the custom headers yourself.

---

I hope you find this useful! Let me know your thoughts here on GitHub or on their [Discord](https://supertokens.com/discord). :&rpar; If there are any ways that I can improve anything here, feel free to say so.

<details>
  <summary>
    <b>Original <code>Svelte Kit</code> README</b>
  </summary>

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

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

</details>
