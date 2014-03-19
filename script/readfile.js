
/* ---
get files' contents
-----*/
var ReadFileAPI = {
    isDefined: function (variable)
    {
        return (typeof (variable) != "undefined");
    },

    isValidText: function (text)
    {
        return ReadFileAPI.isDefined(text) && !(text == null || $.trim(text) == "");
    },

    getBaseUrl: function (win)
    {
        var index = win.location.href.lastIndexOf('/');
        var baseUrl = win.location.substr(0, index + 1);
        return baseUrl;
    },

    getFileContentsSync: function (url, type)
    {
        if (!ReadFileAPI.isValidText(type)) { type = 'text'; }
        if (!ReadFileAPI.isValidText(url)) { return ""; }

        return $.ajax({
            url: url,
            dataType: type,
            type: "get",
            async: false
        }).responseText;

        var log = "Retrieved content, URL is: " + url;
        LoggerAPI.logD(log);
    },

    getFileContents: function (url, fnSuccess, type, fnFailure)
    {
        if (!ReadFileAPI.isValidText(type)) { type = 'text'; }
        if (!ReadFileAPI.isValidText(url)) { return false; }

        $.ajax({
            url: url,
            dataType: type,
            type: "get",
            async: true,
            success: function (result)
            {
                if (ReadFileAPI.isDefined(fnSuccess)) { fnSuccess(result); }
            },
            error: function (e)
            {
                if (ReadFileAPI.isDefined(fnFailure)) { fnFailure(e); }
            }
        });

        return true;
    }
};
