courtresApp.factory('dataService', function() {
    var savedData = {}
    function set(data) {
        savedData = data;
    }
    function get() {
        return savedData;
    }
    function setKV(key, value) {
        savedData[key] = value;
    }
    function getKV(key) {
        return savedData[key];
    }
    return {
        set: set,
        get: get,
        setKV:setKV,
        getKV:getKV
    }

});