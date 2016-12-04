// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','ngCordova', 'starter.services.settings','chart.js'])

.run(function($ionicPlatform,$rootScope,$cordovaDevice,$ionicPopup, $state, $ionicHistory, $ionicBackdrop, SettingsService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

	$rootScope.clientConnected = false;


	$rootScope.getDeviceUUID = function(){
		if( $cordovaDevice.hasOwnProperty('device') ){
			
			return $cordovaDevice.getUUID();
		}else{
			console.log("Does not have a valid device, using test id instead.");
			
			return "testUUID";
		}
	}


	$rootScope.connectMQTT = function(){

		if(null == $rootScope.client)
		{
			$rootScope.client = new Paho.MQTT.Client(
				SettingsService.getBrokerInfo().ip,    
			   	Number(9001),
				$rootScope.getDeviceUUID()
			);
			// set callback handlers
			$rootScope.client.onConnectionLost = $rootScope.onConnectionLost;
			$rootScope.client.onMessageArrived = $rootScope.onMessageArrived;
		}
	
		if(null != $rootScope.client && false == $rootScope.clientConnected)
		{
			console.log('attempting to connect');
			$rootScope.client.connect(
				{
					onSuccess: function(){
						console.log('connected successfully');

						$rootScope.clientConnected = true;
			
						//subscribe to the topics
						$rootScope.client.subscribe("#");

						//broadcast successful connection
						$rootScope.$broadcast('mqtt-connect-success');


					},
					onFailure: function(){
						console.log('failed to connect');
						//broadcast failure to connect
						$rootScope.$broadcast('mqtt-connect-failure');
					}
				}
			);
		}else if(null != $rootScope.client){
			//broadcast successful connection
			$rootScope.$broadcast('mqtt-connect-success');
		}

	};

	$rootScope.disconnectMQTT = function(){
		if(null != $rootScope.client){
			if(true == $rootScope.clientConnected){
				$rootScope.clientConnected = false;
				$rootScope.client.disconnect();
			}
			$rootScope.$broadcast('mqtt-disconnect-success');
		}
	};

	$rootScope.sendMQTTMessage = function(destination, payload){
		
		if(false == $rootScope.clientConnected){

			var alertPopup = $ionicPopup.alert({
				title: 'Connection',
				template: 'Please connect to broker first.'
			});

			return false;
		}

		  message = new Paho.MQTT.Message(payload);
		  message.destinationName = destination;
		  $rootScope.client.send(message);
	}

	$rootScope.onConnectionLost = function(responseObject) {

	  if (responseObject.errorCode !== 0) {

		$rootScope.clientConnected = false;

	    console.log("onConnectionLost:"+responseObject.errorMessage);
		//broadcast event
		$rootScope.$broadcast('mqtt-connect-failure');
	  }
	};

	// called when a message arrives
	$rootScope.onMessageArrived = function(message) {
	  console.log("onMessageArrived:" + message.destinationName + ' ' + message.payloadString);
		//broadcast event
		$rootScope.$broadcast('mqtt-message-arrival', { destinationName: message.destinationName, payload: message.payloadString });
	}
	
	$rootScope.S4 = function() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
	}
	
	$rootScope.generateGuid = function(){
		guid = ($rootScope.S4() + $rootScope.S4() + "-" + $rootScope.S4() + "-4" + $rootScope.S4().substr(0,3) + "-" + $rootScope.S4() + "-" + $rootScope.S4() + $rootScope.S4() + $rootScope.S4()).toLowerCase();
		return guid;
	}

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

	$httpProvider.defaults.headers.common = {};
	$httpProvider.defaults.headers.post = {};
	$httpProvider.defaults.headers.put = {};
	$httpProvider.defaults.headers.patch = {};
	
  $stateProvider
  
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })


  .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html'
        }
      }
    })
	
	.state('app.jobs', {
      url: '/jobs',
      views: {
        'menuContent': {
          templateUrl: 'templates/jobs/index.html'
        }
      }
    })
	
	.state('app.addJob', {
      url: '/addJob',
      views: {
        'menuContent': {
          templateUrl: 'templates/jobs/add.html'
        }
      }
    })
	
	.state('app.editJob', {
      url: '/editJob/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/jobs/edit.html'
        }
      }
    })
	
	.state('settings', {
		url: '/settings',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'SettingsCtrl'
	})
  
	.state('settings.mqbroker', {
      url: '/mqbroker',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings/mqbroker.html'
        }
      }
    })
	
	.state('powermon', {
		url: '/powermon',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'PowermonCtrl'
	})
	
	.state('powermon.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/powermon/dashboard.html'
        }
      }
    })
	
	.state('control', {
		url: '/control',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'ControlCtrl'
	})
	
	.state('control.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/control/dashboard.html'
        }
      }
    })
	;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
