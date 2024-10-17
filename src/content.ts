import browser from "webextension-polyfill";
import { HashNotFoundError } from "./providers/provider-errors";

function searchForTorrentHash(): void {
  const htmlContent = document.documentElement.innerHTML;
  const regex = /\b([A-Fa-f0-9]{40})\b/g;
  const matches = htmlContent.match(regex);

  if (matches && matches.length > 0) {
    console.log("Torrent Hash found:\n" + matches.join("\n"));

    browser.runtime
      .sendMessage({
        action: "torrentHashes",
        hashes: Array.from(new Set(matches)),
      })
      .then();
  } else {
    throw new HashNotFoundError();
  }
}

searchForTorrentHash();
