# version-everywhere

A Thunderbird Desktop add-on that shows the update channel and version number in every window and tab, for example `ESR 153.6.0`, `Beta 160.0`, `Release 159.0.1`, or `Daily 161.0a1`. It supports Thunderbird 140 and later.

## Where the label is

- A toolbar button in the main window, in all spaces (mail, calendar, tasks, address book, and others).
- A toolbar button in the message compose window.
- A toolbar button in the message display toolbar.
- A prefix on the title of every window, for example `[ESR 153.6.0] Inbox`.

Each channel has its own icon color and letter: green E for ESR, blue R for Release, purple B for Beta, and red D for Daily. A gray question mark means Release or Beta.

## How the add-on finds the channel

Add-ons cannot read the update channel. The version that add-ons get also hides the `esr` and beta suffixes. For example, ESR 153.6.0esr shows as `153.6.0`, and Beta 160.0b2 shows as `160.0`. The add-on uses these rules:

| Version | Channel |
| --- | --- |
| Contains `a`, for example `161.0a1` | Daily |
| Minor number is more than 0, for example `153.6.0` | ESR |
| Minor number is 0, and the major version is newer than the latest Release, for example `160.0` | Beta |
| Minor number is 0, and the major version is not newer than the latest Release, for example `159.0.1` | Release |

To get the latest Release version, the add-on reads `thunderbird_versions.json` from product-details.mozilla.org at startup. The request sends no user data. If the request fails, the add-on uses the last version that it received. If it never received a version, the label says `Release or Beta 160.0` with a gray icon.

The first builds of an ESR major version (for example `153.0` and `153.0.1`) show as Release, because they look the same as Release builds.

## Development

To run the tests, use Node.js 18 or later:

```
npm test
```

To make `dist/version-everywhere.xpi`:

```
npm run build
```

To try the add-on, open the Thunderbird menu > Add-ons and Themes > gear icon > Debug Add-ons > Load Temporary Add-on. Then select `manifest.json`.
