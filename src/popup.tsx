// src/popup.tsx
import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

// Main page component
const MainPage = ({ navigateToConfig }: { navigateToConfig: () => void }) => {
  const [downloadLinks, setDownloadLinks] = useState<{ [p: string]: string }>(
    {},
  );

  const handleDownloadLinksReceived = useCallback((message: any) => {
    if (message.action === "displayDownloadLinks") {
      setDownloadLinks(message.links);
    }
  }, []);

  useEffect(() => {
    browser.runtime.onMessage.addListener(handleDownloadLinksReceived);
    return () =>
      browser.runtime.onMessage.removeListener(handleDownloadLinksReceived);
  }, [handleDownloadLinksReceived]);

  const searchForHash = () => {
    // Send a message to background to search for a hash
    browser.runtime.sendMessage({ action: "searchForHash" });
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Main Page</h2>
      <button onClick={searchForHash}>Search for Hash</button>
      <br />
      <button onClick={navigateToConfig}>Configure</button>

      {Object.keys(downloadLinks).length > 0 && (
        <div>
          <h3>Download Links</h3>
          <ul>
            {Object.keys(downloadLinks).map((key) => (
              <li key={key}>
                <a
                  href={downloadLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Configuration page component
const ConfigPage = ({ navigateToMain }: { navigateToMain: () => void }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    // Load the stored API key when the config page loads
    browser.storage.local.get("realDebridApiKey").then((result) => {
      if (result.realDebridApiKey) {
        setApiKey(result.realDebridApiKey);
      }
    });
  }, []);

  const saveApiKey = () => {
    browser.storage.local.set({ realDebridApiKey: apiKey }).then(() => {
      setStatusMessage("API Key saved!");
    });
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Configure API Key</h2>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter Real-Debrid API Key"
      />
      <button onClick={saveApiKey}>Save API Key</button>
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
