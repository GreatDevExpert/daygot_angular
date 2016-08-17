/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
MetronicApp.directive('ngSpinnerBar', ['$rootScope',
  function($rootScope) {
    return {
      link: function(scope, element, attrs) {
        // by defult hide the spinner bar
        element.addClass('hide'); // hide spinner bar by default

        // display the spinner bar whenever the route changes(the content part started loading)
        $rootScope.$on('$stateChangeStart', function() {
          element.removeClass('hide'); // show spinner bar
        });

        // hide the spinner bar on rounte change success(after the content loaded)
        $rootScope.$on('$stateChangeSuccess', function() {
          element.addClass('hide'); // hide spinner bar
          $('body').removeClass('page-on-load'); // remove page loading indicator
          Layout.setSidebarMenuActiveLink('match'); // activate selected link in the main menu

          // auto scorll to page top
          setTimeout(function() {
            Metronic.scrollTop(); // scroll to the top on content load
          }, $rootScope.settings.layout.pageAutoScrollOnLoad);
        });

        // handle errors
        $rootScope.$on('$stateNotFound', function() {
          element.addClass('hide'); // hide spinner bar
        });

        // handle errors
        $rootScope.$on('$stateChangeError', function() {
          element.addClass('hide'); // hide spinner bar
        });
      }
    };
  }
])

// Handle global LINK click
MetronicApp.directive('a',
  function() {
    return {
      restrict: 'E',
      link: function(scope, elem, attrs) {
        if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
          elem.on('click', function(e) {
            e.preventDefault(); // prevent link click for above criteria
          });
        }
      }
    };
  });

// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function() {
  return {
    link: function(scope, elem) {
      elem.dropdownHover();
    }
  };
});

MetronicApp.directive('myTable', function() {
  return function(scope, element, attrs) {

    // apply DataTable options, use defaults if none specified by user
    var options = {};
    if (attrs.myTable.length > 0) {
      options = scope.$eval(attrs.myTable);
    } else {
      options = {
        "bStateSave": true,
        "iCookieDuration": 2419200,
        /* 1 month */
        "bJQueryUI": true,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": false,
        "bInfo": false,
        "bDestroy": true
      };
    }

    // Tell the dataTables plugin what columns to use
    // We can either derive them from the dom, or use setup from the controller           
    var explicitColumns = [];
    element.find('th').each(function(index, elem) {
      explicitColumns.push($(elem).text());
    });
    if (explicitColumns.length > 0) {
      options["aoColumns"] = explicitColumns;
    } else if (attrs.aoColumns) {
      options["aoColumns"] = scope.$eval(attrs.aoColumns);
    }

    // aoColumnDefs is dataTables way of providing fine control over column config
    if (attrs.aoColumnDefs) {
      options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
    }

    if (attrs.fnRowCallback) {
      options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
    }

    // apply the plugin
    var dataTable = element.dataTable(options);



    // watch for any changes to our data, rebuild the DataTable
    scope.$watch(attrs.aaData, function(value) {
      var val = value || null;
      if (val) {
        dataTable.fnClearTable();
        dataTable.fnAddData(scope.$eval(attrs.aaData));
      }
    });
  };
});
