'use strict';

MetronicApp.controller('MenuController',
  function($state, $stateParams, $rootScope, $scope, $http, $timeout, NgTableParams, result, webService) {
    $scope.$on('$viewContentLoaded', function() {
      $scope.clientId = +$stateParams.clientId;
      console.log($scope.clientId);
      $scope.menu = result.menu;

      function getCategory(categoryId) {
        for(var i=0; i<$scope.menu.length; i++) {
          for(var j=0; j<$scope.menu[i].categories.length; j++) {
            if($scope.menu[i].categories[j].categoryId == categoryId)
              return $scope.menu[i].categories[j];
          }
        }
      }

      function initialize() {
        // Build category select options - used in menu edit
        $scope.categoryOptions = [];
        $scope.itemOptions = [];
        for(var i=0; i<$scope.menu.length; i++) {
        	//$scope.categoryOptions.push({'categoryName': '','disabled': true})
        	$scope.categoryOptions.push({
        		'categoryName': $scope.menu[i].categoryGroupName,
        		'disabled': true
        	})
        	for(var j=0; j<$scope.menu[i].categories.length; j++) {
        		$scope.categoryOptions.push({
        			'categoryId': $scope.menu[i].categories[j].categoryId,
        			'categoryName': $scope.menu[i].categories[j].categoryName,
        			'disabled': false,
        		})
        		for(var k=0; k<$scope.menu[i].categories[j].items.length; k++) {
        			if($scope.menu[i].categories[j].items[k].optionObj) {
        				$scope.itemOptions.push({
        					'itemId': $scope.menu[i].categories[j].items[k].itemId,
        					'itemName': $scope.menu[i].categories[j].items[k].itemName,
        					'optionObj': $scope.menu[i].categories[j].items[k].optionObj
        				});
        			}
        		}
        	}
        }
      }


      $scope.toggleCategory = function(categoryId) {
      	console.log(categoryId);
      	$('.category_' + categoryId + ' ul').slideToggle(100);
      }

      //cham, created 10/22/2015  
      $scope.editCategoryGroup = function(categoryGroup, categoryGroupId) {

        if(categoryGroup)
          $scope.categoryGroup = categoryGroup;
        else {
          $scope.categoryGroup = {};
          console.log(categoryGroupId);
          $scope.categoryGroup.categoryGroupId = categoryGroupId;
        }
        //$('#modal_category_group_edit').modal('show');
        setTimeout(function() {
          $('input.categoryGroupName').focus();
        }, 500);
      }

      //cham, created 10/22/2015 
      $scope.editCategory = function(category, groupId) {
      	if(category)
      		$scope.category = category;
      	else {
      		$scope.category = {};
      		console.log(groupId);
      		$scope.category.categoryGroupId = groupId;
      	}
      	$('#modal_category_edit').modal('show');
      	setTimeout(function() {
      		$('input.categoryName').focus();
      	}, 500);
      }

      $scope.editItem = function(item, categoryId) {
        $scope.myImage='';
        $scope.myCroppedImage='';
        $scope.imageEditMode = false;

      	if(item) {
      		$scope.item = item;
          // PY - Get image
          if(item.imagePath) {
            $scope.item.imageUrl = gConfig.imagePath + 'item/' + $scope.clientId + "/" + item.itemId + ".jpg";
          }
        }
      	else{ //if new item then reset below objects
      		$scope.item = {};
          $scope.item.categoryId = categoryId;
          console.log($scope.item);
          $scope.options = {};
        }
     	  $('#modal_item_edit').modal('show');

        //convert optionObj using JSON then assign it to options, PY
        $scope.options = item.optionObj ? JSON.parse(item.optionObj) : [];
        //console.log($scope.options); //cham test
      }

      $scope.importOption = function() {
        $scope.options = JSON.parse($scope.importId);
        // START WORKING HERE MR.HAM

        // TO REVERT $scope.options back to string
        var tempObj = JSON.stringify($scope.options);
        $scope.item.optionObj = tempObj;
      }

      $scope.itemAction = function(action, item) {
        if($scope.menu)
        for(var i=0; i<$scope.menu.length; i++) {
          if($scope.menu[i].categories)
          for(var j=0; j<$scope.menu[i].categories.length; j++) {
            //console.log($scope.menu[i].categories[j]);
            if($scope.menu[i].categories[j].categoryId == item.categoryId)
            {
              if($scope.menu[i].categories[j].items && item.categoryId == $scope.menu[i].categories[j].categoryId) {
                for(var k=0; k<$scope.menu[i].categories[j].items.length; k++) { 
                  var thisItem = $scope.menu[i].categories[j].items[k];
                  
                  if(action == 'insert') {
                    if(thisItem.itemName > item.itemName) { //compare alphabet
                      $scope.menu[i].categories[j].items.splice(k, 0, item);
                      return true;
                    }
                  } else if(action == 'delete') {
                    if(thisItem.itemId == item.itemId) {
                      $scope.menu[i].categories[j].items.splice(k, 1);
                      return true;
                    }
                  }
                }
                if(action == 'insert') {
                  $scope.menu[i].categories[j].items.push(item);
                  return true;
                }
              }
            }
          }
        }
      }

      $scope.categoryAction = function(action, category) {
        console.log(category);
        if($scope.menu)
        for(var i=0; i<$scope.menu.length; i++) {
          if($scope.menu[i].categories && category.categoryGroupId == $scope.menu[i].categoryGroupId) {
            for(var j=0; j<$scope.menu[i].categories.length; j++) {
              var thisCategory = $scope.menu[i].categories[j];

              if(action == 'insert') {
                if(thisCategory.categoryName > category.categoryName) { //compare alphabet
                  $scope.menu[i].categories.splice(j, 0, category);
                  return true;
                }
              } else if(action=='delete') {
                if(thisCategory.categoryId > category.categoryId) { //compare alphabet
                  $scope.menu[i].categories.splice(j, 1);
                  return true;
                }
              }
            }
            if(action == 'insert') {
              $scope.menu[i].categories.push(category);
              return true;
            }
          }

        }
      }

      $scope.categoryGroupAction = function(action, group) {
        console.log(group);
        if($scope.menu)
        for(var i=0; i<$scope.menu.length; i++) {
          if(action == 'insert') {
            if($scope.menu[i].categoryGroupName > group.categoryGroupName) {
              $scope.menu.splice(i, 0, group);
              return true;
            }
          } else if(action=='delete') {
            if($scope.menu[i].categoryGroupId == group.categoryGroupId) {
              $scope.menu.splice(i, 1);
              return true;
            }
          }       
        }
        if(action == 'insert') {
          $scope.menu.push(group);
        }
      }

      // Save item object function. Triggers when users save menu item form
      $scope.saveItem = function() {

        // TO REVERT $scope.options back to string
        var tempObj = JSON.stringify($scope.options);
        $scope.item.clientId = $scope.clientId;
        $scope.item.optionObj = tempObj;
        if($scope.item.imageBlob)
          $scope.item.imagePath = true;

        webService.postData(gConfig.baseUrl + "menu/saveItem", $scope.item).then(function(data) {
          //console.log(data);
          $('#modal_item_edit').modal('hide');
          toastr.options = {
            //"positionClass": "toast-top-center",
            "showMethod": "slideDown",
          }
          // ["color"]["message"]
          // success=green
          toastr["success"]("SAVED SUCCESSFULLY");
          if(!$scope.item.itemId)
            $scope.itemAction('insert', data.item);
          
        })
      }

      //cham, created 10/22/2015 To save Category object function. Triggers when users save menu item form
      $scope.saveCategory = function() {
        $scope.category.clientId = $scope.clientId;

        webService.postData(gConfig.baseUrl + "menu/saveCategory", $scope.category).then(function(data) {
          //console.log(data);
          $('#modal_category_edit').modal('hide');
          toastr.options = {
            //"positionClass": "toast-top-center",
            "showMethod": "slideDown",
          }
          // ["color"]["message"]
          // success=green
          toastr["success"]("SAVED SUCCESSFULLY");
          if(!$scope.category.categoryId)
            $scope.categoryAction('insert', data.category);
          console.log($scope.menu[3]);
        })
      }

      //cham, created 10/22/2015 To save CategoryGroup object function. Triggers when users save menu item form
      $scope.saveCategoryGroup = function() {
        $scope.categoryGroup.clientId = $scope.clientId;
                
        webService.postData(gConfig.baseUrl + "menu/saveCategoryGroup", $scope.categoryGroup).then(function(data) {
          if(data.success) {
            $('#modal_category_group_edit').modal('hide');
            toastr.options = {
              //"positionClass": "toast-top-center",
              "showMethod": "slideDown",
            }
            // ["color"]["message"]
            // success=green
            toastr["success"]("SAVED SUCCESSFULLY");
            if(!$scope.categoryGroup.categoryGroupId) {
              $scope.categoryGroupAction('insert', data.categoryGroup);
            }
          }
        })
      }

      $scope.deleteItem = function(item) { //must send object when sending variable to the php funciton e.g. {itemId: itemId}
        var itemId = item.itemId;
        bootbox.confirm("Are you sure?", function(result){
          if (result){
            webService.postData(gConfig.baseUrl + "menu/deleteItem", {itemId: itemId} ).then(function(data) {
              if (data.success){
                toastr["success"]("Item deleted");
                $scope.itemAction('delete', item);
              }else
                bootbox.confirm("Can not delete!")     
            })
          } 
        });
                
      }

      $scope.deleteCategory = function(category) {
        var categoryId = category.categoryId;
        bootbox.confirm("Are you sure?", function(result){
          if (result){
            webService.postData(gConfig.baseUrl + "menu/deleteCategory", {categoryId: categoryId} ).then(function(data) {
              if (data.success){
                toastr["success"]("Category deleted");
                $scope.categoryAction('delete', category);
                console.log($scope.menu[3]);
              }else
                bootbox.confirm("Can not delete!")     
            })
          } 
        });
        /*webService.postData(gConfig.baseUrl + "menu/deleteCategory", {categoryId: categoryId} ).then(function(data) {
          toastr["success"]("category deleted");
        })*/
      }

      $scope.deleteCategoryGroup = function(categoryGroup) {
        var categoryGroupId = categoryGroup.categoryGroupId;
        bootbox.confirm("Are you sure?", function(result){
          if (result){
            webService.postData(gConfig.baseUrl + "menu/deleteCategoryGroup", {categoryGroupId: categoryGroupId} ).then(function(data) {
              if (data.success){
                toastr["success"]("CategoryGroup deleted");
                $scope.categoryGroupAction('delete', categoryGroup);
                $(".categoryGroup_"+categoryGroupId).hide(); //deleting the passed categoryGroupId using Jquery; 
              }else
                bootbox.confirm("Can not delete!")     
            })
          } 
        });
        /*webService.postData(gConfig.baseUrl + "menu/deleteCategoryGroup.php", {categoryGroupId: categoryGroupId} ).then(function(data) {
          toastr["success"]("CategoryGroup deleted");
        })*/
      }

      $scope.deleteOptionGroup = function(index) {
        bootbox.confirm("Delete the entire option group?", function(result){
          if (result){
            console.log(index);
            $scope.$apply(function () {
              $scope.options.splice(index, 1);
            });
          } 
        });
      }

      $scope.deleteOption = function(groupIndex, index) {
        $scope.options[groupIndex].options.splice(index, 1);
      }

      $scope.addOptionGroup = function() {
        var index = $scope.options ? $scope.options.length : 0;
        index++;
        $scope.options.push({
          name: 'Option Group ' + index,
          main: 0,
          multi: 1,
          max: 0
        })

      }

      $scope.addOption = function(index) {
        console.log($scope.options, index);
        $scope.options[index].options.push({
          n: '',
          p: 0
        })
      }

      $scope.toggleOptionGroup = function($event) {
        console.log($event);
        var target = $($event.target);
        target.closest('.panel-heading').find('.optionHeader').slideToggle(300);
      }

      /* PY - on image upload extract the file data and assign to $scope.item.imageFile */
        var handleFileSelect=function(evt) {
          var file=evt.currentTarget.files[0];
          var reader = new FileReader();
          reader.onload = function (evt) {
            $scope.$apply(function($scope){
              $scope.imageEditMode = true;
              $scope.myImage=evt.target.result;
            });
          };
          reader.readAsDataURL(file);
        };

        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

        $scope.cropImage = function($dataURI) {
            $scope.item.imageBlob = $dataURI;
        }


      // Initialize
      initialize();
      $scope.item = {};
      //$('#modal_item_edit').modal('show');

      //$scope.insertItem({itemId: 999, itemName: 'Chow Test', categoryId: 282}) //cham commented out 10/27/2015


    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;
  });
