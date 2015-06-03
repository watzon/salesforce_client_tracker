'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Popup = (function () {
	function Popup() {
		_classCallCheck(this, Popup);

		// For global variables we're prefixing with an underscore
		var _sites = ['nuvi.com'];
		var _sampleData = undefined;

		// 1. Get list of sites from contentscript.js and assign it to the variable siteStore
		this.getSiteList(_sites);
		// 2. Get data from salesforce
		this.requestJSON('../sample_data.json', { sites: _sites }, function (data) {
			_sampleData = JSON.parse(data);
		});
		// 3. Check how many sites are in the array and return the appropriate template
		this.checkTemplate(_sampleData);
	}

	_createClass(Popup, [{
		key: 'getSiteList',
		value: function getSiteList(sites) {

			chrome.runtime.sendMessage({ from: 'popup', method: 'getDomains' }, function (response) {
				sites = response;
			});
		}
	}, {
		key: 'requestJSON',
		value: function requestJSON(url, data, callback) {
			$.ajax({
				method: 'POST',
				url: url,
				data: data,
				cache: false,
				processData: false,
				async: false
			}).done(function (data) {
				callback(data);
			});
		}
	}, {
		key: 'moreThanOne',
		value: function moreThanOne(array) {
			var length = array.length;
			return length > 1 ? true : false;
		}
	}, {
		key: 'checkTemplate',
		value: function checkTemplate(array) {
			if (this.moreThanOne(array)) {
				this.renderTemplate('list', array);
			} else {
				this.renderTemplate('single', array);
			}
		}
	}, {
		key: 'renderTemplate',
		value: function renderTemplate(template, data) {
			var templatePath = chrome.extension.getURL('templates/' + template + '.html');

			if (template === 'list') {

				var number = data.length;
				var listHtml = '';
				var that = this;

				for (var i = 0; i < data.length; i++) {

					var businessName = data[i].businessName;
					var statusIcon = this.checkOk(data[i]) === true ? 'safe' : 'unsafe';
					var salesforceLink = data[i].salesforceLink;

					listHtml += '<li class="' + statusIcon + '-to-contact"><a class="linkToSalesforce" href="' + salesforceLink + '">' + businessName + '</a></li>';
				}

				$.get(templatePath, function (listTemplate) {
					listTemplate = listTemplate.replace('{{number}}', number);
					listTemplate = listTemplate.replace('{{list}}', listHtml);
					that.buildList(data, listTemplate);
				});
			} else if (template === 'single') {
				var statusText = this.checkOk(data[0]) === true ? 'OK TO CONTACT' : 'DO NOT CONTACT';
				var statusIcon = this.checkOk(data[0]) === true ? 'success' : 'error';

				$.get(templatePath, function (singleTemplate) {
					singleTemplate = singleTemplate.replace('{{businessName}}', data[0].businessName);
					singleTemplate = singleTemplate.replace('{{salesforceLink}}', data[0].salesforceLink);
					singleTemplate = singleTemplate.replace('{{statusIcon}}', statusIcon);
					singleTemplate = singleTemplate.replace('{{statusText}}', statusText);
					that.buildList(data[0], singleTemplate);
				});
			}
		}
	}, {
		key: 'checkOk',
		value: function checkOk(data) {
			var exists = data.onSalesforce;
			var contacted = data.contactedRecently;
			var client = data.client;

			if (exists && !contacted && !client) {
				return true;
			} else {
				return false;
			}
		}
	}, {
		key: 'buildList',
		value: function buildList(data, template) {
			var listTempPath = 'templates/listTemp.html';
			var safeClass = 'safe-to-contact';
			var unsafeClass = 'unsafe-to-contact';

			var existsStatusClass = data.onSalesforce === true ? safeClass : unsafeClass;
			var contactedRecentlyClass = data.contactedRecently === false ? safeClass : unsafeClass;
			var clientClass = data.client === false ? safeClass : unsafeClass;

			var existsStatusText = data.onSalesforce === true ? 'Exists on Salesforce' : 'Does not exist on Salesforce';
			var contactedRecentlyText = data.contactedRecently === true ? 'Fewer than 30 days since last contact' : 'More than 30 days since last contact';
			var clientText = data.client === true ? 'Already a client' : 'Not a client yet';

			$.ajax({
				url: listTempPath,
				type: 'get',
				dataType: 'html',
				async: true,
				success: function success(listTemplate) {
					listTemplate = listTemplate.replace('{{existsStatusClass}}', existsStatusClass);
					listTemplate = listTemplate.replace('{{contactedRecentlyClass}}', contactedRecentlyClass);
					listTemplate = listTemplate.replace('{{clientClass}}', clientClass);

					listTemplate = listTemplate.replace('{{existsStatus}}', existsStatusText);
					listTemplate = listTemplate.replace('{{contactedRecentlyStatus}}', contactedRecentlyText);
					listTemplate = listTemplate.replace('{{clientStatus}}', clientText);

					template = template.replace('{{statusList}}', listTemplate);

					$('.wrapper').html(template);
				}
			});
		}
	}]);

	return Popup;
})();

$(document).ready(function () {

	var popup = new Popup();
	popup.constructor();

	$('body').on('click', '.linkToSalesforce', function (e) {
		e.preventDefault();
		var data = _sampleData;

		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { from: 'popup', salesforceLink: data.salesforceLink });
		});
	});
});
//# sourceMappingURL=/Users/chris/Documents/Projects/NUVI/chrome-extensions/salesforce/app/scripts/popup.js.map