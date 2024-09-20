document.addEventListener('DOMContentLoaded', async () => {
  const { realDebridApiKey } = await browser.storage.local.get('realDebridApiKey');
  if (realDebridApiKey) {
    (document.getElementById('apiKey') as HTMLInputElement).value = realDebridApiKey;
  }
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
