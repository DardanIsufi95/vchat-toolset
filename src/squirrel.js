const { app } = require('electron');
const path = require('path');
const childProcess = require('child_process');

if (require('electron-squirrel-startup')) {
	app.quit();
}

const appFolder = path.resolve(process.execPath, '..');
const rootAtomFolder = path.resolve(appFolder, '..');
const updateDotExe = path.resolve(rootAtomFolder, 'Update.exe');
const exeName = path.basename(process.execPath);

function spawn(command, args) {
	let spawnedProcess, error;

	try {
		spawnedProcess = childProcess.spawn(command, args, { detached: true });
	} catch (error) {}

	return spawnedProcess;
}

function spawnUpdate(args) {
	return spawn(updateDotExe, args);
}

function createShortcut() {
	spawnUpdate(['--createShortcut', exeName]);
}

function removeShortcut() {
	spawnUpdate(['--removeShortcut', exeName]);
}

switch (process.argv[1]) {
	case '--squirrel-install':
		createShortcut();
		setTimeout(app.quit, 1000);
		break;

	case '--squirrel-uninstall':
		removeShortcut();
		setTimeout(app.quit, 1000);
		break;

	case '--squirrel-updated':
	case '--squirrel-obsolete':
		app.quit();
		break;
}
