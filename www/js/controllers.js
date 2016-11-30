angular.module('starter.controllers', ['starter.services.jobs','starter.services.settings'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaDevice, $ionicPopup, $state, $ionicHistory, $ionicBackdrop, ScheduledJobsService, SettingsService, $cordovaInAppBrowser, $cordovaClipboard, $cordovaToast) {

	//form data for devices
	$scope.deviceStates = {};
	$scope.deviceStatesText = {};
	$scope.deviceStatesText.brokerState = "disconnected";
	$scope.deviceStatesText.pumpState = "off";
	$scope.scheduledJobs = [];
	$scope.jobInfo = {};
	
	//chart data
	$scope.labels = [];
	$scope.data = [
		[]
	];
	$scope.series = ['W/hr'];

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

		$ionicPopup.alert({
			title: 'Connection',
			template: 'Unable to connect, please try again later.'
		});

	});

	$scope.$on('mqtt-connect-success', function(event, args) {

		$ionicBackdrop.release();
		$scope.deviceStatesText.brokerState = "connected";

		$ionicPopup.alert({
			title: 'Connection',
			template: 'Operation completed successfully.'
		});

	});

	$scope.$on('mqtt-disconnect-success', function(event, args) {

		$ionicBackdrop.release();
		$scope.deviceStatesText.brokerState = "disconnected";

	    $ionicPopup.alert({
			title: 'Connection',
			template: 'Operation completed successfully.'
		});

	});
	
	$scope.$on('mqtt-message-arrival', function(event, args) {
		
		if(args.destinationName == 'fromPowerMon'){
			var currentDate = new Date();
			
			if($scope.labels.length > 10){
				$scope.labels.shift();
				$scope.data[0].shift();
			}
			
			$scope.labels.push('' + currentDate.getHours() + ":" + currentDate.getMinutes());
			$scope.data[0].push(Number(args.payload));
			//$scope.data[1].push(Number(args.payload)/1000);
			
			//console.log('data' + JSON.stringify($scope.data));
			//console.log('labels' + JSON.stringify($scope.labels));
			
			$scope.$apply();
		}
	});
	
	$scope.reloadJobData = function(){
		$ionicBackdrop.retain();
		
		console.log('Reloading job data');
		
		ScheduledJobsService.list().then(function(data){
			$scope.scheduledJobs = data;
			$ionicBackdrop.release();
		});
	};
	
	$scope.addJob = function(){
		
		console.log('Adding new job');
		
		$ionicBackdrop.retain();
		
		$scope.jobInfo.jobidentifier = $scope.generateGuid();
		
		ScheduledJobsService.addJob($scope.jobInfo).then(function(data){
			
			if(data.hasOwnProperty('error')){
				if(data.error === 'true'){
					alert(data.message);
				}else{
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('app.jobs');
				}
			}
			
			$ionicBackdrop.release();
		});
		
		console.log('Exiting adding new job');
	};
	
	$scope.deleteJob = function(jobId){
		
		var job = ScheduledJobsService.get(jobId);
		
		var confirmPopup = $ionicPopup.confirm({
			title: 'Confirm delete job ' + job.jobName + "?",
			template: 'Confirm to proceed'
		});

		confirmPopup.then(function(res) {
			if(res) {
				
				$ionicBackdrop.retain();
				
				ScheduledJobsService.deleteJob(job).then(function(data){
			
					if(data.hasOwnProperty('error')){
						if(data.error === 'true'){
							alert(data.message);
						}else{
							$scope.reloadJobData();
						}
					}
					$ionicBackdrop.release();
				});
				
				$ionicBackdrop.release();
			} 
		});
	};
	
	$scope.copyToClipboard = function(text){
		
		$cordovaClipboard
			.copy(text)
			.then(function () {
				$cordovaToast
					.show('Schedule copied to clipboard', 'long', 'center');
			}, function () {
			  $cordovaToast
					.show('Something went wrong :(', 'long', 'center');
			});
	};
	
	$scope.showCronHelp = function(){
		var options = {
			location: 'yes',
			clearcache: 'yes',
			toolbar: 'no'
		};
		$cordovaInAppBrowser.open('http://www.quartz-scheduler.org/documentation/quartz-2.x/tutorials/crontrigger.html', '_blank', options);
	};
	
	$scope.$on('$ionicView.beforeEnter', function () {
		
		var $currState = $ionicHistory.currentView().stateId;
		
		if($currState == 'app.jobs'){
			
			console.log('Loading jobs data.');
			console.log('Server configuration: ' + JSON.stringify(SettingsService.getBrokerInfo()));
			ScheduledJobsService.list().then(function(data){
				$scope.scheduledJobs = data;
			});
			//console.log('# of jobs returned: ' + $scope.scheduledJobs.length);
		}
	});

})

.controller('SettingsCtrl', function($scope, $ionicModal, $timeout, $cordovaDevice, $ionicPopup, $state, $ionicHistory, $ionicBackdrop, SettingsService, $cordovaInAppBrowser) {

	//form data for devices
	$scope.brokerInfo = {};
	
	$scope.saveSettings = function() {
		
		console.log('before saving settings: ' + JSON.stringify($scope.brokerInfo));
		SettingsService.setBrokerInfo($scope.brokerInfo);
		
		$ionicPopup.alert({
			title: 'MQ Broker Settings',
			template: 'Settings saved successfully.'
		});
	};

	$scope.$on('$ionicView.beforeEnter', function () {
		
		if(window.localStorage  == undefined){
			$ionicPopup.alert({
				title: 'MQ Broker Settings',
				template: 'Device does not support local storage.'
			});
		}
		
		var $currState = $ionicHistory.currentView().stateId;
		
		if($currState == 'settings.mqbroker'){
			$scope.brokerInfo = SettingsService.getBrokerInfo();
		};
	});

})