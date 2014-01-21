/*
	This javascript file is used in BACKGROUND PAGE named background.html
*/

var prefix = "[BACKGROUND SCRIPTS]: ";

/*------- Send message --------*/
// Backgound => Content Script
function bgd2tab(type, message)
{
    chrome.tabs.getSelected(
		null,
		function (tab)
		{
		    chrome.tabs.sendMessage(
				tab.id,
				{ type: type, message: message },
				resp_bgd);
		});
    //chrome.runtime.sendMessage(ExtenionUID, { type: type, message: message }, resp_iframe);
}
// response callback
function resp_bgd(response)
{
	logD("#RESPONSE#: type=>" + response.type + ", message=>" + response.message);
}
/*END*/

/*------- Receive message --------*/
// Register runtime.onMessage event listener to receive message from Extension

if (typeof(chrome) != "undefined")
{
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { rcvmsg_bgd(request, sender, sendResponse); });
}

function rcvmsg_bgd(request, sender, sendResponse) {
    var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "]" :
                "in extension script");
    logD("rcvmsg_bgd: Received TYPE: " + request.type + ", MESSAGE [" + request.message + "] " + msg);

    var type = request.type;
    var message = request.message;
    var send = (typeof (sendResponse) == "function");

    if (!isValidText(type)) {
        logE("rcvmsg_bgd: Message received is null or empty");
    }
    else if (type == OperatorType.copySelectText) {
        if (isValidText(message)) {
            setItem(type, message);
            var result = window.Clipboard.copy(message);
            //if (result) { logD("rcvmsg_bgd: Copied text OK."); }
            //bgd2tab(type, message);
        }
    }
    else if (type == OperatorType.getSelectText) {
        if (send) {
            //var textToTranslated = window.Clipboard.paste();
            var textToTranslated = message;
            bgd2tab(type, message);
            sendResponse({ type: type, message: textToTranslated });
        }
        else {
            logW(prefix, "rcvmsg_bgd: NOT defined the response function!");
        }
    }
    else if (type == OperatorType.speakText) {
        chrome.tts.speak(message);
    }
    else if (type == OperatorType.showPageAction) {
        //chrome.pageAction.show(sender.tab.id);
    }
    else if (type == OperatorType.openOptionPage) {
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
            logW(prefix + "chrome.tabs is NOT defined!");
        }
    }
    else if (type == OperatorType.setBaikeSetting) {
        // set data
        setItem(OptionItemKeys.IsPageControl, message.control);
        setItem(OptionItemKeys.BaikeType, message.type);
        setItem(OptionItemKeys.BaikeWord, message.value);
    }
    else if (type == OperatorType.getBaikeSetting) {        
        // get data
        var data = {
            control: getItem(OptionItemKeys.IsPageControl),
            type: getItem(OptionItemKeys.BaikeType),
            value: getItem(OptionItemKeys.BaikeWord)
        };
        
        // clear data
        setItem(OptionItemKeys.IsPageControl, null);
        setItem(OptionItemKeys.BaikeType, null);
        setItem(OptionItemKeys.BaikeWord, null);

        sendResponse({ type: type, message: data, object: data });
    }
    else if (type == OperatorType.loadSettings) {
        // tell options to load settings
        var data = {
            EnableTranslation: getItem(OptionItemKeys.EnableTranslation),
            EnablePopupDialog: getItem(OptionItemKeys.EnablePopupDialog),
            EnableCopyText: getItem(OptionItemKeys.EnableCopyText),
            EnableLogger: getItem(OptionItemKeys.EnableLogger),
            FromLanguage: getItem(OptionItemKeys.FromLanguage),
            ToLanguage: getItem(OptionItemKeys.ToLanguage),
            DefaultBaike: getItem(OptionItemKeys.DefaultBaike),
            EnableAction: getItem(OptionItemKeys.EnableAction),
            EnableLocation: getItem(OptionItemKeys.EnableLocation),
            Default: getItem(OptionItemKeys.Default)
        };
        // bgd2tab(OperatorType.loadSettings, data)
        sendResponse({ type: type, message: data });
    }
    else if (type == OperatorType.saveSettings) {
        // start to save settings
        var data = message.message;
        setItem(OptionItemKeys.EnableTranslation, data.EnableTranslation);
        setItem(OptionItemKeys.EnablePopupDialog, data.EnablePopupDialog);
        setItem(OptionItemKeys.EnableCopyText, data.EnableCopyText);
        setItem(OptionItemKeys.EnableLogger, data.EnableLogger);
        //setItem(OptionItemKeys.EnableAction, data.EnableAction);
        //setItem(OptionItemKeys.EnableLocation, data.EnableLocation);

        sendResponse({ type: OperatorType.savedSettings, message: data });
    }
    else if (type == OperatorType.viewWikipages) {
        if (isValidText(message)) {
            logD("rcvmsg_bgd: Try to open wikipage");
            openWikipage(message);
        }
    }
    else {
        if (send) {
            sendResponse({ type: type, message: "rcvmsg_bgd: #BACKGROUND SEND RESPONSE# Received Message:" + message });
        }
        else {
            logW(prefix, "rcvmsg_bgd: NOT defined the response function!");
        }
    }
    return true;
}
/*END*/

var UpdateIcon = function (tab)
{
    var action = getItem(OptionItemKeys.EnableAction);
    if (typeof (action) != "undefined" && action == TrueValue)
    {
        chrome.browserAction.setIcon({
            path: "image/language_19.png"
        });
    }
    else
    {
        chrome.browserAction.setIcon({
            path: "image/language_on.png"
        });
    }
};

// addDOMLoadEvent(showPopupMsg); // run ok

// enable translation by default
//setItem(OptionItemKeys.EnableTranslation, true);

// Listen for any changes of any tab by script directly
var tabUpdated = function(tabId, changeInfo, tab){
    if (typeof(chrome) != "undefined" && typeof(chrome.pageAction) != "undefined")
    {
	    chrome.pageAction.show(tabId);
    }
};
// uncomment this one if the extension uses page_action
if (typeof(chrome) != "undefined" && UsePageAction) { chrome.tabs.onUpdated.addListener(tabUpdated); }


if (typeof(chrome) != "undefined" && typeof(chrome.browserAction) != "undefined") {
    chrome.browserAction.onClicked.addListener(function (activeTab) {
        UpdateIcon(activeTab);
    });
}
