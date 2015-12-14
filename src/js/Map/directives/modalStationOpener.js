angular.module('n52.core.map')
        .directive('swcModalStationOpener', [
            function () {
                return {
                    restrict: 'E',
                    scope: {
                        mapid: '=',
                        controller: '='
                    },
                    controller: ['$scope', '$uibModal', '$rootScope', 'mapService',
                        function ($scope, $uibModal, $rootScope, mapService) {
                            clickmarker = function (event, args) {
                                $uibModal.open({
                                    animation: true,
                                    templateUrl: 'templates/map/station.html',
                                    resolve: {
                                        selection: function () {
                                            var station;
                                            var url;
                                            if (args.model) {
                                                station = args.model.station ? args.model.station : "";
                                                url = args.model.url ? args.model.url : "";
                                            } else if (args.leafletObject && args.leafletObject.options) {
                                                station = args.leafletObject.options.station ? args.leafletObject.options.station : "";
                                                url = args.leafletObject.options.url ? args.leafletObject.options.url : "";
                                            }
                                            return {
                                                station: station,
                                                phenomenonId: mapService.map.selectedPhenomenonId,
                                                url: url
                                            };
                                        }
                                    },
                                    controller: $scope.controller
                                });
                            };
                            var mapId = $scope.mapid;
                            var pathClickListener = $rootScope.$on('leafletDirectivePath.' + mapId + '.click', clickmarker);
                            var markerClickListener = $rootScope.$on('leafletDirectiveMarker.' + mapId + '.click', clickmarker);
                            $scope.$on('$destroy', function () {
                                pathClickListener();
                                markerClickListener();
                            });
                        }]
                };
            }]);