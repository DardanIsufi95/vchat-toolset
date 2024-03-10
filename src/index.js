const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}
const { updateElectronApp } = require('update-electron-app');
updateElectronApp(); // additional configuration options available

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, 'index.html'));

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

const puppeteer = require('puppeteer-core');
let browser = null;

let executablePath = null;

if (!executablePath && fs.existsSync(`${process.env['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe`)) {
	executablePath = `${process.env['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe`;
}

if (!executablePath && fs.existsSync(`${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`)) {
	executablePath = `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`;
}
console.log(process.env);
if (!executablePath && fs.existsSync(`${process.env['TMP'].replace('\\Temp', '')}\\Google\\Chrome\\Application\\chrome.exe`)) {
	executablePath = `${process.env['TMP'].replace('\\Temp', '')}\\Google\\Chrome\\Application\\chrome.exe`;
}

if (!executablePath) {
	console.log('Chrome not found');
	app.quit();
}

ipcMain.handle('start', async (event, arg) => {
	if (!browser) {
		browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
			args: ['--start-maximized'],
			executablePath: executablePath,
		});
	}

	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', (interceptedRequest) => {
		if (interceptedRequest.isInterceptResolutionHandled()) return;
		if (interceptedRequest.url().endsWith('oauth/token') && interceptedRequest.method() === 'POST') {
			const postData = interceptedRequest.postData();
			const data = postData ? JSON.parse(postData) : {};

			if (data.grant_type != 'password') {
				interceptedRequest.continue();
				return;
			}

			if (data.username.replace('@vchat.com', '') != 'dardan' || data.password != 'test') {
				interceptedRequest.continue();
				return;
			}

			try {
				interceptedRequest.continue({
					postData: JSON.stringify({
						...data,
						username: 'Liebes-Traum@impact-ebs.com',
						password: 'Dardan28%',
					}),
				});
			} catch (e) {
				console.log('error', e);
			}
		} else {
			interceptedRequest.continue();
		}
	});
	await page.goto('https://livecreator.com/');
});

app.on('before-quit', () => {
	if (browser) browser.close();
});
