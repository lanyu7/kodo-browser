angular.module("web").factory("AuthInfo", [
  "$q",
  "Const",
  "Cipher",
  function ($q, Const, Cipher) {
    var AUTH_INFO = Const.AUTH_INFO_KEY;
    var CLOUD_CHOICE = Const.CLOUD_CHOICE_KEY;
    var AUTH_HIS = Const.AUTH_HIS;
    var AUTH_KEEP = Const.AUTH_KEEP;

    return {
      get: function () {
        return get(AUTH_INFO);
      },
      save: function (obj) {
        var oldobj = get(AUTH_INFO);
        Object.assign(oldobj, obj);

        save(AUTH_INFO, oldobj);
      },
      remove: function () {
        remove(AUTH_INFO);
      },
      saveToAuthInfo: saveToAuthInfo,

      usePublicCloud: function() {
        return get(CLOUD_CHOICE) === 'default';
      },
      switchToPublicCloud: function() {
        save(CLOUD_CHOICE, 'default');
      },
      switchToPrivateCloud: function() {
        save(CLOUD_CHOICE, 'customized');
      },

      remember: function (obj) {
        save(AUTH_KEEP, obj);
      },
      unremember: function () {
        remove(AUTH_KEEP);
      },
      getRemember: function () {
        return get(AUTH_KEEP);
      },

      listHistories: function () {
        return get(AUTH_HIS);
      },
      cleanHistories: function () {
        remove(AUTH_HIS);
      },
      removeFromHistories: removeFromHistories,
      addToHistories: addToHistories
    };

    function addToHistories(obj) {
      var arr = get(AUTH_HIS, []);
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == obj.id) {
          arr.splice(i, 1);
          i--;
        }
      }
      arr.unshift(obj);
      save(AUTH_HIS, arr, []);
    }

    function removeFromHistories(id) {
      var arr = get(AUTH_HIS, []);
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
          arr.splice(i, 1);
          i--;
        }
      }
      save(AUTH_HIS, arr, []);
    }

    function saveToAuthInfo(opt) {
      var obj = get(AUTH_INFO);
      for (var k in opt) obj[k] = opt[k];
      save(AUTH_INFO, obj);
    }

    ///////////////////////////////
    function remove(key) {
      localStorage.removeItem(key);
    }

    function get(key, defv) {
      var str = localStorage.getItem(key);
      if (str) {
        try {
          str = Cipher.decipher(str);
          return JSON.parse(str);
        } catch (e) {
          console.log(e, str);
        }
      }
      return defv || {};
    }

    function save(key, obj, defv) {
      delete obj["httpOptions"];

      var str = JSON.stringify(obj || defv || {});
      try {
        str = Cipher.cipher(str);
      } catch (e) {
        console.log(e);
      }
      localStorage.setItem(key, str);
    }
  }
]);
