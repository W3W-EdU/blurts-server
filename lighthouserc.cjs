/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pages = [
  "/",
  "/breaches",
  "/breach-details/LinkedInScrape2023",
  "/how-it-works",
];

const collectBaseUrl =
  process.env.LIGHTHOUSE_COLLECT_URL ?? "http://localhost:3000";
const lighthouseConfig = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      url: pages.map((pathname) => `${collectBaseUrl}${pathname}`),
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};

module.exports = lighthouseConfig;
