'use strict';

var domain_extensions, popup, ch_request, ch_sender, ch_sendResponse;

var setBadge = function(text) {
	text = text.toString();
	chrome.browserAction.setBadgeText({text: text});
	chrome.browserAction.setBadgeBackgroundColor({color:[0, 200, 0, 255]});
}
var clearBadge = function() {
	chrome.browserAction.setBadgeText({text: '0'});
	chrome.browserAction.setBadgeBackgroundColor({color:[200, 0, 0, 255]});
}

var setIcon = function(icon) {

	var path;

	switch (icon) {
		case 'active':
			path = '../images/icon_16.png';
		break;

		case 'gray':
			path = '../images/icon_16_gray.png';
		break;
	}

	chrome.browserAction.setIcon({ path: path });
}

var loadExt = function(message, tab) {
	console.log(tab ?
	            "from a content script:" + tab.url :
	            "from the extension");
	var domains = message.domains;
	var count = domains.length.toString();
	if (count>0) {
		setBadge(count);
		setIcon('active');
		domain_extensions = domains;
	} else {
		clearBadge();
		setIcon('gray');
		domain_extensions = [];
	}
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {

    if(message.method == 'getDomains') {
        sendResponse(domain_extensions);
    } else if (message.method == 'setDomains') {
    	loadExt(message, sender.tab);
    }
});

chrome.tabs.onActivated.addListener(
	function(obj) {
		chrome.tabs.executeScript(obj.tabId, { file: 'scripts/jquery.min.js' }, function() {
			chrome.tabs.executeScript(obj.tabId, { file: 'scripts/contentscript.js'});
		});
});

chrome.tabs.onUpdated.addListener(
	function(obj) {
		chrome.tabs.executeScript(obj.tabId, { file: 'scripts/jquery.min.js' }, function() {
			chrome.tabs.executeScript(obj.tabId, { file: 'scripts/contentscript.js'});
		});
});

chrome.runtime.onInstalled.addListener(function (details) {
	var currentTab;
	chrome.tabs.query({}, function(tabs) {
		currentTab = tabs[0];
		console.log(currentTab);
		chrome.tabs.executeScript(currentTab.id, { file: 'scripts/jquery.min.js' }, function() {
			chrome.tabs.executeScript(currentTab.id, { file: 'scripts/contentscript.js'});
		});
	});
});