angular.module('starter.services', [])
.factory('ScheduledJobsService', function($http) {

  return {
	
    list : function() {
		return (
			//$http.get("http://192.168.0.240:4567/listJobs")
			$http.get("http://localhost:4567/listJobs")
			.then(
				function(response){
					jobs = response.data.responseData.jobs;
					return jobs;
				},
				function(response){
					console.log('could not reload job data');
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
			$http.post('http://localhost:4567/deleteJob', jobData)
			//$http.post('http://192.168.0.240:4567/addJob', jobData)
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
		
		return (
			$http.post('http://localhost:4567/addJob', jobData)
			//$http.post('http://192.168.0.240:4567/addJob', jobData)
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