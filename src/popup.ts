document.addEventListener('DOMContentLoaded', async () => {
  const { realDebridApiKey } = await browser.storage.local.get('realDebridApiKey');
  if (realDebridApiKey) {
    (document.getElementById('apiKey') as HTMLInputElement).value = realDebridApiKey;
  }

  function displayDownloadLinks(links: { [filename: string]: string }) {
    const linksContainer = document.getElementById("linksContainer");
    if (linksContainer) {
      linksContainer.innerHTML = ""; // clear previous links

      for (const filename in links) {
        if (links.hasOwnProperty(filename)) {
          const linkElement = document.createElement("a");
          linkElement.href = links[filename];
          linkElement.textContent = filename;
          linkElement.target = "_blank"; // Open in new tab
          linksContainer.appendChild(linkElement);
          linksContainer.appendChild(document.createElement("br")); // Line break
        }

      }
    }
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "displayDownloadLinks") {
      displayDownloadLinks(message.links);
    } else if (message.action === "displayError") {
      displayError(message.error);
    }
  });
});

document.getElementById('searchHash')?.addEventListener('click', () => {
  console.log('button clicked');
  // Send a message to the background script to search for hash
  browser.runtime.sendMessage({action: 'searchForHash'});
});

document.getElementById('saveApiKey')?.addEventListener('click', () => {
  const apiKey = (document.getElementById('apiKey') as HTMLInputElement).value;
  if (apiKey) {
    browser.storage.local
      .set({realDebridApiKey: apiKey})
      .then(() => {
        alert('API Key saved successfully!');
      })
      .catch(error => {
        console.error('Error saving API Key:', error);
      });
  }
});

function displayError(error: string) {
  const linksContainer = document.getElementById("linksContainer");
  if (linksContainer) {
    linksContainer.innerHTML = `<p style="color:red;">${error}</p>`;
  }
}