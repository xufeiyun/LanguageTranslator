/*
	This javascript file is used in POPUP PAGE named popup.html
*/

var prefix = "[POPUP SCRIPTS]: ";
var dtStart;
var timeoutId;

function translateByTimeout()
{
	clearTimeout(timeoutId);
	var interval = getInterval(dtStart, new Date());
	if (interval > AutoTranslateInterval)
	{
		translateByInput();
	}
}

var textSelected = null;

$(document).ready(function () {
    // add text events
    textSelected = $("#txtSelected");
    textSelected.focus(function (e) {
        clearTexts();
    });
    textSelected.change(function (e) {
        clearTexts();
    });
    textSelected.keyup(function (e) {
        clearTimeout(timeoutId);
        clearTexts();
        timeoutId = setTimeout(translateByTimeout, AutoTranslateInterval + 100);
    });
    textSelected.keydown(function (e) {
        dtStart = new Date();
        if (e.keyCode == 13 && e.shiftKey) {
        }
        else if (e.keyCode == 13 && e.ctrlKey) {
            translateByInput();
            textSelected.focus();
            e.bubbles = false;
        }
        else if (e.keyCode == 13) {
        }
    });
    textSelected.mouseenter(function () {
        textSelected.focus();
        textSelected.select();
    });
    textSelected.focus();
    textSelected.select();

    // add translate events
    $("#btnTranslate").click(function () {
        clearTimeout(timeoutId);
        translateByInput();
        textSelected.focus();
    });

    $("#btnViewWikipage").click(function () {
        openWikipage($("#txtSelected").val());
    });
    $("#navTitle").click(function () {
        openHomepage();
    });

    // add button events for pronounciation
    $("#" + PronounceAudios.Source.ButtonId).click(function () {
        pronunceText(PronounceAudios.Source.PlayerId);
    });
    $("#" + PronounceAudios.Main.ButtonId).click(function () {
        pronunceText(PronounceAudios.Main.PlayerId);
    });
    $("#" + PronounceAudios.More.ButtonId).click(function () {
        pronunceText(PronounceAudios.More.PlayerId);
    });
    
    // hide footer by default
    $("#footer").hide();
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

var checkClickAction = function ()
{
    var value = getItem(OptionItemKeys.EnableAction);
    if (typeof (value) != "undefined" && value == TrueValue)
    {
        logD("Disable The POPUP DIALOG");
    }
    else
    {
        logD("Enable The POPUP DIALOG");        
    }
};

// Fired when a browser action icon is clicked. 
// This event will NOT fire if the browser action has a popup.
//chrome.browserAction.onClicked.addListener(function(activeTab) {alert(activeTab.title);});
if (UsePageAction == false)
{
    logD("use browser action");
    if (typeof (chrome) != "undefined" && typeof (chrome.browserAction) != "undefined")
    {
        chrome.browserAction.onClicked.addListener(function (activeTab)
        {
            checkClickAction();
            logD("Browser Action Icon Clicked.");
            translateByMessage(activeTab);
        });
    }
}
else
{
    logD("use page action");
    if (typeof (chrome) != "undefined" && typeof (chrome.pageAction) != "undefined")
    {
        chrome.pageAction.onClicked.addListener(function (activeTab)
        {
            checkClickAction();
            logD("Page Action Icon Clicked.");
            translateByMessage(activeTab);
        });
    }
}

// Run our scripts as soon as the document's DOM is ready.
// DOMContentLoaded
addDOMLoadEvent(fnDOMLoadCompleted);

function fnDOMLoadCompleted() 
{
	logD("DOM Loaded Completedly.");
    
	// get the translating text by clipboard firstly.
	//var result = translateByClipboard();
	var result = false;
	if (!result)
	{
		// select text from web page
		chrome.tabs.getSelected(null, translateByMessage);
	}
}

function translateByMessage(activeTab)
{
	// test create new tab with specific URL
	//chrome.tabs.create({ url: "http://www.163.com" });

	// test notification popup
	//showPopupMsg('How are you? - popup');  // notification body text
	
	// send message to CONTENT SCRIPTS
    logD("Translating by message......");
	pup2tab(OperatorType.getSelectText, "");
}

/*------- Send message --------*/
// Extension => Content Script
function pup2tab(type, message) 
{
	chrome.tabs.getSelected(
		null, 
		function(tab) {
			chrome.tabs.sendMessage(
				tab.id, 
				{type: type, message: message}, 
				resp_pup);
		});
}
// response callback
function resp_pup(response)
{
	logD("#RESPONSE#: Received type [" + response.type + "], message [" + response.message + "]");
	
	var type = response.type;
	var message = response.message;

	if (type == OperatorType.getSelectText)
	{
		if (isDefined(response) && isValidText(response.message))
		{
			logD("#RESPONSE#: Translating text: " + response.message);
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
		var message = isDefined(response) ? (isValidText(response.message) ? response.message : "message not defined in response") : ("response not defined");
		logE("#RESPONSE#: Received response type: [" + response.type + "], response message: [" + message + "]");
	}
}
/*END*/


/*------- Receive message --------*/
// Register runtime.onMessage event listener to receive message from Extension
if (typeof(chrome) != "undefined") 
{
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) { rcvmsg_pup(request, sender, sendResponse); } );
}

function rcvmsg_pup(request, sender, sendResponse) 
{
	var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "] " :
                "in extension script");
	logD("rcvmsg_pup: Received Type [" + request.type + "], Message [" + request.message + "] " + msg);
	
	var type = request.type;
	var message = request.message;

	if (!isValidText(message))
	{
		logE("rcvmsg_pup: Message received is null or empty");
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
		var send = (typeof(sendResponse) == "function");
		if (send)
		{
			logW("rcvmsg_pup: NOT defined the response function!");
		}
		else
		{
			// other features
			sendResponse({message: "rcvmsg_pup: [#NOT FEATURED#] Received message: " + type});
		}
	}
}
/*END*/

function ScrapFixedDeposit(interestRatio, depositPerMonth, depositOfYears, isCompoundInterest)
{
    if (typeof (isCompoundInterest) == "undefined") { isCompoundInterest = true; }
    if (interestRatio < 0) { interestRatio = 2.85; }
    if (depositPerMonth < 0) { depositPerMonth = 0; }
    if (depositOfYears < 1) { depositOfYears = 1; }

    var daysOfBank = 360, daysOfYear = 365;
    interestRatio /= 100;
    var bankInterestRatio = interestRatio;
    interestRatio *= daysOfYear / daysOfBank;

    // human assumed interest calculation formula
    var capitals = 0, interests = 0;
    var totalSavings = 0, totalInterests = 0;
    for (var i = 1; i<= depositOfYears; i++)
    {
        totalSavings += (depositPerMonth * 12);
        interests = totalSavings * interestRatio;
        if (isCompoundInterest)
        {
            totalInterests += interests;
        }
        else
        {
            totalInterests += (i * depositPerMonth * 12) * interestRatio;
        }
        totalSavings += interests;
    }
    logD("Human assumed Results");
    logD("Total Deposit: " + (depositPerMonth * 12 * depositOfYears));
    logD("Total Savings: " + totalSavings);
    logD("Total Interests: " + totalInterests);
    // actual bank interest calculation formula
    // 零存整取利息计算公式是：利息=月存金额×累计月积数×月利率。其中累计月积数=（存入次数+1）÷2×存入次数。
    totalInterests = depositPerMonth * (depositOfYears * 12 + 1) / 2 * (depositOfYears * 12)  *bankInterestRatio / 12;
    totalSavings = (depositPerMonth * 12 * depositOfYears) + totalInterests;
    logD("Bank assumed Results");
    logD("Total Deposit: " + (depositPerMonth * 12 * depositOfYears));
    logD("Total Savings: " + totalSavings);
    logD("Total Interests: " + totalInterests);
}