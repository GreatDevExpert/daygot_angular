'use strict';

MetronicApp.controller('ClientDashboardController', 
function($state, $stateParams, $rootScope, $scope, $http, $timeout, webService, NgTableParams, result) {
  $scope.clientId = $stateParams ? +$stateParams.clientId : gCurrent.clientId;

  $scope.$on('$viewContentLoaded', function() {
    console.log($scope.clientId);
    $scope.client = result.client;
    $scope.stores = result.stores;
    $scope.agents = result.agents;

    // Initial configure restaurant list table
    $scope.clientTable = new NgTableParams({
        count: 20,
        counts: [],
        sorting: { 'clientId': 'desc', counts: []} // default sorting
    }, {
      dataset: $scope.client
    });

    // Configure store list table
    $scope.setTable = function() {
      $scope.storeTable = new NgTableParams({
          count: 20,
          sorting: { 'storeId': 'desc'} // default sorting
      }, {
          counts: [],
        dataset: $scope.stores
      });
      console.log($scope.stores);
    }
    $scope.setTable();

    $scope.store = {}; //define new object in here
    $scope.store.hourWeekend = 1;
    $scope.store.hours = gDefaultHours;

    $scope.timeslot = gTimeslot; //define timeslot for biz hours from config.js

    /****************** FUNCTIONS ***************/
    // Save client function. Triggers when users save client edit form
    $scope.saveClient = function() {
      webService.postData(gConfig.baseUrl + "client/saveClient", $scope.client).then(function(data) {
        //console.log(data);
        $('#modal_client_edit').modal('hide');
        toastr.options = {
          //"positionClass": "toast-top-center",
          "showMethod": "slideDown",
        }
        // ["color"]["message"]
        // success=green
        toastr["success"]("SAVED SUCCESSFULLY");
        
      })
    }

    $scope.storeAction = function(action, storeId) {
        console.log(temp);
        if($scope.store)
        for(var i=0; i<$scope.stores.length; i++) {
          if(action == 'insert') {
            /*if($scope.client[i].clientId > temp.clientId) {
              $scope.menu.splice(i, 0, group);
              return true;
            }*/
          } else if(action=='delete') {
            if($scope.stores[i].storeId == storeId) {
              $scope.stores.splice(i, 1);
              return true;
            }
          }       
        }
    }

    $scope.clientAction = function(action, clientId) {
        console.log(temp);
        if($scope.client)
        for(var i=0; i<$scope.clients.length; i++) { 
          if(action == 'insert') {
            /*if(thisCategory.categoryName > theStore.categoryName) { 
              $scope.menu[i].categories.splice(j, 0, theStore);
              return true;
            }*/
          } else if(action=='delete') {
            if($scope.clients[i].clientId == clientId) {
              $scope.clients.splice(i, 1);
              return true;
            }
          }
        }
    }

    // Function to delete client
    $scope.deleteClient = function() {
        
        /*var temp ={
          store: $scope.store,
          client: $scope.client
        }*/

        //var itemId = $scope.clientId;

        bootbox.confirm("Are you sure?", function(result){
        if (result){
          //webService.postData(gConfig.baseUrl + "client/deleteClient", temp).then(function(data) {
            webService.postData(gConfig.baseUrl + "client/deleteClient", {clientId: $scope.client.clientId}).then(function(data) {
            //console.log(data);
            $('#modal_client_edit').modal('hide');
             if (data.success){
              toastr["success"]("Client deleted")
             //$scope.clientAction('delete', $scope.client.clientId);
            }else
              //toastr["error"]("Can not delete!")
              bootbox.confirm("Can not delete!") 
          })
        }
      })
    }

    // Save store function. Triggers when users save store edit form
    $scope.saveStore = function() {

      var temp ={
          store: JSON.stringify($scope.store),
          clientId: $scope.clientId
          }

      webService.postData(gConfig.baseUrl + "client/saveStore", temp).then(function(data) {
        //console.log(data);
        $('#modal_store_add').modal('hide');
        toastr.options = {
          //"positionClass": "toast-top-center",
          "showMethod": "slideDown",
        }
        // ["color"]["message"]
        // success=green
        //toastr["success"]("SAVED SUCCESSFULLY");
        if (data.success){
          toastr["success"]("SAVED SUCCESSFULLY");
          //add to insert the new store at the top of the table
          $scope.stores.unshift(data.store);
          $scope.setTable();
          console.log($scope.stores);
        }else
          bootbox.confirm("Can not save!")
        
      })
    }
    // Edit store function. Triggers when users save store edit form
    $scope.editStore = function(storeId) {
      //refer to other edit function. To Do Cham, loop stores to find the matching id.
      //assign it to $scope.store = ........
      if (storeId == 0) {
        $scope.store = {}
      }
      else{
        for(var i=0; i<$scope.stores.length; i++) {
          if($scope.stores[i].storeId == storeId){
            $scope.store = $scope.stores[i];
            $scope.store.hours= JSON.parse($scope.store.hourStr);
            $('#modal_store_add').modal('show');
            return true;
          } 
        }  
      }
    }

    // Function to delete store
    $scope.deleteStore = function(storeId) {
        //var itemId = item.storeId;
        //console.log(item);
        
        bootbox.confirm("Are you sure?", function(result){
        if (result){
          /*for(var i=0; i<$scope.stores.length; i++) {
            if($scope.stores[i].storeId == storeId){
              $scope.store = $scope.stores[i];
              break;
            }
          }*/
          webService.postData(gConfig.baseUrl + "client/deleteStore", {storeId: storeId}).then(function(data) {
            //console.log(data);
            //$('#modal_store_edit').modal('hide');
            if (data.success){
              toastr["success"]("Store deleted")
              //$scope.storeAction('delete', storeId);
            }else
              //toastr["error"]("Can not delete!")
              bootbox.confirm("Can not delete!")            
          })
        } 
      })
    }
        
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;
  });
});

MetronicApp.controller('ClientPromosController', 
function($state, $stateParams, $rootScope, $scope, $http, $timeout, webService, NgTableParams, result) {
  
  $scope.clientId = $stateParams ? +$stateParams.clientId : gCurrent.clientId;
  
  $scope.promos = result.promos;
  $scope.promo = {}; //define new object in here
  console.log($scope.promos);

  // Configure restaurant list table
  $scope.promosTable = new NgTableParams({
      count: 20,
      sorting: { 'promoId': 'desc'} // default sorting
  }, {
      counts: [],
    dataset: $scope.promos
  });

 //pushNotify function.
  $scope.pushNotify = function(promoId) {

    webService.postData(gConfig.baseUrl + "client/sendPromo", {promoId: promoId}).then(function(data) {
      //console.log(data);
      /* data.success is not defined in sendPromo.php
      if (data.success){
        toastr["success"]("Promo notified.")
      }else
        bootbox.confirm("Can not notify!")
      //display alert pop up saying it is failed
      */
    })
  }

  //editPromo function. 
  $scope.editPromo = function(promoId) {
    if (promoId == 0) {
      $scope.promo = {}
    }
    else{
      for(var i=0; i<$scope.promos.length; i++) {
        if($scope.promos[i].promoId == promoId){
          $scope.promo = $scope.promos[i];
          $('#modal_promotion_add').modal('show');
          return true;
        }
      } 
    } 
  }

  //savePromo function. 
  $scope.savePromo = function() {

    $scope.promo.clientId = $scope.clientId;

    webService.postData(gConfig.baseUrl + "client/savePromo", $scope.promo).then(function(data) {
    //console.log(data);
      $('#modal_promotion_add').modal('hide');
      /* Currently data success return is not implemented in savePromo.php
      if (data.success){
        toastr["success"]("Promo saved.")
      }else
        bootbox.confirm("Can not save!")
      //display alert pop up saying it is failed
      */
    })
  }

  //deletePromo function. 
  $scope.deletePromo = function(promoId) {

    bootbox.confirm("Are you sure?", function(result){
      if (result){
        webService.postData(gConfig.baseUrl + "client/deletePromo", {promoId: promoId}).then(function(data) {
        //console.log(data);
        if (data.success){
          toastr["success"]("Promo deleted.")
        }else
          bootbox.confirm("Can not delete!")
        //display alert pop up saying it is failed
        })
      }
    })
  }

});