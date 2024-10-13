import browser from "webextension-polyfill";
import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import { createRoot } from "react-dom/client";
import {
  ApiKeys,
  ProviderResponse,
  ProviderResults,
} from "./providers/provider-misc";

// Main page component
const MainPage = ({ navigateToConfig }: { navigateToConfig: () => void }) => {
  const [links, setLinks] = useState<ProviderResults>({});
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMessageReceived = useCallback((message: any) => {
    if (message.action !== undefined) console.log(message);
    if (message.action === "displayError") {
      setError(message.error);
      setLoading(false);
    } else if (message.action === "displayLinks") {
      setLinks(message.links);
      saveLinksToStorage(message.links);
      setError(null);
      setLoading(false);
    }
    return true;
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
    const result = (await browser.storage.local.get("links")) as {
      links?: ProviderResults;
    };
    if (result.links) {
      setLinks(result.links);
    }
  };

  const clearLinks = () => {
    setLinks({});
    browser.storage.local.remove("links");
  };

  const searchForHash = () => {
    clearLinks();
    setLoading(true);
    browser.runtime.sendMessage({ action: "searchForHash" });
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>PINT 🍺</h2>
      <button onClick={searchForHash}>Fetch file(s)</button>
      <br />
      <button onClick={navigateToConfig}>Configure</button>

      {loading && <p className="loading">Loading...</p>}

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
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    realDebrid: "",
    // not yet implemented:
    // allDebrid: "",
  });
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    // Load the stored API keys when the config page loads
    browser.storage.local.get("apiKeys").then((result) => {
      if (result.apiKeys) {
        setApiKeys(result.apiKeys as ApiKeys);
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
