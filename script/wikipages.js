/**
 * WIKI Pages: to get wiki pages definitions for word.
 **/
var prefix = "[WIKI PAGES]: ";

var WikiAPI = {
    fromHomepage: function (uid) {
        var url = ProductURIs.Product;
        WikiAPI.openPage(url);
    },
    // a common function to open wiki page based on wiki type
    fromWikipage: function (word) {
        LoggerAPI.logD("call openWikipage with word:" + word);

        var fromGoogle = function (word) {
            LoggerAPI.logW("Undefined Wikipedia Type: " + OptionItemValues.DefaultBaike);
            LoggerAPI.logW("Searching [" + word + "] by google.com ...");
            SearchAPI.fromGoogleAPI(word);
        };

        // ok
        if (CommonAPI.isChinese(word)) {
            if (OptionItemValues.DefaultBaike == BaikeType.wikicn) {
                WikiAPI.fromWikipediaCN(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.tencent) {
                WikiAPI.fromTencentAPI(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.baidu) {
                WikiAPI.fromBaiduAPI(word);
            }
            else {
                WikiAPI.fromGoogle(word);
            }
        }
        else {
            if (OptionItemValues.DefaultBaike == BaikeType.wikien) {
                WikiAPI.fromWikipediaEN(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.tencent) {
                SearchAPI.fromTencentAPI(word);
            }
            else if (OptionItemValues.DefaultBaike == BaikeType.baidu) {
                SearchAPI.fromBaiduAPI(word);
            }
            else {
                SearchAPI.fromGoogleAPI(word);
            }
        }
    },
    fromWikipediaEN: function (word) {
        var url = "http://en.wikipedia.org/wiki/" + CommonAPI.encodeText(word);
        WikiAPI.openPage(url);
    },
    fromWikipediaCN: function (word) {
        var url = "http://zh.wikipedia.org/wiki/" + CommonAPI.encodeText(word);
        WikiAPI.openPage(url);
    },
    // by scripts
    fromBaiduWiki: function (word) {
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
    fromTencentWiki: function (word) {
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
    openPage: function (url, callback) {
        LoggerAPI.logD("Page URL: " + url);
        if (chrome.tabs) {
            chrome.tabs.create({ url: url }, callback);
        }
        else {
            LoggerAPI.logW(callback ? callback : "callback is undefined");
            LoggerAPI.logW(prefix + "chrome.tabs is NOT defined!");
            if (url.indexOf("://") == -1) {
                url = "chrome-extension://" + ExtensionUID + "/" + url;
            }
            if (url.indexOf("http") == 0) {
                //window.open(url);
                // send data to background for open the page by chrome.tabs
                MsgBusAPI.msg_send(OperatorType.openOptionPage, url, callback);
            }
            else {
                // send data to background for open the page by chrome.tabs
                MsgBusAPI.msg_send(OperatorType.openOptionPage, url, callback);
            }
        }
    },


    /*-----------  set values of page elements of opened page, called by content scripts--------------*/
    setPage_BaiduWiki: function (isPageControl, value) {
        if (isPageControl && isPageControl == true) {
            // text element
            var text = $("#word");
            if (text) {
                text.val(value);
                // button element
                var submit = $("input[value='进入词条']");
                LoggerAPI.logD(submit ? "submit found" : "submit NOT found");
                //if (submit.length > 0 && CommonAPI.isDefined(submit[0].click))
                if (submit && CommonAPI.isDefined(submit.click)) {
                    submit.click();
                    LoggerAPI.logD("Submit button clicked.");
                }
                else {
                    LoggerAPI.logE("Submit button not found.");
                }
            }
        }
    },
    setPage_TencentWiki: function (isPageControl, value) {
        if (isPageControl && isPageControl == true) {
            // text element
            var text = $("#searchText");
            if (text) {
                text.val(value);
                // button element
                var submit = $("#enterLemma");
                if (submit.length > 0 && CommonAPI.isDefined(submit[0].click)) {
                    submit[0].click();
                    LoggerAPI.logD("Submit button clicked.");
                }
                else {
                    LoggerAPI.logE("Submit button not found.");
                }
            }
        }
    }
};

var SearchAPI = {
    fromGoogleAPI: function (word) {
        var url = 'https://www.google.com/#q=' + CommonAPI.encodeText(word) + "&safe=strict";
        WikiAPI.openPage(url);
    },
    fromBaiduAPI: function (word) {
        var url = 'http://www.baidu.com/#wd=' + CommonAPI.encodeText(word) + "&rsv_bp=0&tn=baidu&rsv_spt=3&ie=utf-8&rsv_sug3=2&rsv_sug4=127&rsv_sug1=2&rsv_sug2=0&inputT=4";
        WikiAPI.openPage(url);
    },
    fromTencentAPI: function (word) {
        var url = 'http://www.soso.com/q?utf-8=ie&query=' + CommonAPI.encodeText(word) + "&w=";
        WikiAPI.openPage(url);
    },
    fromMicrosoftAPI: function (word) {
        var url = 'https://www.bing.com/search?q=' + CommonAPI.encodeText(word) + "&go=&qs=n&form=QBLH&pq=test&sc=8-4&sp=-1&sk=";
        WikiAPI.openPage(url);
    }
};

var ShareAPI = {
    fromQZoneAPI: function (word) {
        ShareAPI.notImplemented();
    },
    fromRenRenAPI: function (word) {
        ShareAPI.notImplemented();
    },
    fromDiggAPI: function (word) {
        ShareAPI.notImplemented();
    },
    from36KrAPI: function (word) {
        ShareAPI.notImplemented();
    },
    notImplemented: function () {
        console.warn('Not Implemented Exception for Sharing API.');
    }
};

var StudyAPI = {
};

var StudyCardAPI = {
};