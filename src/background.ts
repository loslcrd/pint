import { RealDebridService } from "./real-debrid-service";

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "searchForHash") {
    await runContentJsInCurrentTab();
  }
  if (message.torrentHash) {
    await runProviderService(message.torrentHash);
  }
});

async function runContentJsInCurrentTab(): Promise<void> {
  console.log("searchForHash received");
  // Get the active tab
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.id) {
    // Inject the content script to search for the hash in the active tab
    browser.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["js/content.js"],
    });
  }
}

async function runProviderService(torrentHash: string) {
  // Retrieve the API key from storage
  const { realDebridApiKey } =
    await browser.storage.local.get("realDebridApiKey");
  if (realDebridApiKey) {
    const realDebridService = new RealDebridService(realDebridApiKey);
    try {
      const downloadLinks =
        await realDebridService.getDownloadLinks(torrentHash);
      alert("Download Links:\n" + JSON.stringify(downloadLinks));
    } catch (error) {
      console.error("Error fetching download links:", error);
      alert("Failed to fetch download links.");
    }
  } else {
    alert("No API Key configured. Please configure the RealDebrid API Key.");
  }
}
