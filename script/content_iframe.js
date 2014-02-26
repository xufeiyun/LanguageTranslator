/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[IFRAME SCRIPTS]: ";

logD(prefix);

// Error: SecurityError: DOM Exception 18
// when invode webkitNotifications.createNotification in common.js
// from content scripts
var showPopupMsg = logD;
var isTranslatedByInput = false;
var isIFramePopup = true;

// Run our scripts as soon as the document's DOM is ready.
addDOMLoadEvent(fnDOMLoadCompleted);

function fnDOMLoadCompleted() 
{
	logD("DOM Loaded Completedly.");
}

var dtStart;
var timeoutId;

function translateByTimeout()
{
	clearTimeout(timeoutId);
	var interval = getInterval(dtStart, new Date());
	if (interval > AutoTranslationInterval)
	{
		translateByInput();
	}
}

var textSelected = null;

$(document).ready(function ()
{
    //var content = getFileContentsSync(ProductURIs.WebpagePopup);
    clearTexts();

    i18n.SetLocalization();

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

    // add translate events
    $("#btnTranslate").click(function ()
    {
        clearTimeout(timeoutId);
        translateByInput();
        textSelected.focus();
    });

    // open wiki page
    $("#btnSourceText").click(function ()
    {
        openWikipage($("#txtSelected").val());
    });

    $("#btnYouDaoAPI").click(function ()
    {
        openPage('http://fanyi.youdao.com/');
    });

    $("#divNavTitle").click(function ()
    {
        openPage(ProductURIs.Product);
    });

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

    // bottom buttons' events in popup dialog
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

    // set images by codes
    //$(".logoProduct").css("background-image","url(chrome-extension://" + ExtenionUID + "/image/language_19.jpg);");
    //$(".icon-volume-up").css("background-image","url(chrome-extension://" + ExtenionUID + "/image/volume_max.png)!important;");

    // translate firstly
    msg2out(OperatorType.getSelectText, "");
});

function pronunceText(playerId)
{
    var player = $("#" + playerId);
    if (isDefined(player)) {
        player[0].controls = true;
        player[0].muted = false;
        player[0].volume = 1;
        player[0].play();
    }    
}


/*------- Send message --------*/
// Content Script => outter
function msg2out(type, message)
{
    chrome.runtime.sendMessage(ExtenionUID, { type: type, message: message }, resp_iframe);
}
// response callback
function resp_iframe(response)
{
	logD("#IFRAME received RESPONSE#: type=>" + response.type + ", message=>" + response.message);
	translate(response.message);
}
/*END*/

/*------- Receive message --------*/
// Register runtime.onMessage event listener to receive message from Extension

if (typeof(chrome) != "undefined")
{
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { rcvmsg_iframe(request, sender, sendResponse); });
}

function rcvmsg_iframe(request, sender, sendResponse) 
{
	var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "]" :
                "in extension script");
	logD("rcvmsg_iframe: Received TYPE: " + request.type + ", MESSAGE [" + request.message + "] " + msg);
	
	var type = request.type;
	var message = request.message;
	var send = (typeof(sendResponse) == "function");

	if (!isValidText(type))
	{
	    logE("rcvmsg_iframe: Message received is null or empty");
	}
	else if (type == OperatorType.getSelectText)
	{
	    translate(message);
	}
	else if (type == OperatorType.copySelectText)
	{
	    if (isValidText(message))
	    {
	        setItem(OperatorType.copySelectText, message);
	        var result = window.Clipboard.copy(message);
	        if (result) { logD("rcvmsg_iframe: Copied text OK."); }
	    }
	}
	else if (type == OperatorType.showPageAction)
	{
	    //chrome.pageAction.show(sender.tab.id);
	}
	else if (type == OperatorType.viewWikipages)
	{
	    if (isValidText(message))
	    {
	        logD("rcvmsg_iframe: Try to open wikipage");
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
	else
	{
	    if (send)
	    {
	        sendResponse({ type: type, message: "rcvmsg_iframe: #IFRAME SEND RESPONSE# Received Message:" + message });
	    }
	    else
	    {
	        logW(prefix, "rcvmsg_iframe: NOT defined the response function!");
	    }
	}

}
/*END*/
