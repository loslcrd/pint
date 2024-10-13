// src/popup.tsx
import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { ProviderService } from "./providers/provider-service";
import { ProviderError } from "./providers/provider-errors";
import { ProviderResponse, ProviderResults } from "./providers/provider-misc";

// Main page component
const MainPage = ({ navigateToConfig }: { navigateToConfig: () => void }) => {
  const [links, setLinks] = useState<ProviderResults>({});
  const [error, setError] = useState<Error | null>(null);

  const handleMessageReceived = useCallback((message: any) => {
    if (message.action !== undefined) console.log(message);
    if (message.action === "displayError") {
      setError(message.error);
    } else if (message.action === "displayLinks") {
      setLinks(message.links);
      saveLinksToStorage(message.links);
      setError(null);
    }
  }, []);

  useEffect(() => {
    loadLinksFromStorage();
    browser.runtime.onMessage.addListener(handleMessageReceived);
    return () =>
      browser.runtime.onMessage.removeListener(handleMessageReceived);
  }, [handleMessageReceived]);

  const saveLinksToStorage = (links: ProviderResults) => {
    browser.storage.local.set({ links: links });
  };

  const loadLinksFromStorage = async () => {
    const result = await browser.storage.local.get("links");
    if (result.links) {
      setLinks(result.links);
    }
  };

  const searchForHash = () => {
    browser.runtime.sendMessage({ action: "searchForHash" });
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Main Page</h2>
      <button onClick={searchForHash}>Search for Hash</button>
      <br />
      <button onClick={navigateToConfig}>Configure</button>

      {Object.keys(links).length > 0 && (
        <div>
          <h3>Download Links</h3>
          <ul>
            {Object.keys(links).map((provider) => (
              <li key={provider}>
                <strong>{provider}</strong>
                <ul>
                  {links[provider] instanceof Error ? (
                    <div className="error">{links[provider].message}</div>
                  ) : (
                    // If there are no errors, display the list of download links
                    Object.keys(links[provider] as ProviderResponse).map(
                      (filename) => (
                        <li key={filename}>
                          <a
                            href={
                              (links[provider] as ProviderResponse)[filename][
                                "downloadLink"
                              ]
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {filename}
                          </a>
                        </li>
                      ),
                    )
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="error">{error.message}</div>}
    </div>
  );
};

// Configuration page component
const ConfigPage = ({ navigateToMain }: { navigateToMain: () => void }) => {
  const [apiKeys, setApiKeys] = useState<{ [provider: string]: string }>({
    realDebrid: "",
    // not yet implemented:
    // allDebrid: "",
  });
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    // Load the stored API keys when the config page loads
    browser.storage.local.get("apiKeys").then((result) => {
      if (result.apiKeys) {
        setApiKeys(result.apiKeys);
      }
    });
  }, []);

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys((prevKeys) => ({
      ...prevKeys,
      [provider]: value,
    }));
  };

  const saveApiKeys = () => {
    browser.storage.local.set({ apiKeys }).then(() => {
      setStatusMessage("API Keys saved!");
    });
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Configure API Keys</h2>

      <div>
        <label>
          Real-Debrid API Key:
          <input
            type="text"
            value={apiKeys.realDebrid || ""}
            onChange={(e) => handleApiKeyChange("realDebrid", e.target.value)}
            placeholder="Enter Real-Debrid API Key"
          />
        </label>
      </div>

      {/*
      <div>
        <label>
          AllDebrid API Key:
          <input
            type="text"
            value={apiKeys.allDebrid || ''}
            onChange={(e) => handleApiKeyChange('allDebrid', e.target.value)}
            placeholder="Enter AllDebrid API Key"
          />
        </label>
      </div>
      */}

      <button onClick={saveApiKeys}>Save API Keys</button>
      <br />
      <button onClick={navigateToMain}>Back to Main Page</button>
      <p>{statusMessage}</p>
    </div>
  );
};

// Popup component that manages the views
const Popup = () => {
  const [isConfigPage, setIsConfigPage] = useState(false);

  const navigateToConfig = () => setIsConfigPage(true);
  const navigateToMain = () => setIsConfigPage(false);

  return (
    <div>
      {isConfigPage ? (
        <ConfigPage navigateToMain={navigateToMain} />
      ) : (
        <MainPage navigateToConfig={navigateToConfig} />
      )}
    </div>
  );
};

createRoot(document.getElementById("popup") as HTMLElement).render(<Popup />);
