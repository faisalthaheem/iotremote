angular.module('starter.services.jobs', ['starter.services.settings'])
.factory('ScheduledJobsService', function($http,SettingsService) {

  return {
	
	getBaseUrl : function() {
		return "http://" + SettingsService.getBrokerInfo().ip + ":4567";
	},
	
    list : function() {
		return (
			$http.get(this.getBaseUrl() + "/listJobs", {timeout: 2000})
			.then(
				function(response){
					jobs = response.data.responseData.jobs;
					return jobs;
				},
				function(response){
					console.log('could not reload job data');
					console.log('Error code: ' + response.status);
					console.log('Error desc: ' + JSON.stringify(response));
					return [];
				}
			)
		)
    },

    get : function(jobId) {
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].id === jobId) {
          return jobs[i];
        }
      }
      return undefined;
    },

    deleteJob : function(jobData) {
		return (
			$http.post(this.getBaseUrl() + "/deleteJob", jobData, {timeout: 2000})
			.then(
				function(response){
					return response.data;
				},
				function(response){
					console.log('Error invoking service for adding new job');
					return response;
				}
			)
		)
    },

    addJob : function(jobData) {
		
		console.log('Adding new job: ' + JSON.stringify(jobData));
		
		return (
			$http.post(this.getBaseUrl() + "/addJob", jobData, {timeout: 2000})
			.then(
				function(response){
					return response.data;
				},
				function(response){
					console.log('Error invoking service for adding new job');
					return response;
				}
			)
		)
    }
  }
});