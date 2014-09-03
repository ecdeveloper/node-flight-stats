var app = angular.module('flightCheckerApp', ['ngRoute', 'ui.bootstrap']);

app.config(function ($routeProvider, $provide) {
	$routeProvider.when('/', {
		controller: 'indexCtrl',
		templateUrl: '/partials/search'
	});
});