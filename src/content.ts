import { HashNotFoundError } from "./providers/provider-errors";

function searchForTorrentHash(): void {
  const htmlContent = document.documentElement.innerHTML;
  const regex = /\b([A-Fa-f0-9]{40})\b/g;
  const matches = htmlContent.match(regex);

  if (matches && matches.length > 0) {
    console.log("Torrent Hash found:\n" + matches.join("\n"));
    // Optionally, send the found hash back to the background script
    browser.runtime.sendMessage({ torrentHash: matches[0] }).then();
  } else {
    throw new HashNotFoundError();
  }
}

searchForTorrentHash();
