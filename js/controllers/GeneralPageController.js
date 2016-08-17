/* Setup general page controller */
MetronicApp.controller('GeneralPageController', ['$rootScope', '$scope', 'settings', function($rootScope, $scope, settings) {
    $scope.$on('$viewContentLoaded', function() {   
    	// initialize core components
    	Metronic.initAjax();

    	// set default layout mode
        $rootScope.settings.layout.pageSidebarClosed = false;
    });
}]);

/* Out of the box - IGNORE and DO NOT TOUCH */
MetronicApp.controller('LoginController', ['$scope', '$state', '$rootScope', 'gService', function($scope, $state, $rootScope, gService) {
  console.log("login controller");
  console.log($state);
  //$rootScope.loginType = 0;
  $scope.login = {
    loginType: 1,
    email: 'mylovefaith@gmail.com',
    password: ''
  }
  $scope.$on('$viewContentLoaded', function() {
    Metronic.initComponents(); // init core components
    //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
  });

  $scope.doLogin = function($event) {
    console.log($scope.login);
    console.log($event);
    $event.preventDefault();

    gService.login($scope.login, function(result) {
      if(result.success) {
        
        document.cookie="authType=" + result.loginType;
        localStorage.setItem('loginId', result.loginId);
        localStorage.setItem('loginType', result.loginType);
        localStorage.setItem('email', $scope.login.email);
        localStorage.setItem('user', JSON.stringify(result.user));
        gCurrent.user = result.user;
        if(result.loginType == '1') {
          gConfig.loginType = 1;
          $state.go('dashboard');
        } else if (result.loginType == '2') {
          gConfig.loginType = 2;
          $state.go('dashboard');
        } else {
          gConfig.loginType = 3;
          gConfig.loginId = result.loginId;
          localStorage.setItem('clientId', result.loginId);
          gCurrent.client = result.user;
          gCurrent.clientId = result.loginId;
          $state.go('menu');
        }
      } else {
        $('.alert-danger').show();
      }
    });
  }
}]);


/* Out of the box - IGNORE and DO NOT TOUCH */
MetronicApp.controller('AppController', ['$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
  console.log("App controller", $state, $state.current.name); 
  $scope.$on('$viewContentLoaded', function() {
    Metronic.initComponents(); // init core components
    //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
  });
}]);


/* Setup Layout Part - Header */
/* Out of the box - IGNORE and DO NOT TOUCH */
MetronicApp.controller('HeaderController', ['$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
  $scope.$on('$includeContentLoaded', function() {
    Layout.initHeader(); // init header
  });

  $scope.doLogout = function() {
      localStorage.removeItem('loginId');
      localStorage.removeItem('client');
      localStorage.removeItem('user');
      localStorage.removeItem('clientId');
      gConfig.loginId = null;
      gConfig.loginType = null;
      gCurrent.user = null;
      gCurrent.client = null;
      gCurrent.clientId = null;
      document.cookie = "authType=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      $state.go('login');
  }
}]);

/* Out of the box - IGNORE and DO NOT TOUCH */
/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
  $scope.$on('$includeContentLoaded', function() {
    Layout.initSidebar(); // init sidebar
  });
}]);

/* Out of the box - IGNORE and DO NOT TOUCH */
/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {
  $scope.$on('$includeContentLoaded', function() {
    Demo.init(); // init theme panel
  });
}]);

/* Out of the box - IGNORE and DO NOT TOUCH */
/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
  $scope.$on('$includeContentLoaded', function() {
    Layout.initFooter(); // init footer
  });
}]);
