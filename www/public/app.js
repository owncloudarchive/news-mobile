(function(angular, $, undefined){

'use strict';

/**
 * Copyright (c) 2013, Bernhard Posselt <nukeawhale@gmail.com> 
 * Copyright (c) 2013, Alessandro Cosentino <cosenal@gmail.com> 
 * Copyright (c) 2013, Ilija Lazarevic <ikac.ikax@gmail.com> 
 * This file is licensed under the Affero General Public License version 3 or later. 
 * See the COPYING file.
 */

// this file is just for defining the main container to easily swap this in
// tests
angular.module('News', []);
// define your routes in here
angular.module('News').config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/', {
        templateUrl:'main.html',
        controller:'MainController'

    }).when('/login', {
            templateUrl:'login.html',
            controller:'LoginController'

        }).otherwise({
            redirectTo:'/'
        });

}]);
angular.module('News').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

angular.module('News').config(function($provide) {
    $provide.decorator("$exceptionHandler", function($delegate) {
        return function(exception, cause) {
            $delegate(exception, cause);
            alert(exception.message);
        };
    });
});

angular.module('News').controller('LoginController',
    ['$scope', '$location', '$route' , 'LoginService', 'UserService', 'ExceptionsService',
        function ($scope, $location, $route, LoginService, UserService, ExceptionsService) {

            $scope.data = UserService;

            $scope.testFormFields = function () {
                var hostNameRegExp = new RegExp(/^https?:\/\/.*$/); ///^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                var userNameRegExp = new RegExp(/^[a-z0-9_-]{3,10}$/); // /^[a-z0-9_-]{3,16}$/
                var passwordRegExp = new RegExp(/^[a-z0-9_-]{3,10}$/); // /^[a-z0-9_-]{6,18}$/

                var userNameParseResult = userNameRegExp.test(UserService.userName);

                $scope.userNameError = '';
                $scope.passwordError = '';
                $scope.hostNameError = '';

                if (!userNameParseResult) {
                    $scope.userNameError = "User name is not in correct format!";
                }

                var passwordParseResult = passwordRegExp.test(UserService.password);

                if (!passwordParseResult) {
                    $scope.passwordError = "Password is not in correct format!";
                }

                var hostNameParseResult = hostNameRegExp.test(UserService.hostName);

                if (!hostNameParseResult) {
                    $scope.hostNameError = "Host name is not in correct format!";
                }

                if (hostNameParseResult && userNameParseResult && passwordParseResult) {
                    return true;
                }
                return false;
            };

            $scope.logIn = function () {
                if ($scope.testFormFields()) {
                    LoginService.login()
                        .success(function (data, status) {
                            if (status === 200) {
                                LoginService.present = true;
                                $location.path("/");
                            }
                        })
                        .error(function (data, status) {
                            ExceptionsService.makeNewException(data, status);
                        });
                }
            };

            $scope.isLoggedIn = function () {
                if (LoginService.present) {
                    $location.path("/");
                }
            };

        }]);

angular.module('News').controller('MainController',
    ['$scope', '$location', 'LoginService', 'ItemsService', 'FoldersService', 'FeedsService',
        function ($scope, $location, LoginService, ItemsService, FoldersService, FeedsService) {

            $scope.view = ''; // view is way the results are presented, all and starred is equal
            $scope.action = ''; // action is button pressed to get the populated list
            $scope.folderId = '0';
            $scope.feedId = '0';
            $scope.currentFolderName = '';
            $scope.currentFeedTitle = '';

            $scope.moreArticles = true;
            var articlesGet = 0;

            $scope.getStarred = function (offset) {
                $scope.action = 'Starred';
                $scope.moreArticles = true;
                ItemsService.getStarredItems(offset)
                    .then(function (result) {
                        $scope.view = 'All';
                        $scope.data = result.data;
                        articlesGet = result.data.items.length;
                    });
            };

            $scope.getAll = function (offset) {
                $scope.action = 'All';
                $scope.moreArticles = true;
                ItemsService.getAllItems(offset)
                    .then(function (result) {
                        $scope.view = 'All';
                        $scope.data = result.data;
                        articlesGet = result.data.items.length;
                    });
            };

            $scope.getFolders = function () {
                $scope.action = 'Folders';
                FoldersService.getFolders()
                    .success(function (data, status) {
                        $scope.data = data;
                        $scope.view = 'Folders';
                    })
                    .error(function (data, status) {
                        alert("Status " + status + " [" + data.message + "]");
                    });
            };

            $scope.getFeeds = function () {
                $scope.action = 'Feeds';
                FeedsService.getFeeds()
                    .success(function (data, status) {
                        $scope.data = data;
                        $scope.view = 'Feeds';
                    })
                    .error(function (data, status) {
                        alert("Status " + status + " [" + data.message + "]");
                    });
            };

            $scope.getFolderItems = function (folderId, offset, folderName) {
                $scope.action = 'FolderItems';
                $scope.folderId = folderId;
                $scope.currentFolderName = folderName;
                $scope.moreArticles = true;

                FoldersService.getFolderItems(folderId, offset)
                    .then(function (result) {
                        $scope.view = 'All';
                        $scope.data = result.data;
                        articlesGet = result.data.items.length;
                    });
            };

            $scope.getFeedItems = function (feedId, offset, feedTitle) {
                $scope.action = 'FeedItems';
                $scope.feedId = feedId;
                $scope.currentFeedTitle = feedTitle;
                $scope.moreArticles = true;

                FeedsService.getFeedItems(feedId, offset)
                    .then(function (result) {
                        $scope.view = 'All';
                        $scope.data = result.data;
                        articlesGet = result.data.items.length;
                    });
            };

            $scope.getMoreItems = function (type) {
                var offset = $scope.data.items.slice(-1)[0].id - 1;

                if (offset === 0 || articlesGet < 20) {
                    $scope.moreArticles = false;
                    return false;
                }

                if ($scope.action === 'All') {
                    ItemsService.getAllItems(offset)
                        .then(function (result) {
                            articlesGet = result.data.items.length;
                            for (var i in result.data.items) {
                                $scope.data.items.push(result.data.items[i]);
                            }
                        });
                }
                else if ($scope.action === 'Starred') {
                    ItemsService.getStarredItems(offset)
                        .then(function (result) {
                            articlesGet = result.data.items.length;
                            for (var i in result.data.items) {
                                $scope.data.items.push(result.data.items[i]);
                            }
                        });
                }
                else if (type === 'All' && $scope.action === 'FolderItems') {
                    FoldersService.getFolderItems($scope.folderId, offset).then(function (result) {
                        articlesGet = result.data.items.length;
                        for (var i in result.data.items) {
                            $scope.data.items.push(result.data.items[i]);
                        }
                    });
                }
                else if (type === 'All' && $scope.action === 'FeedItems') {
                    FeedsService.getFeedItems($scope.feedId, offset).then(function (result) {
                        articlesGet = result.data.items.length;
                        for (var i in result.data.items) {
                            $scope.data.items.push(result.data.items[i]);
                        }
                    });
                }

            };

            $scope.logOut = function () {
                LoginService.present = false;
                LoginService.killTimer();
                $location.path('/login');
            };

            if (LoginService.present) {
                //console.log('This');
                $scope.getAll(0);
            }

        }]);



angular.module('News').directive('checkPresence',
    ['$http', '$location', '$timeout', 'LoginService',
        function ($http, $location, $timeout, LoginService) {
            return {
                restrict:"E",
                link:function tick() {
                    //console.log("direktiva");
                    if (LoginService.timerRef) {
                        LoginService.killTimer();
                    }
                    if (!LoginService.present) {
                        $location.path('/login');
                    }
                    else {
                        LoginService.login()
                            .success(function (data, status) {
                                if (status === 200) {
                                    //alert("Status "+status+" ["+data.message+"]");
                                    $location.path('/');
                                }
                                else {
                                    alert("Status " + status + " [" + data.message + "]");
                                    LoginService.killTimer();
                                    $location.path('/login');
                                }
                            })
                            .error(function (data, status) {
                                alert("Status " + status + " [" + data.message + "]");
                                LoginService.killTimer();
                                $location.path('/login');
                            });
                    }
                    LoginService.timerRef = $timeout(tick, LoginService.timeout);
                    //console.log("ping");
                }
            };
        }]);


angular.module('News').filter('translator', ['$locale', function ($locale) {

	return function (text) {
        if($locale.id === "sr-rs") {
            switch (text) {
                case "Username" :
                    return "Korisnicko ime";
                case "Password" :
                    return "Lozinka";
                case "Hostname" :
                    return "Lokacija servera";
                case "Sign in" :
                    return "Prijavi se";
                case "All":
                    return "Sve";
                case "Starred":
                    return "Favoriti";
                case "Folders":
                    return "Folderi";
                case "Show more":
                    return 'Prikazi jos';
                default:
                    return text;
            }

        } else if($locale.id == "en-us") {
            return text;
        }
	};

}]);

angular.module('News').factory('ExceptionsService',
    [function () {
        return {
            makeNewException:function (data, status) {
                throw {message:data.message};
            }
        };
    }]);

angular.module('News').factory('FeedsService',
    ['$http', 'UserService', 'ExceptionsService',
        function ($http, UserService, ExceptionsService) {
            return {
                getFeeds:function () {
                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/feeds",
                        cached:false, withCredentials:true});
                },

                getFeedItems:function (feedId, offset) {
                    var params = {
                        "batchSize":20, //  the number of items that should be returned, defaults to 20
                        "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                        "type":0, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                        "id":feedId, // the id of the folder or feed, Use 0 for Starred and All
                        "getRead":true // if true it returns all items, false returns only unread items
                    };

                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/items",
                        params:params, cached:false, withCredentials:true})
                        .success(function (data, status) {
                            return data;
                        }).error(function (data, status) {
                            ExceptionsService.makeNewException(data,status);
                        });
                }
            };

        }]);

angular.module('News').factory('FoldersService',
    ['$http', 'UserService', 'ExceptionsService',
        function ($http, UserService, ExceptionsService) {
            return {
                getFolders:function () {
                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/folders", cached:false,
                        withCredentials:true });
                },

                getFolderItems:function (folderId, offset) {
                    var params = {
                        "batchSize":20, //  the number of items that should be returned, defaults to 20
                        "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                        "type":1, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                        "id":folderId, // the id of the folder or feed, Use 0 for Starred and All
                        "getRead":true // if true it returns all items, false returns only unread items
                    };

                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/items", params:params,
                        cached:false, withCredentials:true })
                        .success(function (data, status) {
                            return data;
                        }).error(function (data, status) {
                            ExceptionsService.makeNewException(data,status);
                        });
                }
            };

        }]);

angular.module('News').factory('ItemsService',
    ['$http', 'UserService', 'ExceptionsService',
        function ($http, UserService, ExceptionsService) {
            return {
                getStarredItems:function (offset) {
                    var params = {
                        "batchSize":20, //  the number of items that should be returned, defaults to 20
                        "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                        "type":2, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                        "id":0, // the id of the folder or feed, Use 0 for Starred and All
                        "getRead":true // if true it returns all items, false returns only unread items
                    };

                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/items",
                        params:params, cached:false, withCredentials:true})
                        .success(function (data, status) {
                            return data;
                        }).error(function (data, status) {
                            ExceptionsService.makeNewException(data,status);
                        });
                },

                getAllItems:function (offset) {
                    var params = {
                        "batchSize":20, //  the number of items that should be returned, defaults to 20
                        "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                        "type":3, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                        "id":0, // the id of the folder or feed, Use 0 for Starred and All
                        "getRead":true // if true it returns all items, false returns only unread items
                    };
                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/items",
                        params:params, cached:false, withCredentials:true})
                        .success(function (data, status) {
                            return data;
                        }).error(function (data, status) {
                            ExceptionsService.makeNewException(data,status);
                        });
                }
            };
        }]);

angular.module('News').factory('Login', ['$http', '$timeout', function ($http, $timeout) {
    return {
        userName:'ikacikac',
        password:'ikacikac',
        present:true,
        timerRef:null,
        timeout:500000,
        hostname:'http://owncloud.homenet',
        //this.userName+":"+this.password+"@"+this.url+"/version"
        killTimer:function () {
            $timeout.cancel(this.timerRef);
        },

        isPresent:function () {
            return this.present;
        },

        login:function () {
            var auth = "Basic " + btoa(this.userName + ":" + this.password);
            $http.defaults.headers.common.Authorization = auth;
            //console.log("http://"+this.userName+":"+this.password+"@"+this.hostname+"/version");
            //return $http({ method: 'GET', url : "http://"+this.userName+":"+this.password+"@"+this.hostname+"/index.php/apps/news/api/v1-2/version", withCredentials : true });
            return $http({ method:'GET', url:this.hostname + "/index.php/apps/news/api/v1-2/version" });
        },

        getFolders:function () {
            return $http({ method:'GET', url:"http://" + this.userName + ":" + this.password + "@" + this.hostname + "/index.php/apps/news/api/v1-2/folders", cached:false, withCredentials:true });
        },

        getFeeds:function () {
            return $http({ method:'GET', url:"http://" + this.userName + ":" + this.password + "@" + this.hostname + "/index.php/apps/news/api/v1-2/feeds", cached:false, withCredentials:true });
        },

        getStarredItems:function (offset) {
            var params = {
                "batchSize":20, //  the number of items that should be returned, defaults to 20
                "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                "type":2, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                "id":0, // the id of the folder or feed, Use 0 for Starred and All
                "getRead":true // if true it returns all items, false returns only unread items
            };

            return $http({ method:'GET', url:"http://" + this.userName + ":" + this.password + "@" + this.hostname + "/index.php/apps/news/api/v1-2/items", params:params, cached:false, withCredentials:true });
        },

        getAllItems:function (offset) {
            var auth = "Basic " + btoa(this.userName + ":" + this.password);
            $http.defaults.headers.common.Authorization = auth;
            var params = {
                "batchSize":20, //  the number of items that should be returned, defaults to 20
                "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                "type":3, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                "id":0, // the id of the folder or feed, Use 0 for Starred and All
                "getRead":true // if true it returns all items, false returns only unread items
            };
            //return $http({ method : 'GET', url : "http://"+this.userName+":"+this.password+"@"+this.hostname+"/items", params : params, cached : false,  withCredentials : true });
            //return $http({ method : 'GET', url : "http://"+this.hostname+"/index.php/apps/news/api/v1-2/items", params : params, cached : false, withCredentials : true});
            return $http({ method:'GET', url:this.hostname + "/index.php/apps/news/api/v1-2/items", params:params, cached:false});
        },

        getFolderItems:function (folderId, offset) {
            var params = {
                "batchSize":20, //  the number of items that should be returned, defaults to 20
                "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                "type":1, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                "id":folderId, // the id of the folder or feed, Use 0 for Starred and All
                "getRead":true // if true it returns all items, false returns only unread items
            };

            return $http({ method:'GET', url:"http://" + this.userName + ":" + this.password + "@" + this.hostname + "/index.php/apps/news/api/v1-2/items", params:params, cached:false, withCredentials:true });
        },

        getFeedItems:function (feedId, offset) {
            var params = {
                "batchSize":20, //  the number of items that should be returned, defaults to 20
                "offset":offset, // only return older (lower than equal that id) items than the one with id 30
                "type":0, // the type of the query (Feed: 0, Folder: 1, Starred: 2, All: 3)
                "id":feedId, // the id of the folder or feed, Use 0 for Starred and All
                "getRead":true // if true it returns all items, false returns only unread items
            };

            return $http({ method:'GET', url:"http://" + this.userName + ":" + this.password + "@" + this.hostname + "/index.php/apps/news/api/v1-2/items", params:params, cached:false, withCredentials:true });
        }


    };

}]);

angular.module('News').factory('LoginService',
    ['$http', '$timeout', 'UserService',
        function ($http, $timeout, UserService) {
            return {
                present:false,
                timerRef:null,
                timeout:500000,

                killTimer:function () {
                    $timeout.cancel(this.timerRef);
                },

                isPresent:function () {
                    return this.present;
                },

                login:function () {
                    var auth = "Basic " + btoa(UserService.userName + ":" +
                        UserService.password);

                    $http.defaults.headers.common.Authorization = auth;

                    return $http({ method:'GET', url:UserService.hostName +
                        "/index.php/apps/news/api/v1-2/version" });


                    //console.log("http://"+this.userName+":"+this.password+"@"+this.hostname+"/version");
                    //return $http({ method: 'GET', url : "http://"+this.userName+":"+this.password+"@"+this.hostname+
                    // "/index.php/apps/news/api/v1-2/version", withCredentials : true });
                }

            };

        }]);

angular.module('News').factory('UserService', ['$http', function ($http) {
    return {
        userName:'ikacikac',
        password:'ikacikac',
        hostName:'http://localhost/owncloud'
    };
}]);

})(window.angular, jQuery);