'use strict';

MetronicApp.controller('DashboardController', function($state, $rootScope, $scope, $http, $timeout, webService) {
  console.log("Dashboard controller");
  $scope.$on('$viewContentLoaded', function() {
    // initialize core components
    Metronic.initAjax();

  });

  // set sidebar closed and body solid layout mode
  $rootScope.settings.layout.pageSidebarClosed = false;

});

MetronicApp.controller('RestaurantsController', 
  function($state, $rootScope, $scope, settings, result, webService, NgTableParams) {
  $scope.$on('$viewContentLoaded', function() {

    // initialize core components
    $scope.store = { hourWeekend: 0};
    $scope.agents = result.agents;
    $scope.client = {};
    $scope.clients = [];
     console.log(result.clients);   
    for (var c in result.clients)
    {
      
      if ((localStorage.getItem("loginType") == 2 && result.clients[c].agentId == localStorage.getItem("loginId")) || localStorage.getItem("loginType") == 1)
        $scope.clients.push(result.clients[c]);
    } // RESULT CONTAINS DATA FROM PHP CALL

      

      console.log($scope.clients);
    /* prepopulate fields */
    $scope.client = {
      storeName: "Test Store",
      clientEmail: "test@daygot.com",
      clientPassword: '1111',
      clientPassword2: '2222'
    }
    $scope.store = {
      hourWeekend: 0, 
      delivery: 0,
      taxRate: 6,
      waitingMin: 15,
      itemThres: 3,
      contactEmail: 'test@daygot.com',
      street: '1120 Easton Rd',
      city: 'Willow Grove',
      state: 'PA',
      zip: '19090',
      password: '1111',
      password2: '1111'
      
    }
    $scope.store.hours = JSON.parse(JSON.stringify(gDefaultHours));

    $scope.timeslot = gTimeslot; //define timeslot for biz hours from config.js

    // Configure restaurant list table
    $scope.setTable = function() {
      $scope.tableParams = new NgTableParams({
          count: 20,
          sorting: { 'clientId': 'desc'} // default sorting
      }, {
        dataset: $scope.clients
      });
      console.log($scope.clients);
    }
    $scope.setTable();

    // Function to saveNewClient
    $scope.saveNewClient = function() {
        
        var temp ={
          store: JSON.stringify($scope.store),
          client: JSON.stringify($scope.client)
        }
        console.log(temp);
        //console.log($scope.item);
        
        webService.postData(gConfig.baseUrl + "client/saveNewClient", temp).then(function(data) {
          //console.log(data);
          $('#modal_restaurant_add').modal('hide');
          toastr.options = {
            //"positionClass": "toast-top-center",
            "showMethod": "slideDown",
          }
          // ["color"]["message"]
          // success=green
          toastr["success"]("SAVED SUCCESSFULLY");
          //if(!$scope.item.itemId)
            //$scope.insertItem($scope.item);
          //add to insert the new store at the top of the restaurant page $scope.client
          $scope.clients.unshift(data.client);
          $scope.setTable();

          console.log($scope.clients);

        

    /* prepopulate fields */
    $scope.client = {
      storeName: "Test Store",
      clientEmail: "test@daygot.com",
      clientPassword: '1111',
      clientPassword2: '2222'
    }
    $scope.store = {
      hourWeekend: 0, 
      delivery: 0,
      taxRate: 6,
      waitingMin: 15,
      itemThres: 3,
      contactEmail: 'test@daygot.com',
      street: '1120 Easton Rd',
      city: 'Willow Grove',
      state: 'PA',
      zip: '19090',
      password: '1111',
      password2: '1111'
      
    }
    $scope.store.hours = JSON.parse(JSON.stringify(gDefaultHours));

    $scope.timeslot = gTimeslot;//define timeslot for biz hours from config.js

            $scope.navTab(1);

            console.log(JSON.stringify(gDefaultHours));
        })
    }

    // Function to removeClient
    $scope.removeClient = function(item) {
        
        var temp ={
          store: $scope.store,
          client: $scope.client
        }

        console.log($scope.item);
        
        webService.postData(gConfig.baseUrl + "client/removeClient", temp).then(function(data) {
          //console.log(data);
          $('#modal_restaurant_add').modal('hide');
          toastr.options = {
            //"positionClass": "toast-top-center",
            "showMethod": "slideDown",
          }
          // ["color"]["message"]
          // success=green
          toastr["success"]("REMOVED SUCCESSFULLY");
          if(!$scope.item.itemId)
            $scope.insertItem($scope.item);
          
        })
    }

    // Function when menu is clicked
    $scope.nav = function(page, clientId) {
        console.log(clientId);
        gCurrent.clientId = clientId;
        $state.go(page, {clientId: clientId});
    }

    // Function for Form Wizard tabs
    $scope.navTab = function(index, $event) {
      console.log(index);
      switch(index-1) {
        case 1: 
          if(!($scope.client.storeName && $scope.client.clientEmail && $scope.client.clientPassword && $scope.client.clientPassword && 
            $scope.clientPassword == $scope.clientPassword2)) {
            $('.tab-content .alert-danger').show();
            if($event) {
              $event.preventDefault();
              $event.stopImmediatePropagation();
            }
            return false;
          } else {
            $('.tab-content .alert-danger').hide();
          }
          break;
        case 2:
          if(!($scope.store.taxRate >=0 && $scope.store.waitingMin >=0 && 
              (!$scope.store.delivery || ($scope.store.delivery && $scope.store.deliveryWait >=0 && $scope.store.deliveryFee >=0))
                )) {
            $('.tab-content .alert-danger').show();
            if($event) {
              $event.preventDefault();
              $event.stopImmediatePropagation();
            }
            return false;
          } else {
            $('.tab-content .alert-danger').hide();
          }
          break;
        case 3: 
          if(!( ($scope.store.contactEmail || $scope.store.contactPhone) &&
                ($scope.store.street && ( ($scope.store.city && $scope.store.state) || $scope.store.zip) ) &&
                ($scope.store.password && $scope.store.password2 && $scope.store.password == $scope.store.password2)
            ) ) {
            $('.tab-content .alert-danger').show();
            if($event) {
              $event.preventDefault();
              $event.stopImmediatePropagation();
            }
            return false;
          } else {
            $('.tab-content .alert-danger').hide();
          }
          break;
        case 4: break;
      }

      if((index == -1) && ($scope.currentStep!=1)) 
        $scope.currentStep--;
      else 
        $scope.currentStep = index;
      $('.form-wizard ul li').removeClass('active');
      $('.form-wizard ul li:nth-child('+$scope.currentStep+')').addClass('active');
            $('.tab-pane').hide();
            $('#tab'+$scope.currentStep).show();
    }

    // Function when continue is clicked
    $scope.saveTab = function($event) {
        if (!$scope.currentStep)
          $scope.currentStep=1;
        switch($scope.currentStep) {
          case 1: 
           $scope.navTab(2, $event);
            break;
          case 2:
            $scope.navTab(3, $event)
            break;
          case 3:
            //$('#tab3').hide();
            $scope.navTab(4, $event)
            break;
          case 4:
            //$('#tab4').hide();
            $scope.saveNewClient($event);
            break;
          default: break;
        }
        
    }


    // set sidebar closed and body solid layout mode
    /* OUT OF THE BOX - DO NOT TOUCH */
    $rootScope.settings.layout.pageSidebarClosed = false;
  });
});
