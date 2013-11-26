
/*-------  --------*/

/**
	This javascript file is the common file including common features
*/

var ExtenionUID = "hfcnemnjojifmhdgdbhnhiinmjdohlel"; // release key
var ExtenionUID = "dppekmccnfhabjbkalkadbhofdlhpnld"; // develop key

var NewLine = "\r\n";
var AutoCopyTextInterval = 1000;
var AutoTranslateInterval = 812;
var OneLineCharCount = 45;
var EmptyText = "";
var TrueValue = "true";
var UsePageAction = false;

var OperatorType = 
{
    getSelectText: "OperatorTypeKey_GetSelectText",
    copySelectText: "OperatorTypeKey_CopySelectText",
    getCopiedText: "OperatorTypeKey_GetCopiedText",
    viewWikipages: "OperatorTypeKey_ViewWikipages",
    viewHomepage: "OperatorTypeKey_ViewHomepage",
    setPageControl: "OperatorTypeKey_SetPageControl",
    setBaikeType: "OperatorTypeKey_SetBaikeType",
    showPageAction: "OperatorTypeKey_ShowPageAction",
    speakText: "OperatorTypeKey_SpeakText",
    loadSettings: "OperatorTypeKey_LoadSettings",
    saveSettings: "OperatorTypeKey_SaveSettings",
    savedSettings: "OperatorTypeKey_SavedSettings"
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
    DefaultBaikie:          "OptionItemKeys_DefaultBaikie",
    EnableAction:           "OptionItemKeys_EnableAction",
    Default:                "OptionItemKeys_defalt"
}

var OptionItemValues = 
{
    ClosedPopupDialog:      false,
    EnableTranslation:      true,   // It means translation takes effect OR NOT thru webpage-based popup dialog or the extension-based popup dialog.
    EnablePopupDialog:      true,   // It means the webpage-based popup dialog takes effect OR NOT on current webpage that viewed by user.
    EnableCopyText:         false,  // It means to copy the selected text automatically on current webpage.
    EnableLogger:           true,   // It means to log text to browser console.
    FromLanguage:           'en',
    ToLanguage:             'cn',
    DefaultBaikie:          'baidu',    // one type of BaikeType,
    EnableAction:           true,       // It means to enable the Text Translation feature which means it is able to popup the dialog. Highest switch than OptionItemKeys.EnableTranslation and OptionItemKeys. EnablePopupDialog!
    Default:                "defalt"    // placeholder
}

function showPopupMsg(message)
{
    logD("SHOW NOTIFICATION WITH MESSAGE: " + message);
    try
    {
        // notification popup
        var notify = webkitNotifications.createNotification(
                    'notify_logo.png',      // icon url - can be relative
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
	console.debug("[Try importing javascript file into viewed page dynamically] file path: " + path);
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

// prefix is defined in each js file
function logD(message)
{
	if (OptionItemValues.EnableLogger && isDefined(console.debug)) console.debug(prefix + message);
}

function logW(message)
{
	if (OptionItemValues.EnableLogger && isDefined(console.warn)) console.warn(prefix + message);
}

function logE(message)
{
	if (OptionItemValues.EnableLogger && isDefined(console.error)) console.error(prefix + message);
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
