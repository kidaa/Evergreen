/**
  * UI tools and directives.
  */
angular.module('egUiMod', ['egCoreMod', 'ui.bootstrap'])


/**
 * <input focus-me="iAmOpen"/>
 * $scope.iAmOpen = true;
 */
.directive('focusMe', 
       ['$timeout','$parse', 
function($timeout , $parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                if(value === true) 
                    $timeout(function() {element[0].focus()});
            });
            element.bind('blur', function() {
                scope.$apply(model.assign(scope, false));
            })
        }
    };
}])

/**
 * <input blur-me="pleaseBlurMe"/>
 * $scope.pleaseBlurMe = true
 * Useful for de-focusing when no other obvious focus target exists
 */
.directive('blurMe', 
       ['$timeout','$parse', 
function($timeout , $parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.blurMe);
            scope.$watch(model, function(value) {
                if(value === true) 
                    $timeout(function() {element[0].blur()});
            });
            element.bind('focus', function() {
                scope.$apply(model.assign(scope, false));
            })
        }
    };
}])


// <input select-me="iWantToBeSelected"/>
// $scope.iWantToBeSelected = true;
.directive('selectMe', 
       ['$timeout','$parse', 
function($timeout , $parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.selectMe);
            scope.$watch(model, function(value) {
                if(value === true) 
                    $timeout(function() {element[0].select()});
            });
            element.bind('blur', function() {
                scope.$apply(model.assign(scope, false));
            })
        }
    };
}])


// 'reverse' filter 
// <div ng-repeat="item in items | reverse">{{item.name}}</div>
// http://stackoverflow.com/questions/15266671/angular-ng-repeat-in-reverse
// TODO: perhaps this should live elsewhere
.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
})


/**
 * egAlertDialog.open({message : 'hello {{name}}'}).result.then(
 *     function() { console.log('alert closed') });
 */
.factory('egAlertDialog', 

        ['$modal','$interpolate',
function($modal , $interpolate) {
    var service = {};

    service.open = function(message, msg_scope) {
        return $modal.open({
            templateUrl: './share/t_alert_dialog',
            controller: ['$scope', '$modalInstance',
                function($scope, $modalInstance) {
                    $scope.message = $interpolate(message)(msg_scope);
                    $scope.ok = function() {
                        if (msg_scope && msg_scope.ok) msg_scope.ok();
                        $modalInstance.close()
                    }
                }
            ]
        });
    }

    return service;
}])

/**
 * egConfirmDialog.open("some message goes {{here}}", {
 *  here : 'foo', ok : function() {}, cancel : function() {}});
 */
.factory('egConfirmDialog', 
    
       ['$modal','$interpolate',
function($modal, $interpolate) {
    var service = {};

    service.open = function(title, message, msg_scope) {
        return $modal.open({
            templateUrl: './share/t_confirm_dialog',
            controller: ['$scope', '$modalInstance',
                function($scope, $modalInstance) {
                    $scope.title = $interpolate(title)(msg_scope);
                    $scope.message = $interpolate(message)(msg_scope);
                    $scope.ok = function() {
                        if (msg_scope.ok) msg_scope.ok();
                        $modalInstance.close()
                    }
                    $scope.cancel = function() {
                        if (msg_scope.cancel) msg_scope.cancel();
                        $modalInstance.dismiss();
                    }
                }
            ]
        })
    }

    return service;
}])

/**
 * egPromptDialog.open(
 *    "prompt message goes {{here}}", 
 *    promptValue,  // optional
 *    {
 *      here : 'foo',  
 *      ok : function(value) {console.log(value)}, 
 *      cancel : function() {console.log('prompt denied')}
 *    }
 *  );
 */
.factory('egPromptDialog', 
    
       ['$modal','$interpolate',
function($modal, $interpolate) {
    var service = {};

    service.open = function(message, promptValue, msg_scope) {
        return $modal.open({
            templateUrl: './share/t_prompt_dialog',
            controller: ['$scope', '$modalInstance',
                function($scope, $modalInstance) {
                    $scope.message = $interpolate(message)(msg_scope);
                    $scope.args = {value : promptValue || ''};
                    $scope.focus = true;
                    $scope.ok = function() {
                        if (msg_scope.ok) msg_scope.ok($scope.args.value);
                        $modalInstance.close()
                    }
                    $scope.cancel = function() {
                        if (msg_scope.cancel) msg_scope.cancel();
                        $modalInstance.dismiss();
                    }
                }
            ]
        })
    }

    return service;
}])

.directive('aDisabled', function() {
    return {
        restrict : 'A',
        compile: function(tElement, tAttrs, transclude) {
            //Disable ngClick
            tAttrs["ngClick"] = ("ng-click", "!("+tAttrs["aDisabled"]+") && ("+tAttrs["ngClick"]+")");

            //Toggle "disabled" to class when aDisabled becomes true
            return function (scope, iElement, iAttrs) {
                scope.$watch(iAttrs["aDisabled"], function(newValue) {
                    if (newValue !== undefined) {
                        iElement.toggleClass("disabled", newValue);
                    }
                });

                //Disable href on click
                iElement.on("click", function(e) {
                    if (scope.$eval(iAttrs["aDisabled"])) {
                        e.preventDefault();
                    }
                });
            };
        }
    };
})

.directive('egBasicComboBox', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            list: "=", // list of strings
            selected: "="
        },
        template:
            '<div class="input-group">'+
                '<input type="text" class="form-control" ng-model="selected">'+
                '<div class="input-group-btn">'+
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'+
                    '<ul class="dropdown-menu dropdown-menu-right" role="menu">'+
                        '<li ng-repeat="item in list" class="input-lg"><a href="#" ng-click="changeValue(item)">{{item}}</a></li>'+
                    '</ul>'+
                '</div>'+
            '</div>',
        controller: ['$scope',
            function($scope) {

                $scope.changeValue = function (newVal) {
                    $scope.selected = newVal;
                }

            }
        ]
    };
})

/**
 * Nested org unit selector modeled as a Bootstrap dropdown button.
 */
.directive('egOrgSelector', function() {
    return {
        restrict : 'AE',
        transclude : true,
        replace : true, // makes styling easier
        scope : {
            selected : '=', // defaults to workstation or root org
            
            // Each org unit is passed into this function and, for
            // any org units where the response value is true, the
            // org unit will not be added to the selector.
            hiddenTest : '=',

            // Each org unit is passed into this function and, for
            // any org units where the response value is true, the
            // org unit will not be available for selection.
            disableTest : '=',

            // Caller can either $watch(selected, ..) or register an
            // onchange handler.
            onchange : '=',

            // optional primary drop-down button label
            label : '@'
        },

        // any reason to move this into a TT2 template?
        template : 
            '<div class="btn-group eg-org-selector" dropdown>'
            + '<button type="button" class="btn btn-default dropdown-toggle">'
             + '<span style="padding-right: 5px;">{{getSelectedName()}}</span>'
             + '<span class="caret"></span>'
           + '</button>'
           + '<ul class="dropdown-menu">'
             + '<li ng-repeat="org in orgList" ng-hide="hiddenTest(org.id)">'
               + '<a href ng-click="orgChanged(org)" a-disabled="disableTest(org.id)" '
                 + 'style="padding-left: {{org.depth * 10 + 5}}px">'
                 + '{{org.shortname}}'
               + '</a>'
             + '</li>'
           + '</ul>'
          + '</div>',

        controller : ['$scope','$timeout','egOrg','egAuth',
              function($scope , $timeout , egOrg , egAuth) {

            // avoid linking the full fleshed tree to the scope by 
            // tossing in a flattened list.
            $scope.orgList = egOrg.list().map(function(org) {
                return {
                    id : org.id(),
                    shortname : org.shortname(), 
                    depth : org.ou_type().depth()
                }
            });

            $scope.getSelectedName = function() {
                if ($scope.selected)
                    return $scope.selected.shortname();
                return $scope.label;
            }

            $scope.orgChanged = function(org) {
                $scope.selected = egOrg.get(org.id);
                if ($scope.onchange) $scope.onchange($scope.selected);
            }

            if (!$scope.selected)
                $scope.selected = egOrg.get(egAuth.user().ws_ou());
        }]
    }
})


/*
http://stackoverflow.com/questions/18061757/angular-js-and-html5-date-input-value-how-to-get-firefox-to-show-a-readable-d

This directive allows us to use html5 input type="date" (for Chrome) and 
gracefully fall back to a regular ISO text input for Firefox.
It also allows us to abstract away some browser finickiness.
*/
.directive(
    'egDateInput',
    function(dateFilter) {
        return {
            require: 'ngModel',
            template: '<input type="date"></input>',
            replace: true,
            link: function(scope, elm, attrs, ngModelCtrl) {

                // since this is a date-only selector, set the time
                // portion to 00:00:00, which should better match the
                // user's expectations.  Note this allows us to retain
                // the timezone.
                function strip_time(date) {
                    if (!date) date = new Date();
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    return date;
                }

                ngModelCtrl.$formatters.unshift(function (modelValue) {
                    // apply strip_time here in case the user never 
                    // modifies the date value.
                    return dateFilter(strip_time(modelValue), 'yyyy-MM-dd');
                });
                
                ngModelCtrl.$parsers.unshift(function(viewValue) {
                    return strip_time(new Date(viewValue));
                });
            },
        };
})
