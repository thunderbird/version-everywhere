"use strict";

// Finds the update channel from a Thunderbird version string.
// WebExtensions cannot read the real channel. getBrowserInfo() hides the
// "esr" suffix (153.6.0esr -> 153.6.0) and the beta suffix
// (160.0b2 -> 160.0), so only Daily builds keep their suffix (161.0a1).
// To tell Beta from Release, the add-on compares the major version with the
// latest Release version from product-details.mozilla.org. See issue #1.

const PRODUCT_DETAILS_URL =
  "https://product-details.mozilla.org/1.0/thunderbird_versions.json";

const CHANNELS = {
  daily: { name: "Daily", icon: "icons/daily.svg" },
  beta: { name: "Beta", icon: "icons/beta.svg" },
  esr: { name: "ESR", icon: "icons/esr.svg" },
  release: { name: "Release", icon: "icons/release.svg" },
  releaseOrBeta: { name: "Release or Beta", icon: "icons/unknown.svg" },
};

function majorVersion(version) {
  const match = /^(\d+)\./.exec(version);
  return match ? Number(match[1]) : NaN;
}

// latestRelease is the latest Release version, for example "159.0", or null
// if it is not known (for example, when the computer is offline).
function detectChannel(version, latestRelease = null) {
  if (/^\d+\.\d+a\d+/.test(version)) {
    return "daily"; // 161.0a1
  }
  if (/^\d+\.\d+b\d+/.test(version)) {
    return "beta"; // 160.0b2, if a future build stops hiding the suffix
  }
  const match = /^\d+\.(\d+)/.exec(version);
  if (match && Number(match[1]) > 0) {
    return "esr"; // 153.6.0
  }
  // A ".0" version: Release (159.0, 159.0.1) or Beta (160.0). The first
  // builds of an ESR major version (153.0, 153.0.1) also land here, because
  // they look the same as Release builds.
  const latestMajor = latestRelease ? majorVersion(latestRelease) : NaN;
  if (Number.isNaN(latestMajor)) {
    return "releaseOrBeta";
  }
  return majorVersion(version) > latestMajor ? "beta" : "release";
}

function formatLabel(version, latestRelease = null) {
  return `${CHANNELS[detectChannel(version, latestRelease)].name} ${version}`;
}

// Returns LATEST_THUNDERBIRD_VERSION from the product details JSON, or null
// if the data is not in the expected format.
function parseLatestRelease(data) {
  const version = data && data.LATEST_THUNDERBIRD_VERSION;
  return typeof version === "string" && /^\d+\.\d+/.test(version) ? version : null;
}

if (typeof module !== "undefined") {
  module.exports = {
    CHANNELS,
    PRODUCT_DETAILS_URL,
    detectChannel,
    formatLabel,
    parseLatestRelease,
  };
}
