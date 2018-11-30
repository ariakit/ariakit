# Contributing to Reakit

We would love for you to contribute to Reakit and help make it even better. By contributing to Reakit, you agree to abide by the [code of conduct](https://github.com/reakit/reakit/blob/master/CODE_OF_CONDUCT.md)

- [Ownership](#ownership)
  - [Why do we give out push access?](#why-do-we-give-out-push-access)
  - [How can we help you get comfortable contributing?](#how-can-we-help-you-get-comfortable-contributing)
  - [Our expectations on you as a contributor](#our-expectations-on-you-as-a-contributor)
  - [What about if you have problems that cannot be discussed in a public issue?](#what-about-if-you-have-problems-that-cannot-be-discussed-in-a-public-issue)
- [How to start contributing?](#how-to-start-contributing)
- [Contributing with code](#contributing-with-code)
  - [Scripts](#scripts)
  - [Components](#components)
  - [Website](#website)
  - [Docs](#docs)
- [Credits](#credits)

## Ownership

**If your Pull Request is merged, regardless of content, you're eligible for push access to the organization on GitHub**. This is checked for on pull request merges and an invite is sent automatically, thanks to [Aeryn](https://github.com/Moya/Aeryn/).

Offhand, it is easy to imagine that this would make code quality suffer, but in reality it offers fresh perspectives to the codebase and encourages ownership from people who are depending on the project. If you are building a project that relies on this codebase, then you probably have the skills to improve it and offer valuable feedback.

Everyone comes in with their own perspective on what a project could/should look like, and encouraging discussion can help expose good ideas sooner.

### Why do we give out push access?

It can be overwhelming to be offered the chance to wipe the source code for a project. Do not worry, we do not let you push to `master`. All code is peer-reviewed and needs an approval of a code owner. Also, we have the convention that someone from the core team should merge non-trivial pull requests.

**As an organization contributor, you can merge other people's pull requests, or other contributors can merge yours.** You likely won't be assigned a pull request, but you're welcome to jump in and take a code review on topics that interest you.

This project is not continuously deployed, there is space for debate after review too. This means there's always a chance to revert, or to make an amending pull request. If it feels right, merge.

### How can we help you get comfortable contributing?
It's normal for a first pull request to be a potential fix for a problem, and moving on from there to helping the project's direction can be difficult. We try to help contributors cross that barrier by offering good first step issues. These issues can be fixed without feeling like you're stepping on toes. Ideally, these are non-critical issues that are well defined. They will be purposely avoided by mature contributors to the project, to make space for others.

We aim to keep all technical discussions inside GitHub issues, and all other discussions in our [Spectrum community](https://spectrum.chat/reakit). This is to make sure valuable discussions are public and discoverable via search engines. If you have questions about a specific PR, want to discuss a new API idea etc GitHub issues are the right place. If you have questions about how to use the library, or how the project is running - the [Spectrum community](https://spectrum.chat/reakit) is the place to go.

### Our expectations on you as a contributor

To quote [@alloy](https://github.com/alloy) from [this issue](https://github.com/Moya/Moya/issues/135):

> Don't ever feel bad for not contributing to open source.

We want contributors to provide ideas, keep the ship shipping and to take some of the load from others. It is non-obligatory; we’re here to get things done in an enjoyable way. :trophy:

The fact that you'll have push access will allow you to:

* Avoid having to fork the project if you want to submit other pull requests as you'll be able to create branches directly on the project.
* Help triage issues, merge pull requests.
* Pick up the project if other maintainers move their focus elsewhere.

It's up to you to use those superpowers or not though 😉

If someone submits a pull request that's not perfect, and you are reviewing, it's better to think about the PR's motivation rather than the specific implementation. Having braces on the wrong line should not be a blocker. Though we do want to keep test coverage high, we will work with you to figure that out together.

### What about if you have problems that cannot be discussed in a public issue?

You can send an email to hazdiego@gmail.com.

## How to start contributing?

Helping people on issues and writing docs are definitely the best ways to get started on any open source project.

Not all of us are native English speakers, so it's natural to find some grammar and writing errors. **If you find any, don't hesitate to submit a PR with a correction**. It'll be very much appreciated.

Navigating through our [website](https://reakit.io), if you find anything that could be explained in a better way, just click on the `IMPROVE THIS PAGE` buttons to go straight to the markdown file and edit it directly on the GitHub interface.

<p align="center">
<img src="https://user-images.githubusercontent.com/3068563/42471092-e93d149c-8392-11e8-8fa9-ef93715de6f1.png" width="350">
</p>

## Contributing with code

If you're a beginner, it'll be a pleasure to help you contribute. You can start by reading [the beginner's guide to contributing to a GitHub project](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/).

This repository is a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) managed by [Lerna](https://github.com/lerna/lerna) and makes use of [yarn workspaces](https://yarnpkg.com/lang/en/docs/cli/workspaces/).

If you haven't already done so, [install yarn](https://yarnpkg.com/en/docs/install) and run `yarn` to install the project's dependencies.

### Scripts

- `yarn lint --fix` will lint the code and fix formatting errors while you develop.
- `yarn test` will run tests for all packages.
- `yarn test --watch` will run tests only on the files you affected with your updates and will keep running watching your changes.
- `yarn test --coverage` will give you an overview of the parts of the code which are being covered by tests.
- `yarn dev` will run a development server for components. Use it while working in the `reakit` package.
- `yarn website` will run a development server for our [website](https://reakit.io). Use it while working in the `website` package.

### Components

The best way to understand components is to look into the existing ones in [`packages/reakit/src`](https://github.com/reakit/reakit/blob/master/packages/reakit/src).

A common Reakit component is composed by the following parts:

1. A `ComponentName.ts` file inside a `ComponentName` folder (e.g. [`Group/Group.ts`](https://github.com/reakit/reakit/blob/master/packages/reakit/src/Group/Group.ts)).

    Prop types are exported `interfaces` named as `ComponentNameProps`:

    ```ts
    export interface GroupProps extends BoxProps {
      vertical?: boolean;
      verticalAt?: number;
    }
    ```

    > If a component has no props, we just export an empty interface ([example](https://github.com/reakit/reakit/blob/4fba0e6793b78ac677dc87f1cb7ee8950ca7bbbe/packages/reakit/src/Group/GroupItem.ts#L6)).

    `styled` is used to define component styles and theme:

    ```ts
    const Group = styled(Box)<GroupProps>`
      display: flex;
      ${theme("Group")};
    `;
    ```

    > If JSX is needed, we rename the file extension to `.tsx` and put together a component called `ComponentNameComponent` ([example](https://github.com/reakit/reakit/blob/4fba0e6793b78ac677dc87f1cb7ee8950ca7bbbe/packages/reakit/src/Toolbar/Toolbar.tsx#L16)).

    If a component has sub components, we create another file in the same folder following the same instructions (e.g. [`Group/GroupItem.ts`](https://github.com/reakit/reakit/blob/master/packages/reakit/src/Group/GroupItem.ts)).

2. A markdown file for each component containing documentation (e.g. [`Group/Group.md`](https://github.com/reakit/reakit/blob/master/packages/reakit/src/Group/Group.md) and [`Group/GroupItem.md`](https://github.com/reakit/reakit/blob/master/packages/reakit/src/Group/GroupItem.md)).

3. An `index.ts` file to export all components (e.g. [`Group/index.ts`](https://github.com/reakit/reakit/blob/master/packages/reakit/src/Group/index.ts)):

    ```ts
    import Group from "./Group";
    import GroupItem from "./GroupItem";

    export * from "./Group";
    export * from "./GroupItem";

    export default Object.assign(Group, {
      Item: GroupItem
    });
    ```

4. A `__tests__` folder with test files. Take a look at [#271](https://github.com/reakit/reakit/issues/271) to learn more.

5. An entry in [`packages/reakit/src/index.ts`](https://github.com/reakit/reakit/blob/master/packages/reakit/src/index.ts).

> While working on components, one can use `yarn dev` or `yarn website` so as to have a visual reference of what's being done.

### Website

The `website` package is built with [react-styleguidist](https://react-styleguidist.js.org/). You can find its configuration file on [`packages/website/styleguide.config.js`](https://github.com/reakit/reakit/blob/master/packages/website/styleguide.config.js).

We have replaced all the default components from `react-styleguidist` by just overriding its main component with our own, which you can find on [`packages/website/src/index.js`](https://github.com/reakit/reakit/blob/master/packages/website/src/index.js).

### Docs

You can find guide docs in the [`docs`](https://github.com/reakit/reakit/tree/master/docs) folder. While component docs are placed together with its component in the `reakit` package: [`packages/reakit/src`](https://github.com/reakit/reakit/blob/master/packages/reakit/src).

While working on docs, make sure to run `yarn website` to see the changes. If the browser doesn't refresh automatically, you should do that manually.

## Credits

### Contributors

This project exists thanks to all the people who contribute.
<a href="https://github.com/reakit/reakit/graphs/contributors"><img src="https://opencollective.com/reakit/contributors.svg?width=1050&button=false" /></a>


### Supporters

By donating $5 or more you help in the development of this project. Thank you to all our supporters! 🙏

<p>
  <a href="https://opencollective.com/reakit/sponsor/0/website"><img src="https://opencollective.com/reakit/sponsor/0/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/1/website"><img src="https://opencollective.com/reakit/sponsor/1/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/2/website"><img src="https://opencollective.com/reakit/sponsor/2/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/3/website"><img src="https://opencollective.com/reakit/sponsor/3/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/4/website"><img src="https://opencollective.com/reakit/sponsor/4/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/5/website"><img src="https://opencollective.com/reakit/sponsor/5/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/6/website"><img src="https://opencollective.com/reakit/sponsor/6/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/7/website"><img src="https://opencollective.com/reakit/sponsor/7/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/8/website"><img src="https://opencollective.com/reakit/sponsor/8/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/9/website"><img src="https://opencollective.com/reakit/sponsor/9/avatar.svg"></a>
</p>

<p>
  <a href="https://opencollective.com/reakit/backer/0/website"><img src="https://opencollective.com/reakit/backer/0/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/1/website"><img src="https://opencollective.com/reakit/backer/1/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/2/website"><img src="https://opencollective.com/reakit/backer/2/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/3/website"><img src="https://opencollective.com/reakit/backer/3/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/4/website"><img src="https://opencollective.com/reakit/backer/4/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/5/website"><img src="https://opencollective.com/reakit/backer/5/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/6/website"><img src="https://opencollective.com/reakit/backer/6/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/7/website"><img src="https://opencollective.com/reakit/backer/7/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/8/website"><img src="https://opencollective.com/reakit/backer/8/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/9/website"><img src="https://opencollective.com/reakit/backer/9/avatar.svg"></a>
</p>

