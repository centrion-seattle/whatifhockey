"use strict";

/**
 * Must stay compatible with Node 10+ so we can print a clear error before Next.js runs.
 */
var match = /^v(\d+)/.exec(process.version);
var major = match ? parseInt(match[1], 10) : 0;

if (major < 18) {
  console.error("");
  console.error(
    "This project requires Node.js 18.18 or newer (Next.js 15). You are on " +
      process.version +
      ".",
  );
  console.error("");
  console.error("Install Node 20 LTS: https://nodejs.org/");
  console.error("Or with nvm: nvm install && nvm use");
  console.error("");
  process.exit(1);
}
