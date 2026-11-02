"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { detectChannel, formatLabel, parseLatestRelease } = require("../channel.js");

test("detects Daily and ESR without the latest Release version", () => {
  assert.equal(detectChannel("161.0a1"), "daily");
  assert.equal(detectChannel("153.6.0"), "esr");
  assert.equal(detectChannel("153.10.1"), "esr");
  assert.equal(detectChannel("140.4.0"), "esr");
});

test("detects Beta from a beta suffix", () => {
  assert.equal(detectChannel("160.0b2"), "beta");
  assert.equal(detectChannel("160.0b10", "159.0"), "beta");
});

test("a .0 version is Beta if its major version is newer than the latest Release", () => {
  // getBrowserInfo() returns "160.0" on Beta 160.0b2 (tested).
  assert.equal(detectChannel("160.0", "159.0"), "beta");
  assert.equal(detectChannel("160.0", "159.0.1"), "beta");
});

test("a .0 version is Release if its major version is not newer than the latest Release", () => {
  assert.equal(detectChannel("159.0", "159.0"), "release");
  assert.equal(detectChannel("159.0.1", "159.0.1"), "release");
  assert.equal(detectChannel("158.0", "159.0"), "release");
});

test("a .0 version is Release or Beta if the latest Release version is not known", () => {
  assert.equal(detectChannel("160.0"), "releaseOrBeta");
  assert.equal(detectChannel("160.0", null), "releaseOrBeta");
  assert.equal(detectChannel("160.0", "not a version"), "releaseOrBeta");
});

test("first builds of an ESR major version count as Release (accepted gap)", () => {
  assert.equal(detectChannel("153.0", "159.0"), "release");
  assert.equal(detectChannel("153.0.1", "159.0"), "release");
});

test("formats the label as channel name plus version", () => {
  assert.equal(formatLabel("153.6.0"), "ESR 153.6.0");
  assert.equal(formatLabel("160.0", "159.0"), "Beta 160.0");
  assert.equal(formatLabel("159.0", "159.0"), "Release 159.0");
  assert.equal(formatLabel("161.0a1"), "Daily 161.0a1");
  assert.equal(formatLabel("160.0"), "Release or Beta 160.0");
});

test("parses the latest Release version from product details", () => {
  const data = {
    LATEST_THUNDERBIRD_DEVEL_VERSION: "160.0b2",
    LATEST_THUNDERBIRD_NIGHTLY_VERSION: "161.0a1",
    LATEST_THUNDERBIRD_VERSION: "159.0",
    THUNDERBIRD_ESR: "153.6.0esr",
  };
  assert.equal(parseLatestRelease(data), "159.0");
  assert.equal(parseLatestRelease({}), null);
  assert.equal(parseLatestRelease(null), null);
  assert.equal(parseLatestRelease({ LATEST_THUNDERBIRD_VERSION: 159 }), null);
});
