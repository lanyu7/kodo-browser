angular.module("web").controller("topCtrl", [
  "$scope",
  "$rootScope",
  "$uibModal",
  "$location",
  "$translate",
  "$timeout",
  "Dialog",
  "Auth",
  "AuthInfo",
  "settingsSvs",
  "autoUpgradeSvs",
  function(
    $scope,
    $rootScope,
    $modal,
    $location,
    $translate,
    $timeout,
    Dialog,
    Auth,
    AuthInfo,
    settingsSvs,
    autoUpgradeSvs
  ) {
    var fs = require("fs");
    var path = require("path");
    var T = $translate.instant;

    angular.extend($scope, {
      logout: logout,
      showFavList: showFavList,
      showAbout: showAbout,
      showReleaseNote: showReleaseNote,
      showBucketsOrFiles: showBucketsOrFiles,
      showExternalPaths: showExternalPaths,
      isExternalPathEnabled: isExternalPathEnabled,
      click10: click10
    });

    var ctime = 0;
    var tid;
    function click10() {
      ctime++;
      if (ctime > 10) {
        openDevTools();
      }
      $timeout.cancel(tid);
      tid = $timeout(function() {
        ctime = 0;
      }, 600);
    }

    $rootScope.app = {};
    angular.extend($rootScope.app, Global.app);

    $scope.authInfo = AuthInfo.get();
    $scope.authInfo.expirationStr = moment(
      new Date($scope.authInfo.expiration)
    ).format("YYYY-MM-DD HH:mm:ss");

    $scope.$watch("upgradeInfo.isLastVersion", function(v) {
      if (false === v) {
        if (1 == settingsSvs.autoUpgrade.get()) autoUpgradeSvs.start();
        else $scope.showAbout();
      }
    });
    $scope.$watch("upgradeInfo.upgradeJob.status", function(s) {
      if ("failed" == s || "finished" == s) {
        $scope.showAbout();
      }
    });

    $rootScope.showSettings = function(fn) {
      $modal.open({
        templateUrl: "main/modals/settings.html",
        controller: "settingsCtrl",
        resolve: {
          callback: function() {
            return fn;
          }
        }
      }).result.then(angular.noop, angular.noop);
    };

    function logout() {
      var title = T("logout");
      var message = T("logout.message");
      Dialog.confirm(
        title,
        message,
        function(b) {
          if (b) {
            Auth.logout().then(function() {
              $location.url("/login");
            });
          }
        },
        1
      );
    }

    function showReleaseNote() {
      var converter = new showdown.Converter();
      fs.readFile(
        path.join(__dirname, "release-notes", Global.app.version + ".md"),
        function(err, text) {
          if (err) {
            console.error(err);
            return;
          }
          text = text + "";
          var html = converter.makeHtml(text);
          var message = T("main.upgration"); //'主要更新'
          Dialog.alert(message, html, function() {}, { size: "lg" });
        }
      );
    }

    function showFavList() {
      $modal.open({
        templateUrl: "main/modals/fav-list.html",
        controller: "favListCtrl",
        size: "lg"
      }).result.then(angular.noop, angular.noop);
    }

    function showAbout() {
      $modal.open({
        templateUrl: "main/modals/about.html",
        controller: "aboutCtrl",
        size: "md",
        resolve: {
          pscope: function() {
            return $scope;
          }
        }
      }).result.then(angular.noop, angular.noop);
    }

    function isExternalPathEnabled() {
      return settingsSvs.externalPathEnabled.get() > 0
    }

    function showBucketsOrFiles() {
      if ($scope.ref.mode.startsWith('external')) {
        $scope.gotoLocalMode();
      }
    }

    function showExternalPaths() {
      if ($scope.ref.mode.startsWith('local')) {
        $scope.gotoExternalMode();
      }
    }
  }
]);
