# For Contributors

I'd love your help! This doc covers how to become a contributor and submit code to the project.

## The Vision

This component is all about tiny and fast features, not being the kitchen sink of YouTube embeds. Anything that adds bloat or perf loss won't be accepted for merge without PR revisions. Let's use the platform, and make it speeeedy!

## Where can I start?

I tag issues that are good-ish candidates for those new to the code with [`good first issue`](https://github.com/justinribeiro/lite-youtube/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22).

## Follow the coding style

I use [JSDoc](http://usejsdoc.org/) with [TypeScript `@typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint), as well as the [@open-wc/eslint-config](https://www.npmjs.com/package/@open-wc/eslint-config). All eslint config is set within package.json, there are lint commands within package.json scripts available for use, and annotations are encouraged for all contributions.

## Starting Development

1. Fork the repo to your personal account so changes you make can be sent as a pull request.

2. Then install all dependencies:

```sh
$ yarn
```

3. Run the development server:

```sh
$ yarn start
```

To run the development server in watch mode:

```sh
$ yarn start:watch
```

In both cases, the command starts a local webserver at http://localhost:8000/, navigate to the demo folder (if it does not auto-open the page), and you'll be able to play with the various demo's within `demo/index.html`.

## Writing Tests

Tests are contained within the `test` folder, and utilize [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) and [@open-wc/testing](https://open-wc.org/docs/testing/testing-package/).

To run the tests:

```sh
$ yarn test
```

To run the development tests in watch mode:

```sh
$ yarn test:watch
```