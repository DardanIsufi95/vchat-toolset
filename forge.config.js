require('dotenv').config();
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
	packagerConfig: {
		asar: true,
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'vchat-toolset',
				authors: 'Dardan Isufi',
				description: 'My Electron Application',
				exe: 'vchat-toolset.exe',
				noMsi: true,
				remoteReleases: `https://toolset.v-chat-app.com/${process.platform}/${process.arch}`,
				createDesktopShortcut: true, // Ensure a desktop shortcut is created
				shortcutFolderName: 'VChat Toolset',
			},
		},
		{
			name: '@electron-forge/maker-zip',
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
		{
			name: '@electron-forge/maker-wix',
		},
	],
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'DardanIsufi95',
					name: 'vchat-toolset',
				},
				authToken: process.env.GITHUB_TOKEN,
				generateReleaseNotes: true,
				prerelease: false,
				draft: false,
				force: true,
			},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},

		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
