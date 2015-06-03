'use strict';

var domainExtensions;

var setBadge = function setBadge(text) {
	text = text.toString();
	chrome.browserAction.setBadgeText({ text: text });
	chrome.browserAction.setIcon({ path: 'images/icon_16.png' });
	chrome.browserAction.setBadgeBackgroundColor({ color: [0, 200, 0, 255] });
};
var clearBadge = function clearBadge() {
	chrome.browserAction.setBadgeText({ text: '' });
	chrome.browserAction.setIcon({ path: 'images/icon_error_16.png' });
	chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] });
};

var setIcon = function setIcon(icon) {

	var path;

	switch (icon) {
		case 'active':
			path = '../images/icon_16.png';
			break;

		case 'error':
			path = '../images/icon_error_16.png';
			break;
	}

	chrome.browserAction.setIcon({ path: path });
};

var loadExt = function loadExt(message, tab) {
	console.log(tab ? 'from a content script:' + tab.url : 'from the extension');
	var domains = message.domains;
	var count = domains.length.toString();
	if (count > 0) {
		setBadge(count);
		setIcon('active');
		domainExtensions = domains;
	} else {
		clearBadge();
		setIcon('gray');
		domainExtensions = [];
	}
};

var loadScripts = function loadScripts(obj) {
	chrome.tabs.executeScript(obj.tabId, { file: 'scripts/jquery.min.js' }, function () {
		chrome.tabs.executeScript(obj.tabId, { file: 'scripts/require.min.js' }, function () {
			chrome.tabs.executeScript(obj.tabId, { file: 'scripts/contentscript.js' });
		});
	});
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

	if (message.method === 'getDomains') {
		sendResponse(domainExtensions);
	} else if (message.method === 'setDomains') {
		loadExt(message, sender.tab);
	}
});

chrome.tabs.onActivated.addListener(function (obj) {
	chrome.tabs.executeScript(obj.tabId, { file: 'scripts/jquery.min.js' }, function () {
		chrome.tabs.executeScript(obj.tabId, { file: 'scripts/contentscript.js' });
	});
});

chrome.tabs.onUpdated.addListener(function (obj) {
	chrome.tabs.executeScript(obj.tabId, { file: 'scripts/jquery.min.js' }, function () {
		chrome.tabs.executeScript(obj.tabId, { file: 'scripts/contentscript.js' });
	});
});

chrome.runtime.onInstalled.addListener(function (details) {
	var currentTab;
	chrome.tabs.query({}, function (tabs) {
		currentTab = tabs[0];
		console.log(currentTab);
		loadScripts(obj);
	});
});
//# sourceMappingURL=/Users/chris/Documents/Projects/NUVI/chrome-extensions/salesforce/app/scripts/background.js.map