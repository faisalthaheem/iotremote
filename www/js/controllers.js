angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaDevice, $ionicPopup, $state, $ionicHistory, $ionicBackdrop, ScheduledJobsService) {

	//form data for devices
	$scope.deviceStates = {};
	$scope.deviceStatesText = {};
	$scope.deviceStatesText.brokerState = "disconnected";
	$scope.deviceStatesText.pumpState = "off";
	$scope.scheduledJobs = [];

	$scope.toggleBrokerConnection = function(){

		$ionicBackdrop.retain();

		if( $scope.deviceStates.broker == true ){
			$scope.connectMQTT();	
		}else{
			$scope.disconnectMQTT();
		}
	};

	$scope.togglePumpState = function(){

		var message = 'off';
		if( $scope.deviceStates.pump == true ){
			message = 'on';
		}
		
		if( false == $scope.sendMQTTMessage('toPump', message) ){
			//unable to send message for any reason
			$scope.deviceStates.pump = false;
			$scope.deviceStatesText.pumpState = "off";
		}else{
			if( $scope.deviceStates.pump == true ){
				$scope.deviceStatesText.pumpState = "on";
			}else{
				$scope.deviceStatesText.pumpState = "off";
			}
		}
	};

	$scope.$on('mqtt-connect-failure', function(event, args) {

		$ionicBackdrop.release();
		$scope.deviceStatesText.brokerState = "disconnected";


	    alert('Unable to connect, please try again later');


	});

	$scope.$on('mqtt-connect-success', function(event, args) {

		$ionicBackdrop.release();
		$scope.deviceStatesText.brokerState = "connected";

	    alert('Operation completed successfully');

	});

	$scope.$on('mqtt-disconnect-success', function(event, args) {

		$ionicBackdrop.release();
		$scope.deviceStatesText.brokerState = "disconnected";

	    alert('Operation completed successfully');

	});
	
	$scope.reloadJobData = function(){
		$ionicBackdrop.retain();
		
		console.log('Reloading job data');
		
		ScheduledJobsService.list().then(function(data){
			$scope.scheduledJobs = data;
			$ionicBackdrop.release();
		});
	};
	
	$scope.$on('$ionicView.beforeEnter', function () {
		
		var $currState = $ionicHistory.currentView().stateId;
		
		if($currState == 'app.jobs'){
			console.log('Loading jobs data.');
			ScheduledJobsService.list().then(function(data){
				$scope.scheduledJobs = data;
			});
			//console.log('# of jobs returned: ' + $scope.scheduledJobs.length);
		}
	});

})

