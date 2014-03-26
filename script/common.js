/**
	This javascript file is the common file including common features
*/

var prefix = "[COMMON SCRIPTS]: "

var ReleaseId = "hfcnemnjojifmhdgdbhnhiinmjdohlel"; // release key
var ExtenionUID = chrome.i18n.getMessage("@@extension_id"); //extension id: __MSG_@@extension_id__

var NewLine = "\r\n";
var Comma = ","
var AutoCopyTextInterval = 812;
var AutoTranslationInterval = 600;
var OneLineCharCount = 45;
var EmptyText = "";
var TrueValue = "true";
var UsePageAction = false;

var IsDebugger = (ExtenionUID == "dppekmccnfhabjbkalkadbhofdlhpnld" || ExtenionUID == "fhpodiibcajbmcllgnoaggldkfanoijo");  // develop key

// output current locale
i18n.PrintLocale();

var OperatorType = {
    getSelectText: "OperatorTypeKey_GetSelectText",
    copySelectText: "OperatorTypeKey_CopySelectText",
    getCopiedText: "OperatorTypeKey_GetCopiedText",
    viewWikipages: "OperatorTypeKey_ViewWikipages",
    viewHomepage: "OperatorTypeKey_ViewHomepage",
    showPageAction: "OperatorTypeKey_ShowPageAction",
    speakText: "OperatorTypeKey_SpeakText",
    loadSettings: "OperatorTypeKey_LoadSettings",
    saveSettings: "OperatorTypeKey_SaveSettings",
    savedSettings: "OperatorTypeKey_SavedSettings",
    openOptionPage: "OperatorTypeKey_OpenOptionPage",
    getBaikeSetting: "OperatorTypeKey_getBaikeSetting",
    setBaikeSetting: "OperatorTypeKey_setBaikeSetting"
};

var BaikeType = {
    baidu: "baidu",
    tencent: "soso",
    wikicn: "wikicn",
    wikien: "wikien"
};

var PronounceAudios = {
    Source: {ContainerId: 'divReadSource', PlayerId: 'audioReadSource', ButtonId: 'btnReadSource'},
    Main: {ContainerId: 'divReadMain', PlayerId: 'audioReadMain', ButtonId: 'btnReadMain'},
    More: {ContainerId: 'divReadMore', PlayerId: 'audioReadMore', ButtonId: 'btnReadMore'}
};

var ProductURIs = {
    Product: "https://chrome.google.com/webstore/detail/the-language-translator/" + ReleaseId,
    PopupIFramePage: "chrome-extension://" + ExtenionUID + "/popup_dialog.html",
    WikiPediaEN: "http://en.wikipedia.org/wiki/",
    WikiPediaCN: "http://zh.wikipedia.org/wiki/",
    WebpagePopup: "https://dl.yunio.com/pub/0LpA2l?name=webpage_popup.txt",
    YouDaoURL: "http://fanyi.youdao.com/openapi.do?keyfrom=SZJWCKJ&key=998983058&type=data&doctype=json&version=1.1"
};

var ElementIds = {
    WebPagePopupDiv: 'divLanguageTranslator',
    PopupIFrame: 'frameLanguageTranslator',
    PopupButtonClose: 'btnLanguageTranslatorClose',
    PopupButtonCollapse: 'btnLanguageTranslatorCollapse',
    PopupButtonDisable: 'btnLanguageTranslatorDisable',
    TextSelected: 'txtSelected',
    TextTranslated: 'txtTranslated',
    TextTranslatedAll: 'txtTranslatedAll'
};

var OptionItemKeys = {
    EnableTranslation: "OptionItemKeys_EnableTranslation",
    EnablePopupDialog: "OptionItemKeys_EnablePopupDialog",
    EnableCopyText: "OptionItemKeys_EnableCopyText",
    EnableLogger: "OptionItemKeys_EnableLogger",
    FromLanguage: "OptionItemKeys_FromLanguage",
    ToLanguage: "OptionItemKeys_ToLanguage",
    DefaultBaike: "OptionItemKeys_DefaultBaike",
    EnableAction: "OptionItemKeys_EnableAction",
    EnableLocation: "OptionItemKeys_EnableLocation",
    StartLocation: "OptionItemKeys_StartLocation",
    IsPageControl: "OptionItemKeys_IsPageControl",
    BaikeType: "OptionItemKeys_BaikeType",
    BaikeWord: "OptionItemKeys_BaikeWord",
    EnablePronunciation: "OptionItemKeys_EnablePronunciation",
    Default: "OptionItemKeys_defalt"
};

// Set default values for deployment!
var OptionItemValues = {
    EnableLogger: false,  // It means to log text to browser console.
    EnablePronunciation: true,
    EnablePopupDialog: false,   // It means the webpage-based popup dialog displays automatically OR NOT on current webpage that viewed by user.

    ClosedPopupDialog: false,
    EnableTranslation: true,   // It means translation takes effect OR NOT thru webpage-based popup dialog or the extension-based popup dialog.
    EnableCopyText: false,  // It means to copy the selected text automatically on current webpage.
    FromLanguage: 'en',
    ToLanguage: 'cn',
    DefaultBaike: 'baidu',    // one type of BaikeType,
    EnableAction: true,   // It means to enable the Text Translation feature which means it is able to popup the dialog. Highest switch than OptionItemKeys.EnableTranslation and OptionItemKeys. EnablePopupDialog!
    EnableLocation: true,   // It means to send geo location to me.
    Default: "default"   // placeholder
};

var CheckDebugger = function ()
{
    // Change default values for debug mode!
    if (IsDebugger)
    {
        LoggerAPI.logW("DEBUG MODE: Enable Logger, Disable Pronunciation, Show Popup Dialog!");

        OptionItemValues.EnableLogger = true;   // enable log for dev env
        OptionItemValues.EnablePronunciation = false;   // disable pronunce for dev env
        OptionItemValues.EnablePopupDialog = true; // open dialog in debug mode
    }
};

var CommonAPI = {
    showPopupMsg: function (message)
    {
        //LoggerAPI.logD("SHOW NOTIFICATION WITH MESSAGE: " + message);
        try
        {
            // notification popup
            var notify = webkitNotifications.createNotification(
                    'image/notify_logo.png',      // icon url - can be relative
                    prefix,                 // notification title
                    message                 // notification body text
                );
            notify.show();
        }
        catch (e)
        {
            LoggerAPI.logE("try to popup msg: [" + message + "]. " + e.toLocaleString());
        }
    },

    alertMsg: function (message)
    {
        CommonAPI.showPopupMsg(message);
    },

    importJS: function (path)
    {
        LoggerAPI.logD("[Try importing javascript file into viewed page dynamically] file path: " + path);
        var i;
        var ss = document.getElementsByTagName("script");
        for (i = 0; i < ss.length; i++)
        {
            if (ss[i].src && ss[i].src.indexOf(path) != -1)
            {
                return;
            }
        }
        // add script dynamically
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = path;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(s);
    },

    getInterval: function (start, end)
    {
        if (CommonAPI.isDefined(start) && CommonAPI.isDefined(end))
        {
            var interval = (end.getTime() - start.getTime());
            return interval;
        }
        else
        {
            return 0;
        }
    },

    encodeText: function (text)
    {
        return encodeURIComponent(text);
    },

    isDefined: function (variable)
    {
        return (typeof (variable) != "undefined");
    },

    isValidText: function (text)
    {
        // return CommonAPI.isDefined(text) && !(text == null || text.trim() == "");
        return CommonAPI.isDefined(text) && !(text == null || $.trim(text) == "");
    },

    isFunction: function (fnName)
    {
        return (typeof (fnName) == "function");
    },

    now: function ()
    {
        var d = new Date();
        var ms = (1000 + d.getMilliseconds()).toString().substr(1);
        var value = "[" + d.toLocaleString() + " - " + ms + "] ";
        return value;
    },

    removeDuplicated: function (data, character)
    {
        var text = data;
        // removing duplicated comma
        while (text.indexOf(character + character) > -1)
        {
            text = text.replace(character + character, character);
        }
        // end
        return text;
    },

    removeInsideSpaces: function (text)
    {
        text = text.replace(/\s/g, "");
        return text;
    },

    // judge whether the word contains chinese or not
    isChinese: function (s)
    {
        var pattern = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        var result = (pattern.exec(s) != null); // ok chinese
        return result;
    },

    getFunctionName: function (fn)
    {
        if (typeof (fn) == 'function')
        {
            var cbs = fn.toString();
            var name = cbs.match(/function ([a-zA-Z0-9_-]*)/)[1];
            return name;
        }
        return 'NOT A FUNCTION';
    }
};

var LoggerAPI = {

    // prefix is defined in each js file
    logD: function (message)
    {
        //console.debug(prefix + message);
        if (OptionItemValues.EnableLogger && CommonAPI.isDefined(console.debug)) console.debug(CommonAPI.now() + prefix + message);
    },

    logW: function (message)
    {
        //console.warn(prefix + message);
        if (OptionItemValues.EnableLogger && CommonAPI.isDefined(console.warn)) console.warn(CommonAPI.now() + prefix + message);
    },

    logE: function (message)
    {
        //console.error(prefix + message);
        if (OptionItemValues.EnableLogger && CommonAPI.isDefined(console.error)) console.error(CommonAPI.now() + prefix + message);
    }
};

var DomAPI = {
    getElement: function (id, pDocument)
    {
        // return jquery object
        if (pDocument != undefined && pDocument != null)
        {
            return $(pDocument.getElementById(id));
            //return $(pDocument.documentElement).children("body").children("[id='" + id + "']")
        }
        else
        {
            return $(DomAPI.getById(id));
        }
    },

    getById: function (id, pDocument)
    {
        // return html element
        if (pDocument != undefined && pDocument != null)
        {
            return pDocument.getElementById(id)
        }
        else
        {
            return DomAPI.getDocument().getElementById(id);
        }
    },
    appendChild: function (element, pDocument)
    {
        if (pDocument != undefined && pDocument != null)
        {
            pDocument.body.appendChild(element);
        }
        else
        {
            DomAPI.getDocument().body.appendChild(element);
        }
    },
    createElement: function (tag)
    {
        return DomAPI.getDocument().createElement(tag);
    },


    getsByTag: function (tag)
    {
        return DomAPI.getDocument().getElementsByTagName(tag);
    },

    getDocument: function ()
    {
        //var doc = document;
        var doc = top.window.document;
        return doc;
    },

    getValue: function (element, key)
    {
        if (element)
        {
            return element.getAttribute(key);
        } else
        {
            return "";
        }
    },

    setValue: function (element, key, value)
    {
        if (element)
        {
            return element.setAttribute(key, value);
        } else
        {
            return "";
        }
    }
};

var PopupAPI = {
    showPopup: function (id, pDocument)
    {
        setTimeout(function ()
        {
            DomAPI.getElement(id, pDocument).slideDown();
        }, 10);
    },

    hidePopup: function (id, pDocument)
    {
        setTimeout(function ()
        {
            DomAPI.getElement(id, pDocument).slideUp();
        }, 100);
    }
};

var AjaxAPI = {
    getFileContents: function (url, fnSuccess, type, fnFailure)
    {
        if (!CommonAPI.isValidText(type)) { type = 'text'; }
        if (!CommonAPI.isValidText(url)) { return false; }

        $.ajax({
            url: url,
            dataType: type,
            type: "get",
            async: true,
            success: function (result)
            {
                if (CommonAPI.isDefined(fnSuccess)) { fnSuccess(result); }
            },
            error: function (e)
            {
                if (CommonAPI.isDefined(fnFailure)) { fnFailure(e); }
            }
        });

        return true;
    },


    getFileContentsSync: function (url, type)
    {
        if (!CommonAPI.isValidText(type)) { type = 'text'; }
        if (!CommonAPI.isValidText(url)) { return ""; }

        return $.ajax({
            url: url,
            dataType: type,
            type: "get",
            async: false
        }).responseText;
    }

};

var AudioAPI =
{
    createTranslateAudio: function (audioType, word)
    {
        if (OptionItemValues.EnablePronunciation == false)
        {
            LoggerAPI.logD("Pronunciation Feature has been disabled, it may be in DEBUG mode.");
            //return;
        }

        var divId = audioType.ContainerId,
        audioId = audioType.PlayerId,
        buttonId = audioType.ButtonId;

        var isChineseWord = CommonAPI.isChinese(word);
        LoggerAPI.logW("Is Chinese Word: " + isChineseWord);
        var url = "http://tts.baidu.com/text2audio?lan=" + (isChineseWord ? "zh" : "en") + "&amp;ie=UTF-8&amp;text=" + encodeURI(word);

        // creat audio element
        var htmlAudio = "<audio buttonid='" + buttonId + "' controls='controls' preload='preload' src='" + url + "' id='" + audioId + "'></audio>";
        var div = "#" + divId;
        $(div).html("");
        $(div).html(htmlAudio);

        var hideButton = function (e)
        {
            // hide button element or not after loaded data
            var button = $("#" + e.target.getAttribute("buttonid"));
            if (e.target.networkState == 3 || e.target.readyState == 0)
            {
                button.addClass("hide");
            }
            else
            {
                button.removeClass("hide");
            }
        };

        var audio = $("#" + audioId)[0];
        if (audio) {
            audio.addEventListener("loadeddata", hideButton);
            audio.addEventListener("error", hideButton);
        }
    }
};

var MsgBusAPI = {
    // content script => outer
    msg_send: function (type, message, callback)
    {
        LoggerAPI.logD("#msg_send: callback function: " + CommonAPI.getFunctionName(callback));
        LoggerAPI.logD("#msg_send: sending message...");
        chrome.runtime.sendMessage(
            ExtenionUID,
            { type: type, message: message },
            function (response) { MsgBusAPI._msg_resp(response, callback); }
        );
    },

    // background => content script
    msg_bgd2tab: function (type, message, callback)
    {
        LoggerAPI.logD("#msg_bgd2tab: callback function: " + CommonAPI.getFunctionName(callback));
        LoggerAPI.logD("#msg_bgd2tab: sending message...");
        var queryResponse = function (tabs)
        {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: type, message: message },
                function (response) { MsgBusAPI._msg_resp(response, callback); }
            );
        };
        chrome.tabs.query({ 'active': true }, queryResponse);
    },

    // response callback
    msg_resp: function (response)
    {
        if (response != null)
        {
            LoggerAPI.logD("#msg_resp: Received RESPONSE#: type=>" + response.type + ", message=>" + response.message);
        }
        else
        {
            LoggerAPI.logW("#msg_resp: Received RESPONSE#: response is null");
        }
    },

    _msg_resp: function (response, callback)
    {
        MsgBusAPI.msg_resp(response);

        // invoke user's callback function
        if (callback != undefined && callback != null)
        {
            callback(response);
        }
        return true;
    },

    // receivers
    rcvmsg_iframe: function (request, sender, sendResponse)
    {
        LoggerAPI.logD("rcvmsg_iframe: Received TYPE: " + request.type + ", MESSAGE [" + request.message + "] " + msg);

        var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "]" :
                "in extension script");

        var type = request.type;
        var message = request.message;
        var send = (typeof (sendResponse) == "function");

        if (!CommonAPI.isValidText(type))
        {
            LoggerAPI.logE("rcvmsg_iframe: Message received is null or empty");
        }
        else if (type == OperatorType.getSelectText)
        {
            TranslatorAPI.translate(message);
        }
        else if (type == OperatorType.copySelectText)
        {
            if (CommonAPI.isValidText(message))
            {
                StorageAPI.setItem(OperatorType.copySelectText, message);
                var result = window.Clipboard.copy(message);
                if (result) { LoggerAPI.logD("rcvmsg_iframe: Copied text OK."); }
            }
        }
        else if (type == OperatorType.showPageAction)
        {
            //chrome.pageAction.show(sender.tab.id);
        }
        else if (type == OperatorType.viewWikipages)
        {
            showWikipages(message);
            if (CommonAPI.isValidText(message))
            {
                LoggerAPI.logD("rcvmsg_iframe: Try to open wikipage");
                {
                    // fromWikipedia(message);	// ok
                }
                // or
                {
                    //fromBaiduAPI(message);
                    fromTencentAPI(message);
                }
            }
        }
        else if (type == OperatorType.viewHomepage)
        {
            showHomepage(message);
        }
        else
        {
            if (send)
            {
                sendResponse({ type: type, message: "rcvmsg_iframe: #IFRAME SEND RESPONSE# Received Message:" + message });
            }
            else
            {
                LoggerAPI.logW(prefix, "rcvmsg_iframe: NOT defined the response function!");
            }
        }

    },

    rcvmsg_background: function (request, sender, sendResponse)
    {
        LoggerAPI.logD("rcvmsg_background: Received TYPE: " + request.type + ", MESSAGE [" + request.message + "] " + msg);

        var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "]" :
                "in extension script");

        var type = request.type;
        var message = request.message;
        var send = (typeof (sendResponse) == "function");

        if (!CommonAPI.isValidText(type))
        {
            LoggerAPI.logE("rcvmsg_background: Message received is null or empty");
        }
        else if (type == OperatorType.copySelectText)
        {
            if (CommonAPI.isValidText(message))
            {
                StorageAPI.setItem(type, message);
                var result = window.Clipboard.copy(message);
                //if (result) { LoggerAPI.logD("rcvmsg_bgd: Copied text OK."); }
                //MsgBusAPI.msg_bgd2tab(type, message);
            }
        }
        else if (type == OperatorType.getSelectText)
        {
            if (send)
            {
                if (CommonAPI.isValidText(message))
                {
                    StorageAPI.setItem(type, message);
                }
                else
                {
                    message = StorageAPI.getItem(type);
                }
                //var textToTranslated = window.Clipboard.paste();
                var textToTranslated = message;
                //MsgBusAPI.msg_send(type, message);
                //MsgBusAPI.msg_bgd2tab(type, message);
                sendResponse({ type: type, message: textToTranslated });
            }
            else
            {
                LoggerAPI.logW(prefix, "rcvmsg_background: NOT defined the response function!");
            }
        }
        else if (type == OperatorType.speakText)
        {
            chrome.tts.speak(message);
        }
        else if (type == OperatorType.showPageAction)
        {
            //chrome.pageAction.show(sender.tab.id);
        }
        else if (type == OperatorType.openOptionPage)
        {
            if (chrome.tabs)
            {
                var toCaller = function (tab)
                {
                    var response = { type: type, message: "To Open Page: " + message, object: tab };
                    sendResponse(response);
                };

                chrome.tabs.create({ url: message }, toCaller);
            }
            else
            {
                LoggerAPI.logW(prefix + "chrome.tabs is NOT defined!");
            }
        }
        else if (type == OperatorType.setBaikeSetting)
        {
            // set data
            StorageAPI.setItem(OptionItemKeys.IsPageControl, message.control);
            StorageAPI.setItem(OptionItemKeys.BaikeType, message.type);
            StorageAPI.setItem(OptionItemKeys.BaikeWord, message.value);
        }
        else if (type == OperatorType.getBaikeSetting)
        {
            // get data
            var data = {
                control: StorageAPI.getItem(OptionItemKeys.IsPageControl),
                type: StorageAPI.getItem(OptionItemKeys.BaikeType),
                value: StorageAPI.getItem(OptionItemKeys.BaikeWord)
            };

            // clear data
            StorageAPI.setItem(OptionItemKeys.IsPageControl, null);
            StorageAPI.setItem(OptionItemKeys.BaikeType, null);
            StorageAPI.setItem(OptionItemKeys.BaikeWord, null);

            sendResponse({ type: type, message: data, object: data });
        }
        else if (type == OperatorType.loadSettings)
        {
            // tell options to load settings
            var data = {
                EnableTranslation: StorageAPI.getItem(OptionItemKeys.EnableTranslation),
                EnablePopupDialog: StorageAPI.getItem(OptionItemKeys.EnablePopupDialog),
                EnableCopyText: StorageAPI.getItem(OptionItemKeys.EnableCopyText),
                EnableLogger: StorageAPI.getItem(OptionItemKeys.EnableLogger),
                FromLanguage: StorageAPI.getItem(OptionItemKeys.FromLanguage),
                ToLanguage: StorageAPI.getItem(OptionItemKeys.ToLanguage),
                DefaultBaike: StorageAPI.getItem(OptionItemKeys.DefaultBaike),
                EnableAction: StorageAPI.getItem(OptionItemKeys.EnableAction),
                EnableLocation: StorageAPI.getItem(OptionItemKeys.EnableLocation),
                Default: StorageAPI.getItem(OptionItemKeys.Default)
            };
            // MsgBusAPI.bgd2tab(OperatorType.loadSettings, data)
            sendResponse({ type: type, message: data });
        }
        else if (type == OperatorType.saveSettings)
        {
            // start to save settings
            var data = message.message;
            StorageAPI.setItem(OptionItemKeys.EnableTranslation, data.EnableTranslation);
            StorageAPI.setItem(OptionItemKeys.EnablePopupDialog, data.EnablePopupDialog);
            StorageAPI.setItem(OptionItemKeys.EnableCopyText, data.EnableCopyText);
            StorageAPI.setItem(OptionItemKeys.EnableLogger, data.EnableLogger);
            //StorageAPI.setItem(OptionItemKeys.EnableAction, data.EnableAction);
            //StorageAPI.setItem(OptionItemKeys.EnableLocation, data.EnableLocation);

            sendResponse({ type: OperatorType.savedSettings, message: data });
        }
        else if (type == OperatorType.viewWikipages)
        {
            if (CommonAPI.isValidText(message))
            {
                LoggerAPI.logD("rcvmsg_background: Try to open wikipage");
                openWikipage(message);
            }
        }
        else
        {
            if (send)
            {
                sendResponse({ type: type, message: "rcvmsg_background: #BACKGROUND SEND RESPONSE# Received Message:" + message });
            }
            else
            {
                LoggerAPI.logW(prefix, "rcvmsg_background: NOT defined the response function!");
            }
        }
        return true;
    },

    rcvmsg_content: function (request, sender, sendResponse)
    {
        LoggerAPI.logD("rcvmsg_content: Received type: " + request.type + ", message [" + request.message + "] " + msg);

        var msg = (sender.tab ?
            "in content script, sent from tab URL:-- [" + sender.tab.url + "]" :
            "in extension script");

        LoggerAPI.logD("rcvmsg_content: Received type: " + request.type + ", message [" + request.message + "] " + msg);

        var send = (typeof (sendResponse) == "function");
        if (!send)
        {
            LoggerAPI.logW("rcvmsg_cs: NOT defined the response function!");
        }
        else
        {
            var type = request.type;
            var message = request.message;

            if (!CommonAPI.isValidText(type))
            {
                LoggerAPI.logW("rcvmsg_cs: Message received is null or empty");
            }
            else if (type == OperatorType.getSelectText)
            {
                var text = ContentAPI.getSelectedText().toString();
                if (CommonAPI.isValidText(text))
                {
                    LoggerAPI.logD("rcvmsg_cs: replied text [" + text + "] by response function...");
                    sendResponse({ type: type, message: text });
                }
            }
            // else if (type == OperatorType.viewWikipages)
            // {
            // 	LoggerAPI.logW("rcvmsg_cs: to open wiki page");

            /*  ERROR IN CONTENT SCRIPTS
            chrome.tabs is not available:
            You do not have permission to access this API.
            Ensure that the required permission or manifest property is included in your manifest.json.
            */
            // chrome.tabs.create({ url: url });

            // otherwise send message to background
            //tab2ext(OperatorType.viewWikipages, message);

            // }
            // else if (type == OperatorType.viewHomepage)
            // {
            // 	LoggerAPI.logW("rcvmsg_cs: to open home page");
            // }
            else
            {
                LoggerAPI.logE("rcvmsg_cs: feature NOT IMPLEMENTED type: " + type);
                // other features
                sendResponse({ type: type, message: "rcvmsg_cs: [#NOT FEATURED#]" });
            }
        }
    }

};


CheckDebugger();


//var content = AjaxAPI.getFileContentsSync(ProductURIs.WebpagePopup);