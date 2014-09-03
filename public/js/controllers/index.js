app.controller('indexCtrl', function ($scope, $http, $location) {

	$scope.searchBtnText = 'Search';

	$scope.closeAlert = function (index) {
		if ($scope.alerts && $scope.alerts.length) {
			$scope.alerts.splice(index, 1);
		}
	};

	$scope.searchFlight = function () {
		$scope.flight = {};
		$scope.closeAlert();

		if (!$scope.flightQuery) {
			// alert('Enter a flight number!');
			$scope.alerts = [{  type: 'info', msg: 'Empty flight number' }];
			return;
		}

		$scope.isLoading = true;
		$scope.searchBtnText = 'Searching...';

		$http.get('/search/flight/' + $scope.flightQuery)
		.success(function (response) {
			$scope.isLoading = false;
			$scope.searchBtnText = 'Search';

			if (response.error) {
				// alert();
				$scope.alerts = [{  type: 'danger', msg: response.error }];
			} else {
				$scope.flight = {
					logo: response.flight.logo.replace(/file:\/\//, 'http://'),
					name: response.flight.name,
					route: response.flight.route,
					detailLabels: response.flight.detailLabels,
					detailValues: response.flight.detailValues,
				};
			}
		});
	};
});