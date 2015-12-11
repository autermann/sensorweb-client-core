angular.module('n52.core.listSelection')
        .controller('SwcListSelectionCtrl', ['$scope', 'interfaceService', 'statusService', 'timeseriesService',
            function ($scope, interfaceService, statusService, timeseriesService) {
                angular.forEach($scope.parameters, function (param, openedIdx) {
                    $scope.$watch('parameters[' + openedIdx + '].isOpen', function (newVal) {
                        if (newVal) {
                            $scope.selectedParameterIndex = openedIdx;
                            $scope.disableFollowingParameters();
                        }
                    });
                });

                $scope.createParams = function () {
                    var params = {
                        service: statusService.status.apiProvider.serviceID
                    };
                    angular.forEach($scope.parameters, function (parameter) {
                        if (parameter.selectedId) {
                            params[parameter.type] = parameter.selectedId;
                        }
                    });
                    return params;
                };

                $scope.getItems = function (currParam) {
                    if (currParam.type === 'category') {
                        interfaceService.getCategories(null, statusService.status.apiProvider.url, $scope.createParams()).then(function (data) {
                            currParam.items = data;
                        });
                    } else if (currParam.type === 'feature') {
                        interfaceService.getFeatures(null, statusService.status.apiProvider.url, $scope.createParams()).then(function (data) {
                            currParam.items = data;
                        });
                    } else if (currParam.type === 'phenomenon') {
                        interfaceService.getPhenomena(null, statusService.status.apiProvider.url, $scope.createParams()).then(function (data) {
                            currParam.items = data;
                        });
                    } else if (currParam.type === 'procedure') {
                        interfaceService.getProcedures(null, statusService.status.apiProvider.url, $scope.createParams()).then(function (data) {
                            currParam.items = data;
                        });
                    }
                };

                $scope.openNext = function (currentIdx) {
                    $scope.parameters[currentIdx].isDisabled = false;
                    $scope.selectedParameterIndex = currentIdx;
                    if (currentIdx - 1 >= 0)
                        $scope.parameters[currentIdx - 1].isOpen = false;
                    $scope.parameters[currentIdx].isOpen = true;
                    $scope.getItems($scope.parameters[currentIdx]);
                };

                $scope.disableFollowingParameters = function () {
                    angular.forEach($scope.parameters, function (param, idx) {
                        if (idx > $scope.selectedParameterIndex) {
                            param.isDisabled = true;
                            param.isOpen = false;
                            delete param.selectedId;
                            delete param.items;
                        }
                        if (idx >= $scope.selectedParameterIndex) {
                            delete param.headerAddition;
                        }
                    });
                };

                $scope.openItem = function (item, paramIndex) {
                    if (angular.isNumber(paramIndex))
                        $scope.selectedParameterIndex = paramIndex;
                    $scope.disableFollowingParameters();
                    $scope.addItem(item, $scope.selectedParameterIndex);
                    $scope.deselectItems($scope.parameters[$scope.selectedParameterIndex].items);
                    item.selected = true;
                    if ($scope.selectedParameterIndex < $scope.parameters.length - 1) {
                        $scope.openNext($scope.selectedParameterIndex + 1);
                    } else {
                        $scope.addToDiagram($scope.createParams());
                    }
                };
                
                $scope.addItem = function (item, idx) {
                    var parameters = $scope.parameters[idx];
                    parameters.selectedId = item.id;
                    parameters.headerAddition = item.label;
                };

                $scope.deselectItems = function (items) {
                    angular.forEach(items, function (item) {
                        item.selected = false;
                    });
                };

                $scope.addToDiagram = function (params) {
                    timeseriesService.addTimeseriesById(null, statusService.status.apiProvider.url, params);
                };

                $scope.openNext(0);
            }]);