MetronicApp.service('gService', function($q, $http, webService) {
  return {
    getCookie: function(name) {
      var re = new RegExp(name + "=([^;]+)");
      var value = re.exec(document.cookie);
      return (value != null) ? unescape(value[1]) : null;
    },
    
    getDefaultState: function() {
      var authType = gService.getCookie('authType');
      var defaultState = 'login';
      if(authType == 1 || authType == 2) defaultState = 'home';
      else if(authType == 3) defaultState = 'clientDashboard';
      return defaultState;  
    },

    resetClient: function() {
      localStorage.removeItem('client');
      gCurrent.client = null;
    },

    /*************** LOGIN/REGSTER ***************/
    login: function(data, callback) {
      webService.postData(gConfig.baseUrl + 'login', data).then(function(result) {
        callback(result);
      });
    }
  }
})