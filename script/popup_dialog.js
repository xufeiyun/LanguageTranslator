/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[IFRAME SCRIPTS]: ";

var isTranslatedByInput = false;
var isIFramePopup = true;

var dtStart;
var timeoutId;

var textSelected = null;

var Initialize = function ()
{
    // Run our scripts as soon as the document's DOM is ready.
    // DOMContentLoaded
    addDOMLoadEvent(fnDOMLoadCompleted);

    checkClickAction();

    if (typeof (chrome) != "undefined")
    {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { MsgBusAPI.rcvmsg_iframe(request, sender, sendResponse); });
    }
    

    clearTexts();

    SearchWeb.Initialize();

    i18n.SetLocalization();

    bindTextEvent();

    bindTopLinkEvent();

    bindPronouceEvent();
    
    bindBottomLinkEvent();

    tryTranslateNow();
};

function fnDOMLoadCompleted() 
{
	LoggerAPI.logD("DOM Loaded Completedly.");
    
	// get the translating text by clipboard firstly.
	//var result = translateByClipboard();
	var result = false;
	if (!result)
	{
		// select text from web page
		//chrome.tabs.getSelected(null, translateByMessage);
	}
}

function translateByMessage(activeTab)
{
    // response callback
    var resp_pup = function (response)
    {
        if (!CommonAPI.isDefined(response)) return false;

        LoggerAPI.logD("#RESPONSE#: Received type [" + response.type + "], message [" + response.message + "]");

        var type = response.type;
        var message = response.message;

        if (type == OperatorType.getSelectText)
        {
            if (CommonAPI.isDefined(response) && CommonAPI.isValidText(response.message))
            {
                LoggerAPI.logD("#RESPONSE#: Translating text: " + response.message);
                translate(response.message);
                textSelected.focus();
                textSelected.select();
            }
        }
        else if (type == OperatorType.viewWikipages)
        {
            showWikipages(message);
        }
        else if (type == OperatorType.viewHomepage)
        {
            showHomepage(message);
        }
        else
        {
            var message = CommonAPI.isDefined(response) ? (CommonAPI.isValidText(response.message) ? response.message : "message not defined in response") : ("response not defined");
            LoggerAPI.logE("#RESPONSE#: Received response type: [" + response.type + "], response message: [" + message + "]");
        }
    };

    // test create new tab with specific URL
    //chrome.tabs.create({ url: "http://www.163.com" });

    // test notification popup
    // CommonAPI.showPopupMsg('How are you? - popup');  // notification body text

    // send message to CONTENT SCRIPTS
    LoggerAPI.logD("Translating by message......");

    MsgBusAPI.msg_send(OperatorType.getSelectText, "", resp_pup);
}

function translateByTimeout()
{
	clearTimeout(timeoutId);
	var interval = CommonAPI.getInterval(dtStart, new Date());
	if (interval > AutoTranslationInterval)
	{
		translateByInput();
	}
}

var bindTextEvent = function ()
{    
    // add text events
    textSelected = $("#txtSelected");
    textSelected.focus(function (e)
    {
        clearTexts();
    });
    textSelected.change(function (e)
    {
        clearTexts();
    });
    textSelected.keyup(function (e)
    {
        clearTimeout(timeoutId);
        clearTexts();
        timeoutId = setTimeout(translateByTimeout, AutoTranslationInterval + 100);
    });
    textSelected.keydown(function (e)
    {
        dtStart = new Date();
        if (e.keyCode == 13 && e.shiftKey)
        {
        }
        else if (e.keyCode == 13 && e.ctrlKey)
        {
            translateByInput();
            textSelected.focus();
            e.bubbles = false;
        }
        else if (e.keyCode == 13)
        {
        }
    });
    textSelected.mouseenter(function ()
    {
        textSelected.focus();
        textSelected.select();
    });
    textSelected.focus();
    textSelected.select();

    // must set by codes: set multiple-lines of place holder
    textSelected.addClass("jq_watermark");
    textSelected.watermark();
};

var bindTopLinkEvent = function ()
{    
    // add top link events
    $("#divNavTitle").click(function ()
    {
        openPage(ProductURIs.Product);
    });
    $("#btnSourceText").click(function ()
    {
        openWikipage($("#txtSelected").val());
    });
    $("#btnTranslate").click(function ()
    {
        clearTimeout(timeoutId);
        translateByInput();
        textSelected.focus();
    });
};

var bindPronouceEvent = function ()
{
    // add button events for pronounciation
    $("#" + PronounceAudios.Source.ButtonId).click(function ()
    {
        pronunceText(PronounceAudios.Source.PlayerId);
    });
    $("#" + PronounceAudios.Main.ButtonId).click(function ()
    {
        pronunceText(PronounceAudios.Main.PlayerId);
    });
    $("#" + PronounceAudios.More.ButtonId).click(function ()
    {
        pronunceText(PronounceAudios.More.PlayerId);
    });
};

var bindBottomLinkEvent = function ()
{
    // bottom buttons' events in popup dialog
    $("#btnTranslatorAPI").click(function ()
    {
        var page = this.getAttribute('href');
        openPage(page);
    });
    $("#btnOperations").click(function ()
    {
        openPage("options.html?tab=operations");
    });
    $("#btnOptions").click(function ()
    {
        openPage("options.html");
    });
    $("#btnFeatures").click(function ()
    {
        openPage("options.html?tab=features");
    });
    $("#btnDonations").click(function ()
    {
        openPage("options.html?tab=feedbacks");
    });
    $("#btnAbout").click(function ()
    {
        openPage("options.html?tab=about");
    });
};

function pronunceText(playerId)
{
    var player = $("#" + playerId);
    if (CommonAPI.isDefined(player)) {
        player[0].controls = true;
        player[0].muted = false;
        player[0].volume = 1;
        player[0].play();
    }    
}

var tryTranslateNow = function ()
{
    var resp_iframe = function (response)
    {
        LoggerAPI.logD("#IFRAME received RESPONSE#: type=>" + response.type + ", message=>" + response.message);
        translate(response.message);
    }

    // translate firstly
    MsgBusAPI.msg_send(OperatorType.getSelectText, "", resp_iframe);
};

var checkClickAction = function ()
{
    var logClickAction = function ()
    {
        var value = StorageAPI.getItem(OptionItemKeys.EnableAction);
        if (typeof (value) != "undefined" && value == TrueValue)
        {
            LoggerAPI.logD("Disable The POPUP DIALOG");
        }
        else
        {
            LoggerAPI.logD("Enable The POPUP DIALOG");
        }
    };

    // Fired when a browser action icon is clicked. 
    // This event will NOT fire if the browser action has a popup.
    //chrome.browserAction.onClicked.addListener(function(activeTab) {alert(activeTab.title);});
    if (UsePageAction == false)
    {
        LoggerAPI.logD("use browser action");
        if (typeof (chrome) != "undefined" && typeof (chrome.browserAction) != "undefined")
        {
            chrome.browserAction.onClicked.addListener(function (activeTab)
            {
                logClickAction();
                LoggerAPI.logD("Browser Action Icon Clicked.");
                translateByMessage(activeTab);
            });
        }
    }
    else
    {
        LoggerAPI.logD("use page action");
        if (typeof (chrome) != "undefined" && typeof (chrome.pageAction) != "undefined")
        {
            chrome.pageAction.onClicked.addListener(function (activeTab)
            {
                logClickAction();
                LoggerAPI.logD("Page Action Icon Clicked.");
                translateByMessage(activeTab);
            });
        }
    }

};



$(document).ready(function ()
{
    Initialize();
});
