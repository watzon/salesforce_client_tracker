'use strict';

function initialize() {
  listener();
}

function listener() {
  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if (message.to === 'contentscript') {
        if (message.method === 'setIcon' && message.icon) {
          setIcon(message.icon);
          sendResponse(true);
        }
      }

    });
}

$(document).ready(function() {

  initialize();

});
