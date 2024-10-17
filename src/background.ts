import browser from "webextension-polyfill";
import { ProviderService } from "./providers/provider-service";
import { ApiKeyNotFoundError } from "./providers/provider-errors";
import { ApiKeys } from "./providers/provider-misc";

browser.runtime.onMessage.addListener(async (message: any) => {
  if (message.action === "searchForHash") {
    await runContentJsInCurrentTab();
  }
  if (message.action === "fetchFiles") {
    await runProviderService(message.hash);
  }
});

async function runContentJsInCurrentTab(): Promise<void> {
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
  const { apiKeys } = (await browser.storage.local.get("apiKeys")) as {
    apiKeys: ApiKeys;
  };
  console.log(apiKeys);
  if (
    apiKeys &&
    (Object.keys(apiKeys) as Array<keyof ApiKeys>).filter(
      (key) => apiKeys[key] && apiKeys[key] !== "",
    ).length > 0
  ) {
    const providerService = new ProviderService();
    providerService.initialize(apiKeys);
    try {
      const downloadLinks = await providerService.getLinks(torrentHash);
      browser.runtime.sendMessage({
        action: "displayLinks",
        links: downloadLinks,
      });
    } catch (error) {
      browser.runtime.sendMessage({
        action: "displayError",
        error: error as Error,
      });
    }
  } else {
    console.log("api key not found");
    browser.runtime.sendMessage({
      action: "displayError",
      error: new ApiKeyNotFoundError(),
    });
  }
}
