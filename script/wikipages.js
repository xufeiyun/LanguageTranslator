/**
 * WIKI Pages: to get wiki pages definitions for word.
 **/
var prefix = "[WIKI PAGES]: ";

var WikiAPI = {

    openHomepage: function ()
    {
        // ok
        WikiAPI.fromHomepage(ExtenionUID);
    },
    openWikipage: function (word)
    {
        LoggerAPI.logD("call openWikipage with word:" + word);

        var fromGoogle = function (word)
        {
            LoggerAPI.logW("Undefined Wikipedia Type: " + OptionItemValues.DefaultBaike);
            LoggerAPI.logW("Searching [" + word + "] by google.com ...");
            WikiAPI.fromGoogleAPI(word);
        };

        // ok
        if (CommonAPI.isChinese(word))
        {
            if (OptionItemValues.DefaultBaike == BaikeType.wikicn)
            {
                WikiAPI.fromWikipediaCN(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.tencent)
            {
                WikiAPI.fromTencentAPI(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.baidu)
            {
                WikiAPI.fromBaiduAPI(word);
            }
            else
            {
                WikiAPI.fromGoogle(word);
            }
        }
        else
        {
            if (OptionItemValues.DefaultBaike == BaikeType.wikien)
            {
                WikiAPI.fromWikipediaEN(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.tencent)
            {
                WikiAPI.fromTencentAPI(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.baidu)
            {
                WikiAPI.fromBaiduAPI(word);
            }
            else
            {
                WikiAPI.fromGoogle(word);
            }
        }
    },
    openPage: function (url, callback)
    {
        LoggerAPI.logD("Page URL: " + url);
        if (chrome.tabs)
        {
            chrome.tabs.create({ url: url }, callback);
        }
        else
        {
            LoggerAPI.logW(callback ? callback : "callback is undefined");
            LoggerAPI.logW(prefix + "chrome.tabs is NOT defined!");
            if (url.indexOf("://") == -1)
            {
                url = "chrome-extension://" + ExtenionUID + "/" + url;
            }
            if (url.indexOf("http") == 0)
            {
                //window.open(url);
                // send data to background for open the page by chrome.tabs
                MsgBusAPI.msg_send(OperatorType.openOptionPage, url, callback);
            }
            else
            {
                // send data to background for open the page by chrome.tabs
                MsgBusAPI.msg_send(OperatorType.openOptionPage, url, callback);
            }
        }
    },

    /*-----------  open pages of different source from content or popup scripts--------------*/
    // by url
    fromHomepage: function (uid)
    {
        var url = ProductURIs.Product;
        WikiAPI.openPage(url);
    },
    fromWikipediaEN: function (word)
    {
        var url = "http://en.wikipedia.org/wiki/" + CommonAPI.encodeText(word);
        WikiAPI.openPage(url);
    },
    fromWikipediaCN: function (word)
    {
        var url = "http://zh.wikipedia.org/wiki/" + CommonAPI.encodeText(word);
        WikiAPI.openPage(url);
    },
    fromGoogleAPI: function (word)
    {
        var url = 'https://www.google.com/#q=' + CommonAPI.encodeText(word) + "&safe=strict";
        WikiAPI.openPage(url);
    },

    // by scripts
    fromBaiduAPI: function (word)
    {
        // Reference: http://baike.baidu.com/hezuo/hzsq.html
        // 1. open http://baike.baidu.com/
        // 2. set content of text id: word
        // 3. click the button of id: find by value [进入词条] and type [submit]

        var data = {
            type: BaikeType.baidu,
            control: true,
            value: word
        };

        MsgBusAPI.msg_send(OperatorType.setBaikeSetting, data)

        WikiAPI.openPage('http://baike.baidu.com/');
    },
    fromTencentAPI: function (word)
    {
        // Reference: http://baike.soso.com/
        // 1. open http://baike.soso.com/
        // 2. set content of text id: searchText
        // 3. click the button of id: find by id enterLemma or by value [进入词条] and type [submit]id = "searchText";

        var data = {
            type: BaikeType.tencent,
            control: true,
            value: word
        };

        MsgBusAPI.msg_send(OperatorType.setBaikeSetting, data)

        WikiAPI.openPage('http://baike.soso.com/');
    },


    /*-----------  set values of page elements of opened page, called by content scripts--------------*/
    setPage_BaiduAPI: function (isPageControl, value)
    {
        if (isPageControl && isPageControl == true)
        {
            // text element
            var text = $("#word");
            if (text)
            {
                text.val(value);
                // button element
                var submit = $("input[value='进入词条']");
                LoggerAPI.logD(submit ? "submit found" : "submit NOT found");
                //if (submit.length > 0 && CommonAPI.isDefined(submit[0].click))
                if (submit && CommonAPI.isDefined(submit.click))
                {
                    submit.click();
                    LoggerAPI.logD("Submit button clicked.");
                }
                else
                {
                    LoggerAPI.logE("Submit button not found.");
                }
            }
        }
    },
    setPage_TencentAPI: function (isPageControl, value)
    {
        if (isPageControl && isPageControl == true)
        {
            // text element
            var text = $("#searchText");
            if (text)
            {
                text.val(value);
                // button element
                var submit = $("#enterLemma");
                if (submit.length > 0 && CommonAPI.isDefined(submit[0].click))
                {
                    submit[0].click();
                    LoggerAPI.logD("Submit button clicked.");
                }
                else
                {
                    LoggerAPI.logE("Submit button not found.");
                }
            }
        }
    }
};
