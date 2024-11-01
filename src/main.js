const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const puppeteer = require('puppeteer-core');
const crypto = require('crypto');
const { getChromeLocation } = require('./utils');
const os = require('os');
const path = require('path');
let browser = null;

require('./squirrel');

const executablePath = getChromeLocation();
if (!executablePath) {
	console.log('Chrome not found');
	app.quit();
}

ipcMain.handle('get-version', async (event, arg) => {
	console.log('get-version', app.getVersion());
	return app.getVersion();
});
console.log();
ipcMain.handle('start', async (event, arg) => {
	console.log('start', arg);
	if (!browser) {
		const userInfo = os.userInfo();
		const username = userInfo.username;
		//const chromeUserDataPath = path.join('C:\\', 'Users', username, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
		const chromeUserDataPath = path.join('.', 'userdata');
		//console.log('defaultArgs', puppeteer.defaultArgs());
		browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
			args: ['--start-maximized', '--disable-infobars'],
			executablePath: executablePath,
			userDataDir: chromeUserDataPath,
			ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
		});
		browser.on('disconnected', () => {
			browser = null;
		});
	}
	if (arg === 'livecreator') {
		startLivecreator(browser);
	}
	if (arg === 'cam-amateurcommunity') {
		startCamAmateurCommunity(browser);
	}
	// const page = await browser.newPage();
	// await page.setRequestInterception(true);
	// page.on('request', async (interceptedRequest) => {
	// 	if (interceptedRequest.isInterceptResolutionHandled()) return;
	// 	if (interceptedRequest.url().endsWith('oauth/token') && interceptedRequest.method() === 'DELETE') {
	// 		page.close();
	// 		return;
	// 	}
	// 	if (interceptedRequest.url().endsWith('oauth/token') && interceptedRequest.method() === 'POST') {
	// 		const postDataRaw = interceptedRequest.postData();
	// 		const postData = postDataRaw ? JSON.parse(postDataRaw) : {};

	// 		if (postData.grant_type != 'password') {
	// 			interceptedRequest.continue();
	// 			return;
	// 		}

	// 		const auth = await fetch('https://api.v-chat-app.com/api/v1/auth/token', {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 			body: JSON.stringify({
	// 				grant_type: 'password',
	// 				username: postData.username.replace('@vchat.com', ''),
	// 				password: postData.password,
	// 			}),
	// 		})
	// 			.then((response) => {
	// 				if (response.ok) {
	// 					return response.json();
	// 				}
	// 				throw new Error('Network response was not ok.');
	// 			})
	// 			.catch((error) => {
	// 				return null;
	// 			});

	// 		if (!auth || !auth.access_token) {
	// 			interceptedRequest.continue();
	// 			return;
	// 		}
	// 		page.access_token = auth.access_token;
	// 		const credentials = await fetch('https://api.v-chat-app.com/api/v1/external/credentials', {
	// 			headers: {
	// 				Authorization: `Bearer ${auth.access_token}`,
	// 			},
	// 		})
	// 			.then((response) => {
	// 				if (response.ok) {
	// 					return response.json();
	// 				}
	// 				//console.log('Network response was not ok.', response);
	// 				throw new Error('Network response was not ok.');
	// 			})
	// 			.catch((error) => {
	// 				console.log('error', error);
	// 				return null;
	// 			});

	// 		console.log('credentials', credentials);

	// 		if (!credentials) {
	// 			interceptedRequest.continue();
	// 			return;
	// 		}

	// 		// if (postData.username.replace('@vchat.com', '') != 'dardan' || postData.password != 'test') {
	// 		// 	interceptedRequest.continue();
	// 		// 	return;
	// 		// }

	// 		try {
	// 			interceptedRequest.continue({
	// 				postData: JSON.stringify({
	// 					...postData,
	// 					username: credentials.email,
	// 					password: credentials.password,
	// 				}),
	// 			});
	// 		} catch (e) {
	// 			console.log('error', e);
	// 		}
	// 	} else {
	// 		interceptedRequest.continue();
	// 	}
	// });
	// page.on('response', async (response) => {
	// 	if (response.url().endsWith('oauth/token') && response.status() === 200) {
	// 		const data = await response.json();
	// 		console.log('response', page.access_token);

	// 		fetch('https://api.v-chat-app.com/api/v1/external/online', {
	// 			method: 'PUT',
	// 			headers: {
	// 				Authorization: `Bearer ${page.access_token}`,
	// 			},
	// 		})
	// 			.then((response) => {
	// 				//console.log('response', response);
	// 			})
	// 			.catch((error) => {
	// 				console.log('error', error);
	// 			});

	// 		page.isAuth = true;
	// 	}

	// 	return response;
	// });
	// await page.goto('https://livecreator.com/');
});

app.on('before-quit', () => {
	if (browser) browser.close();
});

setInterval(() => {
	if (browser) {
		browser.pages().then((pages) => {
			pages.forEach((page) => {
				const host = new URL(page.url()).host;
				const isAuth = page.isAuth;
				const token = page.access_token;

				if (isAuth && token) ping(page);

				console.log('host', host, isAuth, token);
			});
		});
	}
}, 60000);

// async function startLivecreator(browser) {
// 	const pageUrl = 'https://livecreator.com';
// 	const intercept = 'api.livecreator.com';
// 	const page = await browser.newPage();
// 	page.setRequestInterception(true);
// 	page.on('request', async (interceptedRequest) => {
// 		//console.log('request', interceptedRequest.url().includes(pageUrl));
// 		if (interceptedRequest.isInterceptResolutionHandled()) return;
// 		if (interceptedRequest.url().includes(intercept) && interceptedRequest.url().endsWith('oauth/token') && interceptedRequest.method() === 'DELETE') {
// 			page.close();
// 			return;
// 		}
// 		if (interceptedRequest.url().includes(intercept) && interceptedRequest.url().endsWith('oauth/token') && interceptedRequest.method() === 'POST') {
// 			const postDataRaw = interceptedRequest.postData();
// 			const postData = postDataRaw ? JSON.parse(postDataRaw) : {};
// 			//console.log('postData', postData, interceptedRequest.url().includes(pageUrl), interceptedRequest.url());
// 			if (postData.grant_type != 'password') {
// 				interceptedRequest.continue();
// 				return;
// 			}
// 			//console.log('postData', postData);
// 			const { access_token, credentials } = await getTokenAndCredentials({ username: postData.username.replace('@vchat.com', ''), password: postData.password });
// 			//console.log('access_token', access_token, credentials);
// 			if (!access_token || !credentials) {
// 				interceptedRequest.continue();
// 				return;
// 			}
// 			//console.log('access_token', access_token, credentials);
// 			page.access_token = access_token;

// 			try {
// 				interceptedRequest.continue({
// 					postData: JSON.stringify({
// 						...postData,
// 						username: credentials.email,
// 						password: credentials.password,
// 					}),
// 				});

// 				return;
// 			} catch (e) {
// 				console.log('error', e);
// 			}
// 		}
// 		interceptedRequest.continue();
// 	});
// 	page.on('response', async (response) => {
// 		if (response.url().includes(intercept) && response.url().endsWith('oauth/token') && response.status() === 200 && page.access_token) {
// 			setOnline({ access_token: page.access_token });
// 			page.isAuth = true;
// 		}

// 		if (response.url().includes(intercept) && response.url().endsWith('message') && response.status() === 200) {
// 			const data = await response.json();
// 			console.log('message', JSON.stringify(data));
// 			fetch('https://api.v-chat-app.com/api/v1/external/message', {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					Authorization: `Bearer ${page.access_token}`,
// 				},
// 				body: JSON.stringify(data),
// 			});
// 		}

// 		return response;
// 	});

// 	await page.goto(pageUrl);
// }

JSON.tryParse = (str) => {
	try {
		return JSON.parse(str);
	} catch (e) {
		return null;
	}
};
async function startLivecreator(browser) {
	const pageUrl = 'https://livecreator.com';
	const apiIntercept = 'api.livecreator.com';
	const page = (await browser.pages())[0];

	// Enable request interception
	page.setRequestInterception(true);

	page.on('request', async (interceptedRequest) => {
		try {
			const requestUrl = interceptedRequest.url();

			if (!requestUrl.includes(apiIntercept)) {
				interceptedRequest.continue();
				return;
			}

			const isPost = interceptedRequest.method() === 'POST';

			if (!isPost) {
				interceptedRequest.continue();
				return;
			}

			const isAuthToken = requestUrl.includes(apiIntercept) && requestUrl.endsWith('oauth/token');
			const isMessage = requestUrl.includes(apiIntercept) && requestUrl.endsWith('message');
			const postDataRaw = isPost && interceptedRequest.postData();
			const postData = postDataRaw ? JSON.tryParse(postDataRaw) : {};

			// Handle POST request to oauth/token
			if (isAuthToken && isPost) {
				// Only intercept when grant_type is 'password'
				if (postData.grant_type !== 'password') {
					interceptedRequest.continue();
					return;
				}

				// Try to fetch token and credentials using provided username and password
				try {
					const result = await getTokenAndCredentials({
						username: postData.username.replace('@vchat.com', ''),
						password: postData.password,
					}).catch((error) => {
						console.error('Error fetching token and credentials:', error);
						return null;
					});

					// Validate result structure
					if (!result || typeof result !== 'object' || !result.access_token || !result.credentials) {
						console.error('Malformed result from getTokenAndCredentials:', result);
						interceptedRequest.continue(); // Continue the request if the result is invalid
						return;
					}

					const { access_token, credentials } = result;
					page.access_token = access_token;

					// Modify and continue the intercepted request
					interceptedRequest.continue({
						postData: JSON.stringify({
							...postData,
							username: credentials.email,
							password: credentials.password,
						}),
					});
				} catch (error) {
					// Log the error and continue the original request without modifying
					console.error('Error fetching token and credentials:', error);
					interceptedRequest.continue();
				}

				return;
			}

			if (isMessage && isPost && postData?.body) {
				console.log('message intercepted');
				const checkMsg = await fetch('https://only-chat.net/checkmsg.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ msg: postData?.body }),
				})
					.then((response) => response.text())
					.then((data) => {
						console.log(data);
						return JSON.parse(data?.trim());
					})
					.catch((error) => {
						checkMsg.isAllow = true;
					});

				if (!checkMsg?.isAllow) {
					page.evaluate((checkMsg) => {
						alert(checkMsg?.ErrorMsg);
					}, checkMsg);
					interceptedRequest.abort();
					return;
				}
			}

			// Continue with the original request if no conditions match
			interceptedRequest.continue();
		} catch (err) {
			console.error('Error in request interception:', err);
			interceptedRequest.continue();
		}
	});

	page.on('response', async (response) => {
		try {
			//console.log('response', response);
			const responseUrl = response.url();
			const isAuthToken = responseUrl.includes(apiIntercept) && responseUrl.endsWith('oauth/token');
			const isMessage = responseUrl.includes(apiIntercept) && responseUrl.endsWith('message');
			const isDelete = response.request().method() === 'DELETE';

			// Store access token on successful oauth/token response
			if (isAuthToken && response.status() === 200 && page.access_token) {
				setOnline({ access_token: page.access_token });
				page.isAuth = true;
			}

			//console.log('response', responseUrl, response.request().method(), response.status());
			// Close the page if a DELETE request is made to the oauth token endpoint
			if (isAuthToken && isDelete) {
				console.log('Closing page due to DELETE request to oauth/token');
				await page.close();
				await browser.close();
				app.quit();
				return;
			}

			// Forward message response to external API
			if (isMessage && response.status() === 200) {
				const data = await response.json();
				await fetch('https://api.v-chat-app.com/api/v1/external/message', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${page.access_token}`,
					},
					body: JSON.stringify(data),
				});
			}
		} catch (err) {
			console.error('Error in response handling:', err);
		}
	});

	page.on('close', async () => {
		await browser.close();
		app.quit();
	});

	await page.goto(pageUrl);
}

async function startCamAmateurCommunity(browser) {
	const pageUrl = 'https://cam.amateurcommunity.com/';
	const interceptLoginHost = 'https://streamapisenderupdate.cqint-cloud.com';
	const page = await browser.newPage();
	page.setRequestInterception(true);
	page.on('request', async (interceptedRequest) => {
		if (interceptedRequest.isInterceptResolutionHandled()) return;
		if (interceptedRequest.url().includes(interceptLoginHost) && interceptedRequest.url().endsWith('logout') && interceptedRequest.method() === 'POST') {
			page.close();
			return;
		}
		if (interceptedRequest.url().includes(interceptLoginHost) && interceptedRequest.url().endsWith('login') && interceptedRequest.method() === 'POST') {
			const postDataRaw = interceptedRequest.postData();
			const postData = postDataRaw ? JSON.parse(postDataRaw) : {};
			const passwordValue = await page.evaluate(() => {
				// Replace 'input#yourInputId' with the correct selector for your input
				const inputElement = document.querySelector('input#password');
				return inputElement ? inputElement.value : null;
			});
			console.log('password', passwordValue);
			const { access_token, credentials } = await getTokenAndCredentials({ username: postData.sendername, password: passwordValue });

			if (!access_token || !credentials) {
				interceptedRequest.continue();
				return;
			}
			//51ca0a50db951e7878d6c4c37723bca6f1fb973a
			//51ca0a50db951e7878d6c4c37723bca6f1fb973a
			page.access_token = access_token;
			console.log('access_token', access_token, credentials, crypto.createHash('sha1').update(credentials.password).digest('hex'));
			try {
				interceptedRequest.continue({
					postData: JSON.stringify({
						...postData,
						sendername: credentials.username,
						password: credentials.passwordHash,
					}),
				});

				return;
			} catch (e) {
				console.log('error', e);
			}
		}

		interceptedRequest.continue();
	});

	page.on('response', async (response) => {
		if (response.url().includes(interceptLoginHost) && response.url().endsWith('login') && response.status() === 200 && page.access_token) {
			setOnline({ access_token: page.access_token });
			page.isAuth = true;
		}

		return response;
	});
	page.goto(pageUrl);
}

async function getTokenAndCredentials({ username, password }) {
	const auth = await fetch('https://api.v-chat-app.com/api/v1/auth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			grant_type: 'password',
			username: username,
			password: password,
		}),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Network response was not ok.');
		})
		.catch((error) => {
			console.log('error', error);
			return null;
		});
	console.log('auth', auth);
	if (!auth || !auth.access_token) {
		return;
	}

	const credentials = await fetch('https://api.v-chat-app.com/api/v1/external/credentials', {
		headers: {
			Authorization: `Bearer ${auth.access_token}`,
		},
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}

			throw new Error('Network response was not ok.');
		})
		.catch((error) => {
			return null;
		});

	if (!credentials) {
		return;
	}

	return {
		access_token: auth.access_token,
		credentials,
	};
}
async function setOnline({ access_token }) {
	fetch('https://api.v-chat-app.com/api/v1/external/online', {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	})
		.then((response) => {
			//console.log('response', response);
		})
		.catch((error) => {
			console.log('error', error);
		});
}
async function ping({ access_token }) {
	fetch('https://api.v-chat-app.com/api/v1/external/ping', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	})
		.then((response) => {
			//console.log('response', response);
		})
		.catch((error) => {
			console.log('error', error);
		});
}
