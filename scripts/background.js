'use strict';

var domainExtensions;

var setIcon = function setIcon(icon) {

  var path;

  switch (icon) {
    case 'ok':
      path = '../images/icon_16.png';
      break;

    case 'warn':
      path = '../images/icon_maybe_16.png';
      break;

    case 'error':
      path = '../images/icon_error_16.png';
      break;
  }

  chrome.browserAction.setIcon({ path: path });
};

var loadScripts = function loadScripts(obj) {
  chrome.tabs.executeScript(obj.tabId, { file: 'scripts/jquery.min.js' }, function () {
    chrome.tabs.executeScript(obj.tabId, { file: 'scripts/require.min.js' }, function () {
      chrome.tabs.executeScript(obj.tabId, { file: 'scripts/contentscript.js' });
    });
  });
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  if (message.method === 'setIcon' && message.icon) {
    setIcon(message.icon);
    sendResponse(true);
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