/**
	This javascript file is the common file including common features
*/

var prefix = "[COMMON SCRIPTS]: "

var ReleaseId = "hfcnemnjojifmhdgdbhnhiinmjdohlel"; // release key
var DebugerId = "dppekmccnfhabjbkalkadbhofdlhpnld"; // develop key
var DebugerId = "fhpodiibcajbmcllgnoaggldkfanoijo"; // develop key

var ExtenionUID = DebugerId;
var ExtenionUID = ReleaseId;

var NewLine = "\r\n";
var AutoCopyTextInterval = 812;
var AutoTranslationInterval = 600;
var OneLineCharCount = 45;
var EmptyText = "";
var TrueValue = "true";
var UsePageAction = false;
var IsDebugger = (ExtenionUID == DebugerId);

var OperatorType = 
{
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

var BaikeType = 
{
    baidu: "baidu",
    tencent: "soso",
    wikicn: "wikicn",
    wikien: "wikien"
};

var PronounceAudios =
{
    Source: {ContainerId: 'divReadSource', PlayerId: 'audioReadSource', ButtonId: 'btnReadSource'},
    Main: {ContainerId: 'divReadMain', PlayerId: 'audioReadMain', ButtonId: 'btnReadMain'},
    More: {ContainerId: 'divReadMore', PlayerId: 'audioReadMore', ButtonId: 'btnReadMore'}
};

var ProductURIs =
{
    Product: "https://chrome.google.com/webstore/detail/language-translator/" + ExtenionUID,
    PopupIFramePage: "chrome-extension://" + ExtenionUID + "/background_popup_iframe.html",
    WikiPediaEN: "http://en.wikipedia.org/wiki/",
    WikiPediaCN: "http://zh.wikipedia.org/wiki/",
    WebpagePopup: "https://dl.yunio.com/pub/0LpA2l?name=webpage_popup.txt",
    YouDaoURL: "http://fanyi.youdao.com/openapi.do?keyfrom=SZJWCKJ&key=998983058&type=data&doctype=json&version=1.1"
};

var ElementIds = 
{
    WebPagePopupDiv:        'divLanguageTranslator',
    PopupIFrame:            'frameLanguageTranslator',
    PopupButtonClose:       'btnLanguageTranslatorClose',
    PopupButtonCollapse:    'btnLanguageTranslatorCollapse',
    PopupButtonDisable:     'btnLanguageTranslatorDisable'
}

var OptionItemKeys = 
{
    EnableTranslation:      "OptionItemKeys_EnableTranslation",
    EnablePopupDialog:      "OptionItemKeys_EnablePopupDialog",
    EnableCopyText:         "OptionItemKeys_EnableCopyText",
    EnableLogger:           "OptionItemKeys_EnableLogger",
    FromLanguage:           "OptionItemKeys_FromLanguage",
    ToLanguage:             "OptionItemKeys_ToLanguage",
    DefaultBaike:           "OptionItemKeys_DefaultBaike",
    EnableAction:           "OptionItemKeys_EnableAction",
    EnableLocation:         "OptionItemKeys_EnableLocation",
    StartLocation:          "OptionItemKeys_StartLocation",
    IsPageControl:          "OptionItemKeys_IsPageControl",
    BaikeType:              "OptionItemKeys_BaikeType",
    BaikeWord:              "OptionItemKeys_BaikeWord",
    EnablePronunciation:    "OptionItemKeys_EnablePronunciation",
    Default:                "OptionItemKeys_defalt"
}

// Set default values for deployment!
var OptionItemValues = 
{
    EnableLogger:           false,  // It means to log text to browser console.
    EnablePronunciation:    true,
    EnablePopupDialog:      false,   // It means the webpage-based popup dialog displays automatically OR NOT on current webpage that viewed by user.
    
    ClosedPopupDialog:      false,
    EnableTranslation:      true,   // It means translation takes effect OR NOT thru webpage-based popup dialog or the extension-based popup dialog.
    EnableCopyText:         false,  // It means to copy the selected text automatically on current webpage.
    FromLanguage:           'en',
    ToLanguage:             'cn',
    DefaultBaike:           'baidu',    // one type of BaikeType,
    EnableAction:           true,   // It means to enable the Text Translation feature which means it is able to popup the dialog. Highest switch than OptionItemKeys.EnableTranslation and OptionItemKeys. EnablePopupDialog!
    EnableLocation:         true,   // It means to send geo location to me.
    Default:                "default"   // placeholder
}

// Change default values for debug mode!
if (IsDebugger)
{
    logW("DEBUG MODE: Enable Logger, Disable Pronunciation, Show Popup Dialog!");

    OptionItemValues.EnableLogger = true;   // enable log for dev env
    OptionItemValues.EnablePronunciation = false;   // disable pronunce for dev env
    OptionItemValues.EnablePopupDialog = true; // open dialog in debug mode
}

function showPopupMsg(message)
{
    //logD("SHOW NOTIFICATION WITH MESSAGE: " + message);
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
        logE("try to popup msg: [" + message + "]. " + e.toLocaleString());
    }
}

/*-------Import js file dynamically--------*/
function importJS(path) 
{
	logD("[Try importing javascript file into viewed page dynamically] file path: " + path);
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
}
/*END*/

/*------- COMMON FUNCTIONS --------*/
function getInterval(start, end)
{
    if (isDefined(start) && isDefined(end))
    {
        var interval = (end.getTime() - start.getTime());
        return interval;
    }
    else
    {
        return 0;
    }
}

function encodeText(text)
{
    return encodeURIComponent(text);
}
function isDefined(variable) 
{
    return (typeof(variable) != "undefined");
}
function isValidText(text)
{
	// return isDefined(text) && !(text == null || text.trim() == "");
    return isDefined(text) && !(text == null || $.trim(text) == "");
}
function isFunction(fnName)
{
    return (typeof(fnName) == "function");
}

function AlertMsg(message)
{
	showPopupMsg(message);
}

function now()
{
    var d = new Date();
    var ms = (1000 + d.getMilliseconds()).toString().substr(1);
    var value = "[" + d.toLocaleString() + " - " + ms + "] ";
    return value;
}

// prefix is defined in each js file
function logD(message)
{
    //console.debug(prefix + message);
	if (OptionItemValues.EnableLogger && isDefined(console.debug)) console.debug(now() + prefix + message);
}

function logW(message)
{
    //console.warn(prefix + message);
	if (OptionItemValues.EnableLogger && isDefined(console.warn)) console.warn(now() + prefix + message);
}

function logE(message)
{
    //console.error(prefix + message);
	if (OptionItemValues.EnableLogger && isDefined(console.error)) console.error(now() + prefix + message);
}

function getElement(id, pDocument)
{
    // return jquery object
    if (pDocument != undefined && pDocument != null)
    {
        return $(pDocument.getElementById(id));
        //return $(pDocument.documentElement).children("body").children("[id='" + id + "']")
    }
    else
    {
        return $(getById(id));
    }
}
function getById(id, pDocument)
{
    // return html element
    if (pDocument != undefined && pDocument != null)
    {
        return pDocument.getElementById(id)
    }
    else
    {
	    return getDocument().getElementById(id);
    }
}

function showPopup(id, pDocument)
{
    setTimeout(function ()
    {
        getElement(id, pDocument).slideDown();
    }, 10);
}

function hidePopup(id, pDocument)
{
    setTimeout(function ()
    {
        getElement(id, pDocument).slideUp();
    }, 100);
}

function appendChild(element, pDocument)
{
    if (pDocument != undefined && pDocument != null)
    {
        pDocument.body.appendChild(element);
    }
    else
    {
        getDocument().body.appendChild(element);
    }
}
function createElement (tag)
{
    return getDocument().createElement(tag);
}


function getsByTag(tag)
{
	return getDocument().getElementsByTagName(tag);
}

function getDocument()
{
    //var doc = document;
    var doc = top.window.document;
    return doc;
}

function getValue(element, key)
{
    if (element) {
        return element.getAttribute(key);
    } else {
        return "";
    }
}

function setValue(element, key, value)
{
    if (element) {
        return element.setAttribute(key, value);
    } else {
        return "";
    }
}


function removeDuplicated(data, character)
{
    var text = data;
    // removing duplicated comma
    while (text.indexOf(character + character) > -1) {
        text = text.replace(character + character, character);
    }
    // end
    return text;
}

function removeInsideSpaces(text)
{
    text = text.replace(/\s/g,"");
    return text;
}

function getFileContents(url, fnSuccess, type, fnFailure)
{
    if (!isValidText(type)) { type = 'text'; }
    if (!isValidText(url)) { return false; }

    $.ajax({
        url: url,
        dataType : type,
        type: "get",
        async: true,
        success: function(result)
        {
            if (isDefined(fnSuccess)) { fnSuccess(result); }
        },
        error: function(e)
        {
            if (isDefined(fnFailure)) { fnFailure(e); }
        }
    });

    return true;
}


function getFileContentsSync(url, type)
{
    if (!isValidText(type)) { type = 'text'; }
    if (!isValidText(url)) { return ""; }

    return $.ajax({
        url: url,
        dataType : type,
        type: "get",
        async: false
    }).responseText;
}



// judge whether the word contains chinese or not
function isChinese(s)
{
    var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    var result = patrn.exec(s) != null;
    return result;
}

function getFunctionName(fn)
{
    if (typeof (fn) == 'function')
    {
        var cbs = fn.toString();
        var name = cbs.match(/function ([a-zA-Z0-9_-]*)/)[1];
        return name;
    }
    return 'NOT A FUNCTION';
}

/*------- Send message --------*/
// Content Script => outter
function msg_send(type, message, callback)
{
    var need_resp = function (response)
    {
        msg_resp(response);
        // get tab
        if (callback != undefined && callback != null)
        {
            callback(response);
        }
        return true;
    };
    logD("#COMMON: callback function: " + getFunctionName(callback));
    logD("#COMMON: Sending message...");
    chrome.runtime.sendMessage(ExtenionUID, { type: type, message: message }, need_resp);
}
// response callback
function msg_resp(response)
{
    if (response != null)
    {
        logD("#COMMON: Received RESPONSE#: type=>" + response.type + ", message=>" + response.message);
    }
    else
    {
        logW("#COMMON: Received RESPONSE#: response is null");
    }
}
/*END*/