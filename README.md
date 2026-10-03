# website-www

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [pnpm](https://pnpm.io/installation) 12 (see [Installing pnpm](#installing-pnpm) below)
- [Google Chrome](https://google.com/chrome/)

You do not need to install Node.js yourself: `devEngines` in
[`package.json`](package.json) makes pnpm download and use the pinned Node
version automatically when you run `pnpm install`.

### Installing pnpm

Install pnpm with the standalone script, which installs the native executable
without requiring an existing Node.js installation:

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

On Windows (PowerShell):

```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

Avoid installing pnpm through npm or Corepack for this project. pnpm 12 is
a native executable that needs no Node.js of its own, but the npm package
ships only a placeholder that becomes that binary when its install script
runs. If that build is skipped or denied, pnpm silently falls back to
running through whatever Node you already have, with no error shown outside
an interactive terminal. The standalone install links the native binary
directly and has no install script to approve.

## Installation

- `git clone <repository-url>` this repository
- `cd website-www`
- `pnpm install`

## Running / Development

- `pnpm start`
- `pnpm dev` (also runs an HTTPS proxy on port 443)
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

Ember CLI is a project dependency, so you do not need it installed globally.
Use the pnpm scripts above, or prefix one-off commands with `pnpm exec`.

### Code Generators

Make use of the many generators for code, try `pnpm exec ember help generate` for more details

### Running Tests

- `pnpm test:ember`
- `pnpm test` (lint and tests together, as CI runs them)
- `pnpm exec ember test --server` (interactive test server)

### Linting

- `pnpm run lint`
- `pnpm run lint:fix`

### Building

- `pnpm exec ember build` (development)
- `pnpm build` (production)
- `pnpm build:staging` (staging)

### Deploying

Specify what it takes to deploy your app.

## CI Maintenance

The GitHub Actions in [`.github/workflows`](.github/workflows) are pinned to
full commit SHAs (with the release tag in a trailing comment), so a compromised
action repository cannot change the code our CI runs by moving a tag.

The trade-off is that pins never update themselves. Refresh them periodically
(every few months, or when an action ships a fix we need):

1. Find the latest release and its commit SHA:
   `git ls-remote --tags https://github.com/actions/checkout 'refs/tags/v5*'`
   (for annotated tags, use the peeled `^{}` entry, which is the actual commit)
2. Update the `uses:` line with the new SHA and update the version comment in
   the same edit, so the comment never lies about what the SHA points to.

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## Live site feature

### Overview

The goal of live site feature is to enable users to share their screens during these sessions, enhancing the ability to collaborate and showcase their skills to potential employers and other developers.

The aim is to create a feature that allows for seamless screen sharing and allows users who join the session late to quickly catch up on what has been discussed with the help of additional features like meeting notes, chat, word cloud, and more. This will make it easier for participants to stay engaged and informed, as well as attract new users who are browsing or curious about RDS.

The sessions should be open to all users from various platforms like Twitter, enabling other learners, job seekers as well as potential hiring managers to join and participate.

#### [PRD link](https://precodes.notion.site/precodes/Requirement-document-for-live-screen-share-feature-e8c0c1eea04947beb44ddb60e609aaec)

#### [Live screen share ticket](https://github.com/Real-Dev-Squad/website-www/issues/343)

#### [Delay in livestream ticket](https://github.com/Real-Dev-Squad/website-www/issues/361)

#### [Word Cloud Survey ticket](https://github.com/Real-Dev-Squad/website-www/issues/359)

#### [Figma design(basic wireframe)](https://www.figma.com/file/O8QLwPzTuH3RIWoYdxitln/Live-Page?node-id=0%3A1&t=vKJPfNkUiuCXPoIl-0)

#### [Figma design (detailed design)](https://www.figma.com/file/2VtPGJH61Qp0iarkKW6KTO/Live-Site-Detailed-Designs?node-id=0-1)

#### [Live stream POC link (without delay)](https://word-cloud-poc.netlify.app/live.html?role=guest)

#### [Live stream POC link (with delay)](https://s533k4.csb.app/)

#### [Word cloud survey POC link](https://word-cloud-poc.onrender.com/?role=presenter)

#### [Explore HMS notifications for better notification](https://github.com/Real-Dev-Squad/website-www/issues/639)


