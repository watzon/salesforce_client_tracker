'use strict';

$(document).ready(function() {
	
	var _sites = [];
	var _sampleData = [
		{
			siteUrl: 			'http://nuvi.com',
			businessName:		'NUVI APP',
			onSalesforce:		true,
			contactedRecently:	false,
			client:				false,
			salesforceLink:		'http://salesforce.com/',
			leads:				[
				{
					name: 			'Some Name',
					lead_status:	'contacted', // contacted, contact attempted, disposed
					last_contact:	'date'

				}
			],
			opportunities:		[
				{
					name: 				'Some Name',
					stage_name:			'Closed Won', // Closed Won, Closed Lost, MSA Out, Strategy Session Set, Strategy Session Held
					last_contact:		'date'
				}
			]
		}
		// ,
		// {
		// 	siteUrl: 			'http://facebook.com',
		// 	businessName:		'Facebook INC',
		// 	onSalesforce:		true,
		// 	contactedRecently:	true,
		// 	client:				false,
		// 	salesforceLink:		'http://salesforce.com/'
		// }
	];

	function init() {
		// 1. Get list of sites from contentscript.js and assign it to the variable _sites
		getSiteList();
		// 2. Check how many sites are in the array and return the appropriate template
		checkTemplate(_sampleData, _sampleData);

	}

	function getSiteList() {

		chrome.runtime.sendMessage({method:'getDomains'}, function(response){
			if (response.length !== 0) {
				_sites = response;
				console.log(_sites);
			}
		});

	}

	function moreThanOne(array) {
		var length = array.length;
		return length > 1 ? true : false;
	}

	function checkTemplate(array, data) {
		if (moreThanOne(array)) {
			console.log('moreThanOne')
			renderTemplate('list', data);
		} else {
			renderTemplate('single', data);
		}
	}

	function renderTemplate(template, data) {
		var templatePath = chrome.extension.getURL('templates/'+ template +'.html');

		if (template === 'list') {

			var number = data.length;
			var listHtml = '';

			for (var i = 0; i < data.length; i++) {

				var businessName = data[i].businessName;
				var statusIcon = checkOk(data[i]) === true ? 'safe' : 'unsafe';
				var salesforceLink = data[i].salesforceLink;

				listHtml += '<li class="'+ statusIcon +'-to-contact"><a class="linkToSalesforce" href="'+ salesforceLink +'">'+ businessName +'</a></li>';
				
			}

			$.get(templatePath, function(listTemplate) {
				listTemplate = listTemplate.replace('{{number}}', number);
				listTemplate = listTemplate.replace('{{list}}', listHtml);
				buildList(data, listTemplate);
			});

		} else if (template === 'single') {
			var statusText = checkOk(data[0]) === true ? 'OK TO CONTACT' : 'DO NOT CONTACT';
			var statusIcon = checkOk(data[0]) === true ? 'success' : 'error';

			$.get(templatePath, function(singleTemplate) {
				singleTemplate = singleTemplate.replace('{{businessName}}', data[0].businessName);
				singleTemplate = singleTemplate.replace('{{salesforceLink}}', data[0].salesforceLink);
				singleTemplate = singleTemplate.replace('{{statusIcon}}', statusIcon);
				singleTemplate = singleTemplate.replace('{{statusText}}', statusText);
				buildList(data[0], singleTemplate);
			});
		}
	}

	function checkOk(data) {
		var exists = data.onSalesforce;
		var contacted = data.contactedRecently;
		var client = data.client;

		if (exists && !contacted && !client) {
			return true;
		} else {
			return false;
		}

	}
	
	function buildList(data, template) {
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
		        success: function(listTemplate) {
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

	$('body').on('click', '.linkToSalesforce', function(e) {
		e.preventDefault();
		var data = _sampleData;

		chrome.tabs.query({
		        active: true,
		        currentWindow: true
		    }, function(tabs) {
		        chrome.tabs.sendMessage(
		                tabs[0].id,
		                {from: 'popup', salesforceLink: data.salesforceLink});
		});

	});

	init();

});
