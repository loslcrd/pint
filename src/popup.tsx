// src/popup.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {createRoot} from "react-dom/client";

// Main page component
const MainPage = ({ navigateToConfig }: { navigateToConfig: () => void }) => {
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);

  useEffect(() => {
    // Listen for messages from the background script containing the download links
    const messageListener = (message: any) => {
      if (message.action === 'displayDownloadLinks') {
        setDownloadLinks(message.links);
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    // Clean up the listener when the component is unmounted
    return () => browser.runtime.onMessage.removeListener(messageListener);
  }, []);

  const searchForHash = () => {
    // Send a message to background to search for a hash
    browser.runtime.sendMessage({ action: 'searchForHash' });
  };

  return (
      <div style={{ padding: '10px' }}>
        <h2>Main Page</h2>
        <button onClick={searchForHash}>Search for Hash</button>
        <br />
        <button onClick={navigateToConfig}>Configure</button>

        {downloadLinks.length > 0 && (
            <div>
              <h3>Download Links</h3>
              <ul>
                {downloadLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
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
  const [apiKey, setApiKey] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    // Load the stored API key when the config page loads
    browser.storage.local.get('realDebridApiKey').then((result) => {
      if (result.realDebridApiKey) {
        setApiKey(result.realDebridApiKey);
      }
    });
  }, []);

  const saveApiKey = () => {
    browser.storage.local.set({ realDebridApiKey: apiKey }).then(() => {
      setStatusMessage('API Key saved!');
    });
  };

  return (
      <div style={{ padding: '10px' }}>
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

createRoot(document.getElementById('popup') as HTMLElement).render(<Popup/>);
