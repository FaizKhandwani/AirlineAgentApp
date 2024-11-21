const { contextBridge, ipcRenderer } = require('electron');

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openInApp: (url, credentials) => {
    // Send a message to the main process to open the URL in the same window
    ipcRenderer.send('open-url-in-app', { url, credentials });
  },
});
