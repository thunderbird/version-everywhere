# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Thunderbird Desktop add-on (Manifest V3) that shows the update channel and version, for example `ESR 153.6.0`, in every window and tab. The requirements and decisions are in GitHub issue #1 of `thunderbird/version-everywhere`. The code is under the Mozilla Public License 2.0.

## Commands

- Run all tests: `npm test` (Node.js built-in test runner, no dependencies).
- Run one test file: `node --test test/channel.test.js`.
- Run one test by name: `node --test --test-name-pattern="formats the label" test/channel.test.js`.
- Build the package: `npm run build` (writes `dist/version-everywhere.xpi`).
- Lint: `npx web-ext lint --source-dir . --self-hosted`. Copy only the add-on files to a separate directory first, because the linter also reads `test/` and `package.json`. One warning about Firefox for Android is expected.
- Manual test: in Thunderbird, open the menu > Add-ons and Themes > gear icon > Debug Add-ons > Load Temporary Add-on, and select `manifest.json`.

## Architecture

`channel.js` holds the pure logic: `detectChannel(version)`, `formatLabel(version)`, and the `CHANNELS` table that maps each channel to a name and an icon. It is a plain script, not a module. The add-on loads it as a background script, so its functions are globals in `background.js`. Node.js loads it through the `module.exports` guard at the end of the file, so that the tests can use it.

`background.js` reads the version with `messenger.runtime.getBrowserInfo()`. It sets the label, title, and icon on three toolbar buttons: `action` (main window, all spaces through `allowed_spaces: []`), `composeAction`, and `messageDisplayAction`. It also sets `titlePreface` on every window through `windows.update()`, and on each new window through `windows.onCreated`. The background is an event page, so listeners must stay at the top level.

## Constraints

- Use only standard WebExtension APIs. Experiment APIs are not permitted.
- Support ESR 140.x, ESR 153.x, and all later versions (`strict_min_version` is `140.0`).
- `getBrowserInfo()` returns ESR versions without the `esr` suffix (tested on 153.6.0). The channel comes only from the version string. The first builds of an ESR major version (`153.0`, `153.0.1`) show as Release, and this gap is accepted.
- Icon colors must give a WCAG 2.1 AA contrast ratio of 4.5:1 or more with white text. If you change a color in `icons/`, compute the ratio again.
