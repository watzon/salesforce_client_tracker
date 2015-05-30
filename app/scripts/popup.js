'use strict';

$(document).ready(function() {
	list.empty();
});

chrome.runtime.sendMessage({method:'getDomains'}, function(response){
	var list = $('.list-wrapper ul');
	list.empty();

	if (response.length !== 0) {
		$.each(response, function(i, v) {
			list.append('<li><a href="http://'+ v +'">'+ v +'</a></li>')
		});
	} else {
		list.append('<h1>No addresses on page</h1>')
	}
});
