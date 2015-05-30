'use strict';

$(document).ready(function() {

        Array.prototype.unique = function() {
            return this.reduce(function(accum, current) {
                if (accum.indexOf(current) < 0) {
                    accum.push(current);
                }
                return accum;
            }, []);
        };

		function initialize(){
			// 1. Get text from document && separate it into an array
			var bodyText = document.body.textContent.split(/\s+/).filter(function(part) {
                   return part.length > 4 && part.length < 255 && part.indexOf('@') > 1; 
               });
			// 2. filter bodyText by length
			//var filtered1 = filterByLength(bodyText, 5);
			// 3. filter bodyText array to only have possible email addresses
			var filtered2 = filterByPossibleEmailAddress(bodyText);
			// 4. use a more advanced filter to filter out invalid emails. 
			var filtered3 = filterByAdvancedEmailRegex(filtered2);
			// 5. shorten each string in the array to only the characters after the @ symbol
			var filtered4 = grabDomainFromEmail(filtered3);
            // 6. Add current tab to top of list
            var filtered5 = addCurrentTab(filtered4);
			// 7. validate the domains
			var filtered6 = filterByDomain(filtered5);
			// 8. make sure that all the remaining valuse are unique
			var filtered7 = filtered6.unique();


			sendResponse(filtered7);
		}

        // function filterByLength(array, length){
        // 	return array.filter(function(text){
        // 		return text.length > length; // 2@a.us
        // 	});
        // }

        function filterByPossibleEmailAddress(array) {
        	return array.filter(function(text){
        		return text.indexOf('@') >= 0 && text.indexOf('.') >= 0;
        		
        		// return (text.match(/@/) && text.match(/@/g).length == 1) && (text.match(/\./) && text.match(/\./g).length < 4);
        		// return /.*@.*\./.test(text);
        	});
        }
        function filterByAdvancedEmailRegex(array){
			var regex = /\b\w[!#-'*+\/-9=?^-~-]*(?:\.[!#-'*+\/-9=?^-~-]+)*@[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+(?:[-.][a-z0-9]+)*\b/ig;
        	return array.filter(function(text){
        		return regex.test(text);
        	});
        }
        function grabDomainFromEmail(array){
        	var atIndex;
        	return array.map(function(string){
        		atIndex = string.indexOf('@');
        		return string.slice(atIndex+1, string.length);
        	});
        }
        function filterByDomain(array) {
			var regex = /([^.\n]+\.[a-zA-Z]{2,3}\b)/gi;
        	return array.filter(function(text){
        		return regex.test(text);
        	});
        }
        function addCurrentTab(array) {
            var currentTab = window.location.hostname;
            currentTab = currentTab.replace('www.','');
            array.unshift(currentTab);
            return array;
        }
        function sendResponse(array) {

        	if (array.length > 0) { // If there are domains on the page


        	    array = array.unique(); // Make sure we don't get any duplicates

        	    chrome.runtime.sendMessage({method: 'setDomains', domains: array }, function(response) {
        	        console.log(response.response);
        	    });

        	} else {
        	    chrome.runtime.sendMessage({method: 'setDomains', domains: [] }, function(response) {
        	        console.log(response.response);
        	    });
        	}
        }

        initialize();
});