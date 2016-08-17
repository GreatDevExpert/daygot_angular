/***
Metronic AngularJS App Main Script
***/

/* Module Loading - Do NOT TOUCH unless you know what you are doing */
var MetronicApp = angular.module("MetronicApp", [
  "ui.router",
  "ui.bootstrap",
  "oc.lazyLoad",
  "frapontillo.bootstrap-switch",
  "ngTable",
  "ngImgCrop",
  "ngSanitize"
]);


/* Out of the box - IGNORE */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
  $ocLazyLoadProvider.config({
    // global configs go here
  });
}]);


/* Out of the box - IGNORE */
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);


/* Init - Determine whether current user is Admin, Reseller, or Merchant */
MetronicApp.run(["$rootScope", "settings", "$state", "gService", function($rootScope, settings, $state, gService) {
  console.log("Angular Run");
  $rootScope.$state = $state; // state to be accessed from view
  $rootScope.auth = {
    loginType: 1, // 1-Admin, 2-Agent(reseller) , 3-Merchant (client)
    loginId: 1    // adminId, agentId, clientId depending on login Type
  }
  $rootScope.randomVar = Math.floor((Math.random() * 99999) + 1);

   /* Get local storages */
    var tmp = localStorage.getItem('user');
    if(tmp) {
      gCurrent.user = JSON.parse(tmp);
    }
    gCurrent.clientId = localStorage.getItem('clientId');

    // Check for various auth on state event.
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      // Back to login when trying to access app without Login
      console.log("toState", toState);
      if (toState.name != "login") {
        console.log("not login",  toState.name);
        $rootScope.loginType = gConfig.loginType;
        $rootScope.loginId = gConfig.loginId;
        var authType = gService.getCookie('authType');
        if (!authType || !gCurrent.user) {
          event.preventDefault();
          $state.go('login');
        }
      } else {
        console.log("login",  toState.name);
        $rootScope.loginType = 0;
      }
      //console.log("gConfig", gConfig);
      // Tries to access menu without selecting Client
      if (toState.clientFlag && !(gCurrent.clientId || gCurrent.client || toParams.clientId)  && gConfig.loginType < 3) {
        event.preventDefault();
        $state.go('dashboard');
      } 
      else if(!toState.clientFlag && gConfig.loginType == 3) {
        event.preventDefault();
        $state.go('clientDashboard', {clientId: gCurrent.clientId});
      }
      else if(toState.clientFlag && gConfig.loginType == 3) {
        if(toParams.clientId != gCurrent.user.clientId) {
          event.preventDefault();
          $state.go('clientDashboard', {clientId: gCurrent.clientId});
        }
      }
    });
  
}]);



/* Out of the box - IGNORE and DO NOT TOUCH */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
  // supported languages
  var settings = {
    layout: {
      pageSidebarClosed: false, // sidebar state
      pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
    },
    layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
    layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
  };

  $rootScope.settings = settings;
  return settings;
}]);

/* PY - Service to retrieve API, DO NOT TOUCH! */
MetronicApp.factory('webService', function($q) {
  return {
    postData: function(url, param, hideLoading) {
      var userId = localStorage.getItem('userId');
      if (!param) param = {};
      param.key = 'daygot';
      if(!param.loginType) param.loginType = gConfig.loginType;
      param.loginId = gConfig.loginId;

      if (param.loginId == undefined)
        param.loginId = gCurrent.clientId;
      
      var result = $q.defer();
      if (!hideLoading) $('#loader').show();

      console.log("param", param);
      $.retryAjax({
        url: url,
        timeout: 10000,
        retryLimit: 1,
        method: 'post',
        data: param,
        //processData: (param.fileUpload ? false : true),
        success: function(response) {
          console.log("******* SERVICE CALL - " + url);
          if (!hideLoading) $('#loader').hide();
          response = JSON.parse(response);
          console.log("response", response);
          result.resolve(response);
        },
        error: function(err) {
          if (!hideLoading) $('#loader').hide();
          result.resolve(false);
        }
      });
      return result.promise;
    }
  }
});

// PY, Fetch necessary data for each view. 
// Every view first checks whether client info is fetched before doing anything
MetronicApp.service('pageResponse', function($q, $http, $state, webService) {
  return {
    getResult: function(pageParam, $stateParams) {
      var result = $q.defer();
      console.log(pageParam, $stateParams);

      // Web service call for page-specific
      if (pageParam.service) {
        var service = pageParam.service;
        if (!service.data) service.data = {};
        for (var attrname in $stateParams) { service.data[attrname] = $stateParams[attrname]; }
          console.log(service.data);
        webService.postData(service.url, service.data).then(function(data) {
          result.resolve(data);
        })
      } else {
        result.resolve(false);
      }
      return result.promise;
    }
  }
});

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
      if(authType == 1 || authType == 2) defaultState = 'dashboard';
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


/* VERY IMPORTANT!!!!!!!!!! */
/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, gService) {

  gCurrent.clientId = localStorage.getItem('clientId');

  /* get cookies and states */
    var getCookie = function(name) {
      var re = new RegExp(name + "=([^;]+)");
      var value = re.exec(document.cookie);
      return (value != null) ? unescape(value[1]) : null;
    };

    var getDefaultState = function() {
      var authType = getCookie('authType');
      gConfig.loginType = +authType;
      gConfig.loginId = +localStorage.getItem('loginId');
      console.log("Auth Type: ", authType);
      var defaultState = 'login.html';
      if (authType == 1 || authType == 2) defaultState = '/dashboard.html';
      else if (authType == 3) defaultState = '/clientDashboard/' + gCurrent.clientId;
      return defaultState;
    };


    var defaultState = getDefaultState();
    console.log("defaultState: ", defaultState);
    // Redirect any unmatched url
    $urlRouterProvider.otherwise(defaultState);

    //gConfig.loginType = 1;
    //$urlRouterProvider.otherwise("/dashboard.html");


  $stateProvider

  // Login
  .state('login', {
    url: "/login.html",
    templateUrl: "views/login.html",
    data: {
      pageTitle: 'Login'
    },
    controller: "LoginController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
          files: [
            'css/login.css'
          ]
        });
      }]
    }
  })

  // Dashboard
  .state('dashboard', {
    url: "/dashboard.html",
    templateUrl: "views/dashboard.html",
    data: {
      pageTitle: 'Admin Dashboard Template'
    },
    controller: "DashboardController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
          files: [
            'assets/global/plugins/morris/morris.css',
            'assets/admin/pages/css/tasks.css',

            'assets/global/plugins/morris/morris.min.js',
            'assets/global/plugins/morris/raphael-min.js',
            'assets/global/plugins/jquery.sparkline.min.js',

            'assets/admin/pages/scripts/index3.js',
            'assets/admin/pages/scripts/tasks.js',

            'js/controllers/DashboardController.js'
          ]
        });
      }]
    }
  })

  // My Restaurants - client list
  .state('restaurants', {
    url: "/restaurants",
    templateUrl: "views/restaurants.html",
    data: {
      pageTitle: 'My Restaurants'
    },
    controller: "RestaurantsController",
    service: {
        url: gConfig.baseUrl + 'client/index'
    },
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
            'assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
            'assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',
            'assets/global/plugins/bootstrap-toastr/toastr.min.css',

            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/datatables/all.min.js',
            'assets/global/plugins/bootstrap-toastr/toastr.min.js',

            'assets/admin/pages/scripts/form-wizard.js',

            'js/scripts/table-restaurants.js',
            'js/controllers/DashboardController.js'
          ]
        });
      }],
      // Inlclude this on every state
      result: function(pageResponse) {
          return pageResponse.getResult(this.self);
      }
    }
  })


  // Client Dashboard
  .state('clientDashboard', {
    url: "/clientDashboard/:clientId",
    templateUrl: "views/client/dashboard.html",
    data: {
      pageTitle: 'Restaurant Summary'
    },
    clientFlag: true,
    controller: "ClientDashboardController",
    service: {
        url: gConfig.baseUrl + 'client/dashboard'
    },
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
            'assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
            'assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',
            'assets/global/plugins/bootstrap-toastr/toastr.min.css',

            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/datatables/all.min.js',

            'assets/global/plugins/bootstrap-toastr/toastr.min.js',

            'js/controllers/ClientController.js'
          ]
        });
      }],
      result: function(pageResponse, $stateParams) {
          return pageResponse.getResult(this.self, $stateParams);
      }
    }
  })

  // MENU page
  .state('menu', {
    url: "/menu/:clientId",
    templateUrl: "views/client/menu.html",
    data: {
      pageTitle: 'Menu Setup'
    },
    controller: "MenuController",
    clientFlag: true,
    service: {
        url: gConfig.baseUrl + 'menu/index'
    },
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
            
            'assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
            'assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',
            'assets/global/plugins/jstree/dist/themes/default/style.min.css',

            'assets/global/plugins/jstree/dist/jstree.min.js',
            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/datatables/all.min.js',

            'assets/global/plugins/bootstrap-toastr/toastr.min.css',
            'assets/global/plugins/bootstrap-toastr/toastr.min.js',
            
            'js/scripts/table-restaurants.js',
            'js/controllers/MenuController.js'


          ]
        });
      }],
      result: function(pageResponse, $stateParams) {
          return pageResponse.getResult(this.self, $stateParams);
      }
    }
  })

  // Client Promos
  .state('clientPromos', {
    url: "/clientPromos/:clientId",
    templateUrl: "views/client/promos.html",
    data: {
      pageTitle: 'Promos Summary'
    },
    clientFlag: true,
    controller: "ClientPromosController",
    service: {
        url: gConfig.baseUrl + 'client/getPromos'
    },
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
            'assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
            'assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',
            'assets/global/plugins/bootstrap-toastr/toastr.min.css',

            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/datatables/all.min.js',

            'assets/global/plugins/bootstrap-toastr/toastr.min.js',

            'js/controllers/ClientController.js',
            //'js/controllers/PromosController.js'
          ]
        });
      }],
      result: function(pageResponse, $stateParams) {
          return pageResponse.getResult(this.self, $stateParams);
      }
    }
  })














  /* JUST REFERENCES - DO NOT TOUCH */
  .state('fileupload', {
    url: "/file_upload.html",
    templateUrl: "views/file_upload.html",
    data: {
      pageTitle: 'AngularJS File Upload'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'angularFileUpload',
          files: [
            'assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
          ]
        }, {
          name: 'MetronicApp',
          files: [
            'js/controllers/GeneralPageController.js'
          ]
        }]);
      }]
    }
  })

  // UI Select
  .state('uiselect', {
    url: "/ui_select.html",
    templateUrl: "views/ui_select.html",
    data: {
      pageTitle: 'AngularJS Ui Select'
    },
    controller: "UISelectController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'ui.select',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
            'assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
          ]
        }, {
          name: 'MetronicApp',
          files: [
            'js/controllers/UISelectController.js'
          ]
        }]);
      }]
    }
  })

  // UI Bootstrap
  .state('uibootstrap', {
    url: "/ui_bootstrap.html",
    templateUrl: "views/ui_bootstrap.html",
    data: {
      pageTitle: 'AngularJS UI Bootstrap'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'MetronicApp',
          files: [
            'js/controllers/GeneralPageController.js'
          ]
        }]);
      }]
    }
  })

  // Tree View
  .state('tree', {
    url: "/tree",
    templateUrl: "views/tree.html",
    data: {
      pageTitle: 'jQuery Tree View'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/jstree/dist/themes/default/style.min.css',

            'assets/global/plugins/jstree/dist/jstree.min.js',
            'assets/admin/pages/scripts/ui-tree.js',
            'js/controllers/GeneralPageController.js'
          ]
        }]);
      }]
    }
  })

  // Form Tools
  .state('formtools', {
    url: "/form-tools",
    templateUrl: "views/form_tools.html",
    data: {
      pageTitle: 'Form Tools'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
            'assets/global/plugins/jquery-tags-input/jquery.tagsinput.css',
            'assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
            'assets/global/plugins/typeahead/typeahead.css',

            'assets/global/plugins/fuelux/js/spinner.min.js',
            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
            'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
            'assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
            'assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
            'assets/global/plugins/jquery-tags-input/jquery.tagsinput.min.js',
            'assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
            'assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
            'assets/global/plugins/typeahead/handlebars.min.js',
            'assets/global/plugins/typeahead/typeahead.bundle.min.js',
            //'assets/admin/pages/scripts/components-form-tools.js',

            'js/controllers/GeneralPageController.js'
          ]
        }]);
      }]
    }
  })

  // Date & Time Pickers
  .state('pickers', {
    url: "/pickers",
    templateUrl: "views/pickers.html",
    data: {
      pageTitle: 'Date & Time Pickers'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/clockface/css/clockface.css',
            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
            'assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
            'assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
            'assets/global/plugins/clockface/js/clockface.js',
            'assets/global/plugins/bootstrap-daterangepicker/moment.min.js',
            'assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
            'assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

            'assets/admin/pages/scripts/components-pickers.js',

            'js/controllers/GeneralPageController.js'
          ]
        }]);
      }]
    }
  })

  // Custom Dropdowns
  .state('dropdowns', {
    url: "/dropdowns",
    templateUrl: "views/dropdowns.html",
    data: {
      pageTitle: 'Custom Dropdowns'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load([{
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/bootstrap-select/bootstrap-select.min.css',
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/jquery-multi-select/css/multi-select.css',

            'assets/global/plugins/bootstrap-select/bootstrap-select.min.js',
            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

            'assets/admin/pages/scripts/components-dropdowns.js',

            'js/controllers/GeneralPageController.js'
          ]
        }]);
      }]
    }
  })

  // Advanced Datatables
  .state('datatablesAdvanced', {
    url: "/datatables/advanced.html",
    templateUrl: "views/datatables/advanced.html",
    data: {
      pageTitle: 'Advanced Datatables'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
            'assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
            'assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/datatables/all.min.js',
            'js/scripts/table-advanced.js',

            'js/controllers/GeneralPageController.js'
          ]
        });
      }]
    }
  })

  // Ajax Datetables
  .state('datatablesAjax', {
    url: "/datatables/ajax.html",
    templateUrl: "views/datatables/ajax.html",
    data: {
      pageTitle: 'Ajax Datatables'
    },
    controller: "GeneralPageController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/select2/select2.css',
            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
            'assets/global/plugins/select2/select2.min.js',
            'assets/global/plugins/datatables/all.min.js',

            'assets/global/scripts/datatable.js',
            'js/scripts/table-ajax.js',

            'js/controllers/GeneralPageController.js'
          ]
        });
      }]
    }
  })

  // User Profile
  .state("profile", {
    url: "/profile",
    templateUrl: "views/profile/main.html",
    data: {
      pageTitle: 'User Profile'
    },
    controller: "UserProfileController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
            'assets/admin/pages/css/profile.css',
            'assets/admin/pages/css/tasks.css',

            'assets/global/plugins/jquery.sparkline.min.js',
            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

            'assets/admin/pages/scripts/profile.js',

            'js/controllers/UserProfileController.js'
          ]
        });
      }]
    }
  })

  // User Profile Dashboard
  .state("profile.dashboard", {
    url: "/dashboard",
    templateUrl: "views/profile/dashboard.html",
    data: {
      pageTitle: 'User Profile'
    }
  })

  // User Profile Account
  .state("profile.account", {
    url: "/account",
    templateUrl: "views/profile/account.html",
    data: {
      pageTitle: 'User Account'
    }
  })

  // User Profile Help
  .state("profile.help", {
    url: "/help",
    templateUrl: "views/profile/help.html",
    data: {
      pageTitle: 'User Help'
    }
  })

  // Todo
  .state('todo', {
    url: "/todo",
    templateUrl: "views/todo.html",
    data: {
      pageTitle: 'Todo'
    },
    controller: "TodoController",
    resolve: {
      deps: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name: 'MetronicApp',
          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
          files: [
            'assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
            'assets/global/plugins/select2/select2.css',
            'assets/admin/pages/css/todo.css',

            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
            'assets/global/plugins/select2/select2.min.js',

            'assets/admin/pages/scripts/todo.js',

            'js/controllers/TodoController.js'
          ]
        });
      }]
    }
  })

}]);

