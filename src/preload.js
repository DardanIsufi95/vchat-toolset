// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { ipcRenderer, contextBridge } = require('electron');

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
	invoke(apiKey, ...args) {
		return ipcRenderer.invoke(apiKey, ...args);
	},
	on(channel, listener) {
		const validChannels = ['stopLoading'];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, listener);
		}
	},
});
