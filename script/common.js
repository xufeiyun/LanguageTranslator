/**
	This javascript file is the common file including common features
*/

var prefix = "[COMMON SCRIPTS]: "

var ReleaseId = "hfcnemnjojifmhdgdbhnhiinmjdohlel"; /* release key */
var DebugId1 = "dppekmccnfhabjbkalkadbhofdlhpnld";  /* develop key */
var DebugId2 = "fhpodiibcajbmcllgnoaggldkfanoijo";  /* develop key */
var getExtensionId = function () { var id = ""; try { id = chrome.i18n.getMessage("@@extension_id"); /*extension id: __MSG_@@extension_id__*/ } catch (e) { id = DebugId1; } return id; };
var ExtensionUID = getExtensionId();

var NewLine = "\r\n";
var Comma = ","
var AutoCopyTextInterval = 812;
var AutoTranslationInterval = 600;
var OneLineCharCount = 45;
var EmptyText = "";
var TrueValue = "true";
var UsePageAction = false;

var IsDebugger = (ExtensionUID == DebugId1 || ExtensionUID == DebugId2);

var replace = function (args) {
    var result = args[0].replace(/\{(\d+)\}/g,
        function (m, i) {
            var index = Number(i);
            return args[index + 1];
        });
    return result;
};

/* using {0} etc*/
String.format = function () {
    var result = replace(arguments);
    return result;
};
/* using {0} etc*/
String.prototype.format = function () {
    // build a complete arguments object
    var source = "" + this.valueOf();
    var args = new Array();
    args.push(source);
    for (var index in arguments) { args.push(arguments[Number(index)]); }

    var result = replace(args);
    return result;
};
String.prototype.contains = function (value) {
    var result = false;
    var source = "" + this.valueOf();
    result = source.indexOf(value) >= 0;
    return result;
};
String.prototype.startsWith = function (value) {
    var result = false;
    var source = "" + this.valueOf();
    result = source.indexOf(value) == 0;
    return result;
};

var FunctionNameAPI = {
    ApplyPrintName: function (anObject, aFunction) {
        // if aFunction is specified, then just apply to the function in the object
        for (var key in anObject) {
            if (aFunction && key.toLowerCase() !== aFunction.toLowerCase()) { continue; }

            // if the keys belongs to object and it is a function
            if (anObject.hasOwnProperty(key) && (typeof anObject[key] === 'function')) {
                // overwrite this function
                anObject[key] = (function () {
                    // save the previous function
                    var functionName = key;
                    var functionCode = anObject[functionName];
                    // return new function that will write log message and run the saved function
                    return function () {
                        var output = "";
                        // if anObject defined a debug property
                        if (anObject.debug && (anObject.debug === true || anObject.debug === functionName)) {
                            output = String.format('I am a function [{0}] with arguments: {1}', functionName, arguments);
                            LoggerAPI.logD(output);
                        }
                        output = String.format("Executing function: [{0}] with arguments: {1}", functionName, arguments);
                        LoggerAPI.logD(output);
                        var count = (arguments == null) ? 0 : arguments.length;
                        var result = null;
                        switch (count) {
                            case 0: result = functionCode(arguments); break;
                            case 1: result = functionCode(arguments[0]); break;
                            case 2: result = functionCode(arguments[0], arguments[1]); break;
                            case 3: result = functionCode(arguments[0], arguments[1], arguments[2]); break;
                            case 4: result = functionCode(arguments[0], arguments[1], arguments[2], arguments[3]); break;
                            case 5: result = functionCode(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]); break;
                            case 6: result = functionCode(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]); break;
                            case 7: result = functionCode(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]); break;
                            case 8: result = functionCode(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]); break;
                            case 9: result = functionCode(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]); break;
                            default:
                                console.error('#TODO# There are more than 9 arguments for this function: ' + functionName);
                                result = functionCode(arguments);
                        }
                        return result;
                    };
                })();
            }

            if (aFunction && key.toLowerCase() === aFunction.toLowerCase()) { break; }
        }
    },

    GetFunctionName: function (fn) {
        if (typeof (fn) === 'function') {
            var cbs = fn.toString();
            var name = cbs.match(/function *([a-zA-Z0-9_-]*)/)[1];
            if (name == "") {
                name = "ANONYMOUS FUNCTION"
            }
            return name;
        }
        return 'NOT A FUNCTION';
    }
};

// output current locale
if (!window.location.href.startsWith('file://')) { i18n.PrintLocale(); }

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
    PopupIFramePage: "chrome-extension://" + ExtensionUID + "/popup_dialog.html",
    NineGridIFramePage: "chrome-extension://" + ExtensionUID + "/ninegrid.html",
    ContextIFramePage: "chrome-extension://" + ExtensionUID + "/context_dialog.html",
    WikiPediaEN: "http://en.wikipedia.org/wiki/",
    WikiPediaCN: "http://zh.wikipedia.org/wiki/",
    WebpagePopup: "https://dl.yunio.com/pub/0LpA2l?name=webpage_popup.txt",
    YouDaoURL: "http://fanyi.youdao.com/openapi.do?keyfrom=SZJWCKJ&key=998983058&type=data&doctype=json&version=1.1"
};

var ElementIds = {
    WebPageContextDiv: 'divLanguageTranslatorContext',
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
    EnablePronunciation: "OptionItemKeys_EnablePronunciation",
    EnableTranslation: "OptionItemKeys_EnableTranslation",
    EnablePopupDialog: "OptionItemKeys_EnablePopupDialog",
    EnableContextDialog: "OptionItemKeys_EnableContextDialog",
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
    Default: "OptionItemKeys_Defalt"
};

// Set default values for deployment!
var OptionItemValues = {
    EnablePronunciation: true,
    EnableLogger: false,  // It means to log text to browser console.
    EnablePopupDialog: false,   // It means the webpage-based popup dialog displays automatically after selecting text OR NOT on current webpage that viewed by user.
    EnableContextDialog: false,   // It means the simple context dialog displays automatically after selecting text OR NOT on current webpage that viewed by user.

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

        OptionItemValues.EnablePronunciation = false;   // disable pronunce for dev env
        OptionItemValues.EnableLogger = true;   // enable log for dev env
        OptionItemValues.EnablePopupDialog = true; // open popup dialog in debug mode
        OptionItemValues.EnableContextDialog = false; // don't open simple dialog in debug mode
    }
};

var CommonAPI = {
    showPopupMsg: function (message) {
        //LoggerAPI.logD("SHOW NOTIFICATION WITH MESSAGE: " + message);
        try {
            // notification popup
            var notify = webkitNotifications.createNotification(
                    'image/notify_logo.png',      // icon url - can be relative
                    prefix,                 // notification title
                    message                 // notification body text
                );
            notify.show();
        }
        catch (e) {
            LoggerAPI.logE("try to popup msg: [" + message + "]. " + e.toLocaleString());
        }
    },

    alertMsg: function (message) {
        CommonAPI.showPopupMsg(message);
    },

    importJS: function (path) {
        LoggerAPI.logD("[Try importing javascript file into viewed page dynamically] file path: " + path);
        var i;
        var ss = document.getElementsByTagName("script");
        for (i = 0; i < ss.length; i++) {
            if (ss[i].src && ss[i].src.indexOf(path) != -1) {
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

    getInterval: function (start, end) {
        if (CommonAPI.isDefined(start) && CommonAPI.isDefined(end)) {
            var interval = (end.getTime() - start.getTime());
            return interval;
        }
        else {
            return 0;
        }
    },

    encodeText: function (text) {
        return encodeURIComponent(text);
    },

    isDefined: function (variable) {
        return (typeof (variable) != "undefined");
    },

    isValidText: function (text) {
        // return CommonAPI.isDefined(text) && !(text == null || text.trim() == "");
        return CommonAPI.isDefined(text) && !(text == null || $.trim(text) == "");
    },

    isFunction: function (fnName) {
        return (typeof (fnName) == "function");
    },

    now: function () {
        var d = new Date();
        var ms = (1000 + d.getMilliseconds()).toString().substr(1);
        var value = "[" + d.toLocaleString() + " - " + ms + "] ";
        return value;
    },

    removeDuplicated: function (data, character) {
        var text = data;
        // removing duplicated comma
        while (text.indexOf(character + character) > -1) {
            text = text.replace(character + character, character);
        }
        // end
        return text;
    },

    removeInsideSpaces: function (text) {
        text = text.replace(/\s/g, "");
        return text;
    },

    // judge whether the word contains chinese or not
    isChinese: function (s) {
        var pattern = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        var result = (pattern.exec(s) != null); // ok chinese
        return result;
    },

    getFunctionName: function (fn) {
        return FunctionNameAPI.GetFunctionName(fn);
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
    getElement: function (id, pDocument) {
        // return jquery object
        if (pDocument != undefined && pDocument != null) {
            return $(pDocument.getElementById(id));
            //return $(pDocument.documentElement).children("body").children("[id='" + id + "']")
        }
        else {
            return $(DomAPI.getById(id));
        }
    },

    getById: function (id, pDocument) {
        // return html element
        if (pDocument != undefined && pDocument != null) {
            return pDocument.getElementById(id)
        }
        else {
            return DomAPI.getDocument().getElementById(id);
        }
    },
    appendChild: function (element, pDocument) {
        if (pDocument != undefined && pDocument != null) {
            pDocument.body.appendChild(element);
        }
        else {
            DomAPI.getDocument().body.appendChild(element);
        }
    },
    createElement: function (tag) {
        return DomAPI.getDocument().createElement(tag);
    },


    getsByTag: function (tag) {
        return DomAPI.getDocument().getElementsByTagName(tag);
    },

    getDocument: function () {
        var doc = null;
        try {
            var doc = top.window.document;
        } catch (e) {
            doc = document;
        }
        return doc;
    },

    getValue: function (element, key) {
        if (element) {
            return element.getAttribute(key);
        } else {
            return "";
        }
    },

    setValue: function (element, key, value) {
        if (element) {
            return element.setAttribute(key, value);
        } else {
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

var OptionItems = {
    LoadSettings: function (fnResponse) {
        // tell options to load settings
        var data = {
            EnableTranslation: StorageAPI.getItem(OptionItemKeys.EnableTranslation),
            EnablePopupDialog: StorageAPI.getItem(OptionItemKeys.EnablePopupDialog),
            EnableContextDialog: StorageAPI.getItem(OptionItemKeys.EnableContextDialog),
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
        if (typeof (fnResponse) == 'function') fnResponse({ type: OperatorType.loadSettings, message: data });
    },
    UpdateSettings: function (data) {
        if (typeof (data) == 'undefined') return;

        var type = data.type;
        var message = data.message;
        // update settings
        if (typeof (message.EnableTranslation) != 'undefined' && message.EnableTranslation == TrueValue) {
            OptionItemValues.EnableTranslation = (message.EnableTranslation == TrueValue);
        }
        if (typeof (message.EnablePopupDialog) != 'undefined' && message.EnablePopupDialog == TrueValue) {
            OptionItemValues.EnablePopupDialog = (message.EnablePopupDialog == TrueValue);
        }
        if (typeof (message.EnableContextDialog) != 'undefined' && message.EnableContextDialog == TrueValue) {
            OptionItemValues.EnableContextDialog = (message.EnableContextDialog == TrueValue);
        }
        if (typeof (message.EnableCopyText) != 'undefined' && message.EnableCopyText == TrueValue) {
            OptionItemValues.EnableCopyText = (message.EnableCopyText == TrueValue);
        }
        if (typeof (message.EnableLogger) != 'undefined' && message.EnableLogger == TrueValue) {
            OptionItemValues.EnableLogger = (message.EnableLogger == TrueValue);
        }
        if (typeof (message.EnableAction) != 'undefined' && message.EnableAction == TrueValue) {
            OptionItemValues.EnableAction = (message.EnableAction == TrueValue);
        }
        if (typeof (message.EnableLocation) != 'undefined' && message.EnableLocation == TrueValue) {
            OptionItemValues.EnableLocation = (message.EnableLocation == TrueValue);
        }

        if (message.FromLanguage) {
            OptionItemValues.FromLanguage = (message.FromLanguage);
        }
        if (message.ToLanguage) {
            OptionItemValues.ToLanguage = (message.ToLanguage);
        }
        if (message.DefaultBaike) {
            OptionItemValues.DefaultBaike = (message.DefaultBaike);
        }
        if (message.Default) {
            OptionItemValues.Default = (message.Default);
        }
    },
    SaveSettings: function (fnResponse, message) {
        // start to save settings
        var data = message.message;
        StorageAPI.setItem(OptionItemKeys.EnableTranslation, data.EnableTranslation);
        StorageAPI.setItem(OptionItemKeys.EnablePopupDialog, data.EnablePopupDialog);
        StorageAPI.setItem(OptionItemKeys.EnableContextDialog, data.EnableContextDialog);
        StorageAPI.setItem(OptionItemKeys.EnableCopyText, data.EnableCopyText);
        StorageAPI.setItem(OptionItemKeys.EnableLogger, data.EnableLogger);
        //StorageAPI.setItem(OptionItemKeys.EnableAction, data.EnableAction);
        //StorageAPI.setItem(OptionItemKeys.EnableLocation, data.EnableLocation);

        if (typeof (fnResponse) == 'function') fnResponse({ type: OperatorType.savedSettings, message: data });
    },
    GetBaikeSetting: function (fnResponse) {
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

        if (typeof (fnResponse) == 'function') fnResponse({ type: OperatorType.getBaikeSetting, message: data, object: data });
    },

    SetBaikeSetting: function (fnResponse, message) {
        // set data
        StorageAPI.setItem(OptionItemKeys.IsPageControl, message.control);
        StorageAPI.setItem(OptionItemKeys.BaikeType, message.type);
        StorageAPI.setItem(OptionItemKeys.BaikeWord, message.value);

        if (typeof (fnResponse) == 'function') fnResponse({ type: OperatorType.getBaikeSetting, message: null });
    }
};

var MsgBusAPI = {
    // content script => outer
    msg_send: function (type, message, callback) {
        var url = window.location.href;
        if (url.startsWith('file://')) { console.warn("[MSG NOT SEND] You may access file locally: " + url); return false; }

        var output = String.format("#msg_send# sending message: type=>[{0}], message=>[{1}], callback function=>[{2}]", type, message, CommonAPI.getFunctionName(callback));
        LoggerAPI.logD(output);

        chrome.runtime.sendMessage(
            ExtensionUID,
            { type: type, message: message },
            function (response) { MsgBusAPI._msg_resp(response, callback); }
        );
    },

    // background => content script
    // chrome.tabs undefined for content scripts
    msg_bgd2tab: function (type, message, callback) {

        var output = String.format("#msg_bgd2tab# sending message: type=>[{0}], message=>[{1}], callback function=>[{2}]", type, message, CommonAPI.getFunctionName(callback));
        LoggerAPI.logD(output);

        var queryResponse = function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: type, message: message },
                function (response) { MsgBusAPI._msg_resp(response, callback); }
            );
        };
        /*  ERROR IN CONTENT SCRIPTS
        chrome.tabs is not available:
        You do not have permission to access this API.
        Ensure that the required permission or manifest property is included in your manifest.json.
        */
        chrome.tabs.query({ 'active': true }, queryResponse);
    },

    // response callback
    msg_resp: function (response) {
        LoggerAPI.logD("#msg_resp: RESPONSE Received#: ", response);
    },

    _msg_resp: function (response, callback) {
        MsgBusAPI.msg_resp(response);

        // invoke user's callback function
        if (callback != undefined && callback != null) {
            // response may be a function from receiver
            if (typeof (response) == 'function') {
                response(callback);
            } else {
                callback(response);
            }
        } else {
            LoggerAPI.logD("_msg_resp: callback is NOT defined");
        }
        return true;
    },

    _resp_data: function (receiver, type, message, callback, data) {
        var data_resp = {
            receiver: receiver,
            type: type,
            message: message,
            callback: callback,
            calldata: data
        };
        return data_resp;
    },

    // receivers
    rcvmsg_popup: function (request, sender, sendResponse) {
        var type = request.type;
        var message = request.message;
        var send = (typeof (sendResponse) == "function");

        if (!CommonAPI.isValidText(type)) {
            LoggerAPI.logE("rcvmsg_iframe: Message received is null or empty");
        }
        else if (type == OperatorType.getSelectText) {
            TranslatorAPI.translate(message);
        }
        else if (type == OperatorType.copySelectText) {
            if (CommonAPI.isValidText(message)) {
                StorageAPI.setItem(OperatorType.copySelectText, message);
                var result = window.Clipboard.copy(message);
                if (result) { LoggerAPI.logD("rcvmsg_iframe: Copied text OK."); }
            }
        }
        else if (type == OperatorType.showPageAction) {
            //chrome.pageAction.show(sender.tab.id);
        }
        else if (type == OperatorType.viewWikipages) {
            var text = message;
            showWikipages(text);
            if (CommonAPI.isValidText(text)) {
                LoggerAPI.logD("rcvmsg_iframe: Try to open wikipage");
                {
                    // fromWikipedia(text);	// ok
                }
                // or
                {
                    //fromBaiduAPI(message);
                    fromTencentAPI(text);
                }
            }
        }
        else if (type == OperatorType.viewHomepage) {
            showHomepage(message);
        }
        else {
            if (send) {
                var data = MsgBusAPI._resp_data("rcvmsg_popup", type, "rcvmsg_iframe: #IFRAME SEND RESPONSE# Received Message:" + message);
                sendResponse(data);
            }
            else {
                LoggerAPI.logW(prefix, "rcvmsg_iframe: NOT defined the response function!");
            }
        }

    },

    rcvmsg_background: function (request, sender, sendResponse) {
        var type = request.type;
        var message = request.message;
        var send = (typeof (sendResponse) == "function");

        if (!CommonAPI.isValidText(type)) {
            LoggerAPI.logE("rcvmsg_background: Message received is null or empty");
        }
        else if (type == OperatorType.copySelectText) {
            if (CommonAPI.isValidText(message)) {
                StorageAPI.setItem(type, message);
                var result = window.Clipboard.copy(message);
                //if (result) { LoggerAPI.logD("rcvmsg_bgd: Copied text OK."); }
                //MsgBusAPI.msg_bgd2tab(type, message);
            }
        }
        else if (type == OperatorType.getSelectText) {
            if (send) {
                if (CommonAPI.isValidText(message)) {
                    StorageAPI.setItem(type, message);
                }
                else {
                    // get item from local storage
                    message = StorageAPI.getItem(type);
                }
                //var textToTranslated = window.Clipboard.paste();
                var textToTranslated = message;

                //MsgBusAPI.msg_send(type, textToTranslated);

                MsgBusAPI.msg_bgd2tab(type, textToTranslated);   // this is for page dialog

                var data = MsgBusAPI._resp_data("rcvmsg_background", type, textToTranslated);
                sendResponse(data); // this is for extension dialog
            }
            else {
                LoggerAPI.logW(prefix, "rcvmsg_background: NOT defined the response function!");
            }
        }
        else if (type == OperatorType.speakText) {
            chrome.tts.speak(message);
        }
        else if (type == OperatorType.showPageAction) {
            //chrome.pageAction.show(sender.tab.id);
        }
        else if (type == OperatorType.openOptionPage) {
            if (chrome.tabs) {
                var toCaller = function (tab) {
                    var data = MsgBusAPI._resp_data("rcvmsg_background", type, "To Open Page: " + message, null, tab);
                    sendResponse(data);
                };

                chrome.tabs.create({ url: message }, toCaller);
            }
            else {
                LoggerAPI.logW(prefix + "chrome.tabs is NOT defined!");
            }
        }
        else if (type == OperatorType.setBaikeSetting) {
            OptionItems.SetBaikeSetting(sendResponse, message);
        }
        else if (type == OperatorType.getBaikeSetting) {
            OptionItems.GetBaikeSetting(sendResponse);
        }
        else if (type == OperatorType.loadSettings) {
            OptionItems.LoadSettings(sendResponse);
        }
        else if (type == OperatorType.saveSettings) {
            OptionItems.SaveSettings(sendResponse, message);
        }
        else if (type == OperatorType.viewWikipages) {
            if (CommonAPI.isValidText(message)) {
                WikiAPI.fromWikipage(message);
            }
        }
        else {
            if (send) {
                var data = MsgBusAPI._resp_data("rcvmsg_background", type, "#BACKGROUND SEND RESPONSE# Received Message:" + message);
                sendResponse(data);
            }
            else {
                LoggerAPI.logW(prefix, "rcvmsg_background: NOT defined the response function!");
            }
        }
        return true;
    },

    rcvmsg_content: function (request, sender, sendResponse) {
        var send = (typeof (sendResponse) == "function");
        if (!send) {
            LoggerAPI.logW("rcvmsg_cs: NOT defined the response function!");
        }
        else {
            var type = request.type;
            var message = request.message;

            if (!CommonAPI.isValidText(type)) {
                LoggerAPI.logW("rcvmsg_cs: Message received is null or empty");
            }
            else if (type == OperatorType.getSelectText) {
                var text = ContentAPI.getSelectedText().toString();
                if (CommonAPI.isValidText(text)) {
                    LoggerAPI.logD("rcvmsg_content: replied text [" + text + "] by response function...");
                    var data = MsgBusAPI._resp_data("rcvmsg_content", type, text);
                    sendResponse(data);
                }
            }
            else {
                LoggerAPI.logE("rcvmsg_cs: feature NOT IMPLEMENTED type: " + type);
                // other features
                var data = MsgBusAPI._resp_data("rcvmsg_content", type, "[#NOT FEATURED#]");
                sendResponse(data);
            }
        }
    },

    rcvmsg_ninegrid: function (request, sender, sendResponse) {
        // begin===placeholders
        var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "]" :
                "in extension script");

        LoggerAPI.logD("rcvmsg_ninegrid: Received TYPE: " + request.type + ", MESSAGE [" + request.message + "] " + msg);
        // end===placeholders
    },

    // consider to use iframe for page context div
    rcvmsg_context: function (request, sender, sendResponse) {
        var type = request.type;
        var message = request.message;
        var send = (typeof (sendResponse) == "function");

        if (!CommonAPI.isValidText(type)) {
            LoggerAPI.logE("rcvmsg_context: Message received is null or empty");
        }
        else if (type == OperatorType.getSelectText) {
            TranslatorAPI.translate(message, ContextAPI.UpdateMeanings);
        }
        else {
            if (send) {
                var data = MsgBusAPI._resp_data("rcvmsg_content", type, "#IFRAME SEND RESPONSE# Received Message:" + message);
                sendResponse(data);
            }
            else {
                LoggerAPI.logW(prefix, "rcvmsg_context: NOT defined the response function!");
            }
        }

    }
};

var ListenerAPI =
{
    // this listener's callback includes args: (request, sender, response)
    onMessageListener: function (receiver_callback) {
        if (ListenerAPI.isChromed) {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (receiver_callback == null || typeof (receiver_callback) != 'function') {
                    LoggerAPI.logE('receiver_callback is empty or undefined!');
                    LoggerAPI.logD(receiver_callback);
                } else {
                    receiver_callback(request, sender, sendResponse);
                }
            });
        } else {
            LoggerAPI.logW('chrome or chrome.runtime is undefined!');
        }
    },

    // this listener's callback includes args: (activeTab)
    onIconClickListener: function (receiver_callback) {
        if (typeof (chrome) != "undefined" && typeof (chrome.browserAction) != "undefined") {
            chrome.browserAction.onClicked.addListener(function (activeTab) {
                receiver_callback(activeTab);
            });
        }
    },

    // this listener's callback includes args: (tabId, changeInfo, tab)
    onTabUpdateListener: function (receiver_callback) {
        // uncomment this one if the extension uses page_action
        if (typeof (chrome) != "undefined" && typeof (chrome.tabs) != "undefined" && UsePageAction) {
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                receiver_callback(tabId, changeInfo, tab);
            });
        }
    },

    isChromed: function () {
        return (typeof (chrome) != "undefined" && typeof (chrome.runtime) != "undefined");
    }
};

FunctionNameAPI.ApplyPrintName(MsgBusAPI);
FunctionNameAPI.ApplyPrintName(OptionItems);

if (!IsDebugger) {
    // load configs
    MsgBusAPI.msg_send(OperatorType.loadSettings, '[load configs]', OptionItems.UpdateSettings);
} else {
    CheckDebugger();
}

//var content = AjaxAPI.getFileContentsSync(ProductURIs.WebpagePopup);