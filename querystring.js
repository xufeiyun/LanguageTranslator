
/*-------  --------*/

/**
	This javascript file is to get the query string in URL.
*/

var QueryString =
{
    // get query string as an Array

    getQueryStringArray: function (location)
    {
        var result = location.search.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
        if (result == null)
        {
            return "";
        }

        for (var i = 0; i < result.length; i++)
        {
            result[i] = result[i].substring(1);
        }
        return result;
    },

    // get single query string item by name
    getQueryStringByName: function (location, name)
    {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1)
        {
            return "";
        }
        return result[1];
    },

    // get single query string item by index
    getQueryStringByIndex: function (location, index)
    {
        if (index == null)
        {
            return "";
        }

        var queryStringList = QueryString.getQueryStringArray(location);
        if (index >= queryStringList.length)
        {
            return "";
        }

        var result = queryStringList[index];
        var startIndex = result.indexOf("=") + 1;
        result = result.substring(startIndex);
        return result;
    }
};