const { app, BrowserWindow, ipcMain, Menu, autoUpdater } = require('electron');
const { updateElectronApp, UpdateSourceType } = require('update-electron-app');
const path = require('path');
const fs = require('fs');

updateElectronApp({
	updateSource: {
		type: UpdateSourceType.StaticStorage,
		baseUrl: `https://toolset.v-chat-app.com/${process.platform}/${process.arch}`,
	},
});
const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 400,
		height: 400,
		center: true,
		title: 'VChat Toolset 1.1.12',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});
	Menu.setApplicationMenu(null);
	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, 'index.html'));

	setTimeout(() => {
		mainWindow.webContents.send('stopLoading');
	}, 1000 * 5);
	// Open the DevTools.
	//mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
require('./main');
