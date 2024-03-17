const fs = require('fs');

function getChromeLocation() {
	let executablePath = null;

	try {
		if (!executablePath && fs.existsSync(`${process.env['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe`)) {
			executablePath = `${process.env['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe`;
		}

		if (!executablePath && fs.existsSync(`${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`)) {
			executablePath = `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`;
		}

		if (!executablePath && fs.existsSync(`${process.env['TMP'].replace('\\Temp', '')}\\Google\\Chrome\\Application\\chrome.exe`)) {
			executablePath = `${process.env['TMP'].replace('\\Temp', '')}\\Google\\Chrome\\Application\\chrome.exe`;
		}
	} catch (e) {
		console.log('Error', e);
	}

	return executablePath;
}

module.exports = {
	getChromeLocation,
};
