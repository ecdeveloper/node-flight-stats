var express = require('express');
var request = require('request');
var jsdom = require('jsdom');
var Cache = require('../lib/cache');

var router = express.Router();

// Using wildcards we can easily add some more params in the future (flight date, flight destination, etc)
var endpointUrl = 'http://www.flightstats.com/go/FlightStatus/flightStatusByFlight.do?airline=&flightNumber={flightNr}';

// @TODO: Move TTL to config
var cacheStorage = new Cache(120); // ttl - seconds

/* GET users listing. */
router.get('/flight/:flight', function (req, res) {
	var flight = req.param('flight', null);

	if (!flight) {
		return res.json({ error: 'No flight specified' });
	}

	// Clean up the input
	flight = flight.replace(/[ -]/g, '').toUpperCase();

	// Check cache for results
	var cachedResult = cacheStorage.get(flight);
	if (cachedResult) {
		return res.json({error: null, flight: cachedResult.data});
	}

	// Request flightstats
	request.get(endpointUrl.replace(/{flightNr}/, flight), function (error, response, body) {
		if (error) {
			console.warn('Error requesting flightstats:', error);
			return res.json({ error: error });
		}

		jsdom.env(body, ["http://code.jquery.com/jquery.js"], function (errors, window) {
			if (!window.$('.flightStatusByFlightBlock') || !window.$('.flightStatusByFlightBlock').length) {
				return res.json({ error: 'No such flight' });
			}

			var detailLabels = [];
			var detailValues = [];

			for (var i = 1; i < window.$('.statusDetailsTable tr').length; i++) {
				// As long as we don't really know what's inside status detail table - we just separate the labels (odd rows) and values (even rows)
				if (i % 2 !== 0) {
					detailLabels.push(window.$('.statusDetailsTable tr:eq('+ i +') > td:eq(0)').text().replace(/\t{2,}/g, '').replace(/\n/g, ' '));
					detailLabels.push(window.$('.statusDetailsTable tr:eq('+ i +') > td:eq(1)').text().replace(/\t{2,}/g, '').replace(/\n/g, ' '));
				} else {
					detailValues.push(window.$('.statusDetailsTable tr:eq('+ i +') > td:eq(0)').text().replace(/\t{2,}/g, '').replace(/\n/g, ' '));
					detailValues.push(window.$('.statusDetailsTable tr:eq('+ i +') > td:eq(1)').text().replace(/\t{2,}/g, '').replace(/\n/g, ' '));
				}
			}

			var flightObj = {
				logo: window.$('.logo') && window.$('.logo').length ? window.$('.logo')[0].src : '',
				name: window.$('.flightName').text().replace(/\t{2,}/g, '').replace(/\n/g, ' '),
				route: window.$('.route').text().replace(/\t{2,}/g, '').replace(/\n/g, ' '),
				detailLabels: detailLabels,
				detailValues: detailValues
			};

			// Cache the result
			cacheStorage.set(flight, flightObj);
			res.json({error: null, flight: flightObj});
		});
	});
});

module.exports = router;
