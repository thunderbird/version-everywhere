"use strict";

// Shows the channel and version in every window and tab:
// - a labeled toolbar button in the main window (all spaces), the compose
//   window, and the message display toolbar;
// - a prefix on the title of every window.
// Uses only standard WebExtension APIs. Experiment APIs are not permitted.

const ACTIONS = [
  messenger.action,
  messenger.composeAction,
  messenger.messageDisplayAction,
];

const FETCH_TIMEOUT_MS = 5000;

let labelPromise = null;

// Gets the latest Release version from product-details.mozilla.org. If the
// request fails, uses the last value that a request returned.
async function getLatestRelease() {
  try {
    const response = await fetch(PRODUCT_DETAILS_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const latestRelease = parseLatestRelease(await response.json());
    if (!latestRelease) {
      throw new Error("LATEST_THUNDERBIRD_VERSION is missing");
    }
    await messenger.storage.local.set({ latestRelease });
    return latestRelease;
  } catch (error) {
    console.warn("Version Everywhere: cannot get the latest Release version", error);
    const { latestRelease = null } = await messenger.storage.local.get("latestRelease");
    return latestRelease;
  }
}

function getLabelInfo() {
  if (!labelPromise) {
    labelPromise = (async () => {
      const { version } = await messenger.runtime.getBrowserInfo();
      const channel = detectChannel(version);
      // Only ".0" versions need the network request.
      const latestRelease = channel === "releaseOrBeta" ? await getLatestRelease() : null;
      return {
        label: formatLabel(version, latestRelease),
        icon: CHANNELS[detectChannel(version, latestRelease)].icon,
      };
    })();
  }
  return labelPromise;
}

async function setTitlePreface(windowId) {
  const { label } = await getLabelInfo();
  try {
    await messenger.windows.update(windowId, { titlePreface: `[${label}] ` });
  } catch (error) {
    console.error(`Version Everywhere: cannot set the title of window ${windowId}`, error);
  }
}

async function setUp() {
  const { label, icon } = await getLabelInfo();
  for (const action of ACTIONS) {
    await action.setLabel({ label });
    await action.setTitle({ title: label });
    await action.setIcon({ path: icon });
  }
  const windows = await messenger.windows.getAll();
  await Promise.all(windows.map((win) => setTitlePreface(win.id)));
}

// Register listeners at the top level, so that the event page wakes up for
// each new window.
messenger.windows.onCreated.addListener((win) => setTitlePreface(win.id));

setUp();
