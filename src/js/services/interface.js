angular.module('n52.core.interface', [])
        .service('interfaceService', ['$http', '$q', 'statusService', 'utils', 'interfaceUtilsSrvc',
            function ($http, $q, statusService, utils, interfaceUtilsSrvc) {

                _pimpTs = function (ts, url) {
                    ts.apiUrl = url;
                    ts.internalId = utils.createInternalId(ts.id, url);
                    return ts;
                };

                this.getServices = function (apiUrl) {
                    var isV2 = interfaceUtilsSrvc.isV2(apiUrl);
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'services', interfaceUtilsSrvc.createRequestConfigs({expanded: true})).then(function (response) {
                            if (isV2) {
                                resolve(response.data.services);
                            } else {
                                resolve(response.data);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getStations = function (apiUrl, params) {
                    var url, isV2 = interfaceUtilsSrvc.isV2(apiUrl);
                    if (isV2) {
                        url = apiUrl + 'features/';
                        var extParams = {
                            type: 'stationary',
                            expanded: true
                        };
                        if (angular.isUndefined(params)) {
                            params = extParams;
                        } else {
                            angular.extend(params, extParams);
                        }
                    } else {
                        url = apiUrl + 'stations/';
                    }
                    return $q(function (resolve, reject) {
                        $http.get(url, interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            var stations = [];
                            if (isV2) {
                                angular.forEach(response.data.features, function (feature) {
                                    feature.properties.id = feature.properties.platform;
                                    stations.push(new Station(feature.properties, feature.geometry));
                                });
                                resolve(stations);
                            } else {
                                angular.forEach(response.data, function (entry) {
                                    stations.push(new Station(entry.properties, entry.geometry));
                                });
                                resolve(stations);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getTimeseriesForStation = function (station, apiUrl, params) {
                    var url, isV2 = interfaceUtilsSrvc.isV2(apiUrl);
                    if (isV2) {
                        url = apiUrl + 'platforms/' + interfaceUtilsSrvc.createIdString(station.getId()) + "/series";
                        var extParams = {expanded: true};
                        if (angular.isUndefined(params)) {
                            params = extParams;
                        } else {
                            angular.extend(params, extParams);
                        }
                    } else {
                        url = apiUrl + 'stations/' + interfaceUtilsSrvc.createIdString(station.getId());
                    }
                    return $q(function (resolve, reject) {
                        $http.get(url, interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            if (isV2) {
                                station.properties.timeseries = {};
                                angular.forEach(response.data.series, function (series) {
                                    station.properties.timeseries[series.id] = series.parameters;
                                });
                                resolve(station);
                            } else {
                                station.properties = response.data.properties;
                                resolve(station);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getPhenomena = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'phenomena/' + interfaceUtilsSrvc.createIdString(id), interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            if (interfaceUtilsSrvc.isV2(apiUrl)) {
                                resolve(response.data.phenomena);
                            } else {
                                resolve(response.data);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getCategories = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'categories/' + interfaceUtilsSrvc.createIdString(id), interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            if (interfaceUtilsSrvc.isV2(apiUrl)) {
                                resolve(response.data.categories);
                            } else {
                                resolve(response.data);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getFeatures = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'features/' + interfaceUtilsSrvc.createIdString(id), interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            if (interfaceUtilsSrvc.isV2(apiUrl)) {
                                resolve(response.data.features);
                            } else {
                                resolve(response.data);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getProcedures = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'procedures/' + interfaceUtilsSrvc.createIdString(id), interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            if (interfaceUtilsSrvc.isV2(apiUrl)) {
                                resolve(response.data.procedures);
                            } else {
                                resolve(response.data);
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.search = function (apiUrl, arrayParams) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'search', interfaceUtilsSrvc.createRequestConfigs({
                            q: arrayParams.join(',')
                        })).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                this.getTimeseries = function (id, apiUrl, params) {
                    if (angular.isUndefined(params))
                        params = {};
                    var url, isV2 = interfaceUtilsSrvc.isV2(apiUrl);
                    if (isV2) {
                        url = apiUrl + 'series/' + interfaceUtilsSrvc.createIdString(id);
                    } else {
                        url = apiUrl + 'timeseries/' + interfaceUtilsSrvc.createIdString(id);
                    }
                    params.expanded = true;
                    params.force_latest_values = true;
                    params.status_intervals = true;
                    params.rendering_hints = true;
                    return $q(function (resolve, reject) {
                        $http.get(url, interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            var array = [], series;
                            if (isV2) {
                                if (response.data.hasOwnProperty('series')) {
                                    angular.forEach(response.data.series, function (s) {
                                        array.push(_createV2Timeseries(utils.createInternalId(s.id, apiUrl), apiUrl, s));
                                    });
                                    resolve(array);
                                } else {
                                    resolve(_createV2Timeseries(utils.createInternalId(response.data.id, apiUrl), apiUrl, response.data));
                                }
                            } else {
                                if (angular.isArray(response.data)) {
                                    angular.forEach(response.data, function (ts) {
                                        array.push(_pimpTs(ts, apiUrl));
                                    });
                                    resolve(array);
                                } else {
                                    series = new Timeseries(utils.createInternalId(response.data.id, apiUrl), apiUrl);
                                    angular.extend(series, response.data);
                                    resolve(series);
                                }
                            }
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };

                _createV2Timeseries = function (internalId, url, s) {
                    var series = new Timeseries(internalId, url);
                    angular.extend(series, s);
                    series.parameters.feature = series.parameters.platform;
                    return series;
                };

                this.getTsData = function (id, apiUrl, timespan, extendedData) {
                    var requestUrl, isV2 = interfaceUtilsSrvc.isV2(apiUrl);
                    var params = {
                        generalize: statusService.status.generalizeData || false,
                        expanded: true,
                        format: 'flot'
                    };
                    if (timespan)
                        params.timespan = utils.createRequestTimespan(timespan.start, timespan.end);
                    if (extendedData) {
                        angular.extend(params, extendedData);
                    }
                    if (isV2) {
                        requestUrl = apiUrl + 'series/' + interfaceUtilsSrvc.createIdString(id) + "/getData";
                    } else {
                        requestUrl = apiUrl + 'timeseries/' + interfaceUtilsSrvc.createIdString(id) + "/getData";
                    }
                    return $q(function (resolve, reject) {
                        $http.get(requestUrl, interfaceUtilsSrvc.createRequestConfigs(params)).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            interfaceUtilsSrvc.errorCallback(error, reject);
                        });
                    });
                };
            }])
        .service('interfaceUtilsSrvc', ['settingsService', '$log', function (settingsService, $log) {
                this.isV2 = function (url) {
                    if (url.indexOf('v2') > -1) {
                        return true;
                    } else {
                        return false;
                    }
                };
                this.createRequestConfigs = function (params) {
                    if (angular.isUndefined(params)) {
                        params = settingsService.additionalParameters;
                    } else {
                        angular.extend(params, settingsService.additionalParameters);
                    }
                    return {
                        params: params,
                        cache: true
                    };
                };
                this.errorCallback = function (error, reject) {
                    if (error.data && error.data.userMessage)
                        $log.error(error.data.userMessage);
                    reject(error);
                };
                this.createIdString = function (id) {
                    return (id === null ? "" : id);
                };

                _pimpTs = function (ts, url) {
                    ts.apiUrl = url;
                    ts.internalId = utils.createInternalId(ts.id, url);
                    if (ts.uom === settingsService.undefinedUomString) {
                        delete ts.uom;
                    }
                    return ts;
                };
            }]);
