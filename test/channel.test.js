"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { detectChannel, formatLabel } = require("../channel.js");

test("detects each channel from the version string", () => {
  const cases = {
    "156.0a1": "daily",
    "155.0b2": "beta",
    "155.0b10": "beta",
    "153.6.0": "esr",
    "153.10.1": "esr",
    "140.4.0": "esr",
    "154.0": "release",
    "154.0.1": "release",
  };
  for (const [version, channel] of Object.entries(cases)) {
    assert.equal(detectChannel(version), channel, version);
  }
});

test("first builds of an ESR major version count as Release (accepted gap)", () => {
  assert.equal(detectChannel("153.0"), "release");
  assert.equal(detectChannel("153.0.1"), "release");
});

test("formats the label as channel name plus version", () => {
  assert.equal(formatLabel("153.6.0"), "ESR 153.6.0");
  assert.equal(formatLabel("155.0b2"), "Beta 155.0b2");
  assert.equal(formatLabel("154.0.1"), "Release 154.0.1");
  assert.equal(formatLabel("156.0a1"), "Daily 156.0a1");
});
