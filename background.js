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

let labelPromise = null;

function getLabelInfo() {
  if (!labelPromise) {
    labelPromise = messenger.runtime.getBrowserInfo().then(({ version }) => ({
      label: formatLabel(version),
      icon: CHANNELS[detectChannel(version)].icon,
    }));
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
