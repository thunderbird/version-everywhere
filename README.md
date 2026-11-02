# version-everywhere

A Thunderbird Desktop add-on that shows the update channel and version number in every window and tab, for example `ESR 153.6.0`, `Beta 155.0b2`, `Release 154.0.1`, or `Daily 156.0a1`. It supports Thunderbird 140 and later.

## Where the label is

- A toolbar button in the main window, in all spaces (mail, calendar, tasks, address book, and others).
- A toolbar button in the message compose window.
- A toolbar button in the message display toolbar.
- A prefix on the title of every window, for example `[ESR 153.6.0] Inbox`.

Each channel has its own icon color and letter: green E for ESR, blue R for Release, purple B for Beta, and red D for Daily.

## How the add-on finds the channel

Add-ons cannot read the update channel, so the add-on uses the version string:

| Version pattern | Channel |
| --- | --- |
| Contains `a`, for example `156.0a1` | Daily |
| Contains `b`, for example `155.0b2` | Beta |
| Minor number is more than 0, for example `153.6.0` | ESR |
| Minor number is 0, for example `154.0.1` | Release |

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
