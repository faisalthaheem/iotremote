angular.module('starter.services', [])
.factory('ScheduledJobsService', function($http) {

  return {
	
    list : function() {
		return (
			$http.get("http://192.168.0.240:4567/listJobs")
			//$http.get("http://localhost:4567/listJobs")
			.then(
				function(response){
					jobs = response.data.responseData.jobs;
					return jobs;
			})
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

    remove : function(jobId) {
      
    },

    add : function(jobName, cronSchedule, topic, payload, jobIdentifier) {
      
    }
  }
});