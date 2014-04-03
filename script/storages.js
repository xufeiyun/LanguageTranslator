
/**
	This javascript file is to get/set key-value pair to localStorage object.
**/

var StorageAPI = {

    setItem: function (key, value)
    {
        if (value == null) value = "";
        localStorage[key] = value;
        // StorageAPI.setItem(key, value);
        return { "Key": key, "Value": value };
    },

    getItem: function (key)
    {
        // return localStorage.StorageAPI.getItem(key);
        var value = localStorage[key];
        if (value == "") value = null;
        //StorageAPI.setItem(key, "");
        return value;
    },

    removeItem: function (key)
    {
        localStorage.removeItem(key);
    }

};