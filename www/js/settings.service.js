angular.module('starter.services.settings',[])
.factory('SettingsService', function() {

  return {
	
    getBrokerInfo : function() {
		storedData = window.localStorage.getItem('brokerInfo');
		return JSON.parse(storedData);
    },

    setBrokerInfo : function(brokerInfo) {
		
		dataToStore = JSON.stringify(brokerInfo);
		console.log('Data to store: ' + dataToStore);
		window.localStorage.setItem('brokerInfo', dataToStore);
    }
	
  }
});