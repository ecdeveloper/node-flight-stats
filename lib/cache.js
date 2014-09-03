var _ = require('lodash');

var Cache = function (ttl) {
	var cachedObjects = {};

	this.get = function (key) {
		return cachedObjects[key];
	};

	this.set = function (key, value) {
		// No need to check for key existance. Overwrite it if exists.
		cachedObjects[key] = {
			created: Date.now(),
			data: value
		};
	};

	// Clean up outdated cache (TTL)
	setInterval(function () {
		for (var key in cachedObjects) {
			if (cachedObjects[key].created + ttl*1000 < Date.now()) {
				console.log('killing cached object', key);
				delete cachedObjects[key];
			}
		}
	}, 3000);
};


module.exports = Cache;