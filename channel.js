"use strict";

// Finds the update channel from a Thunderbird version string.
// WebExtensions cannot read the real channel, and getBrowserInfo() returns
// ESR versions without the "esr" suffix (tested on 153.6.0), so the version
// string is the only source. See issue #1 for the rule and its known gap.

const CHANNELS = {
  daily: { name: "Daily", icon: "icons/daily.svg" },
  beta: { name: "Beta", icon: "icons/beta.svg" },
  esr: { name: "ESR", icon: "icons/esr.svg" },
  release: { name: "Release", icon: "icons/release.svg" },
};

function detectChannel(version) {
  if (/^\d+\.\d+a\d+/.test(version)) {
    return "daily"; // 156.0a1
  }
  if (/^\d+\.\d+b\d+/.test(version)) {
    return "beta"; // 155.0b2
  }
  const match = /^\d+\.(\d+)/.exec(version);
  if (match && Number(match[1]) > 0) {
    return "esr"; // 153.6.0
  }
  // 154.0, 154.0.1. The first builds of an ESR major version (153.0,
  // 153.0.1) also land here, because they look the same as Release builds.
  return "release";
}

function formatLabel(version) {
  return `${CHANNELS[detectChannel(version)].name} ${version}`;
}

if (typeof module !== "undefined") {
  module.exports = { CHANNELS, detectChannel, formatLabel };
}
