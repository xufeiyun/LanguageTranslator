/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[CONTENT SCRIPTS]: ";

// Error: SecurityError: DOM Exception 18
// when invode webkitNotifications.createNotification in common.js
// from content scripts
showPopupMsg = logD;

function InitializeEvents()
{
	//var txtInputBox = document.getElementById("kw");
	//if (txtInputBox) { txtInputBox.setAttribute("value", "Eric Xu"); txtInputBox.select(); }
	tab2ext(OperatorType.selectText, getSelectedText().toString());
}

//InitializeEvents();

// Run our scripts as soon as the document's DOM is ready.
addDOMLoadEvent(fnDOMLoadCompleted);

function fnDOMLoadCompleted() 
{
	logD("DOM Loaded Completedly.");
	// add events
	handlePages();
    //setTimeout(handlePages, 1000);
}

var dtStart;
var timeoutId;

function fnSelectionChanged() 
{
	var text = getSelectedText().toString();
	if (!isValidText(text))
	{
		return false;
	}
	clearTimeout(timeoutId);
	dtStart = new Date();
	logD("Selection Changed in DOM: " + dtStart.getTime());
	timeoutId = setTimeout(copySelectedTextByTimeout, AutoCopyTextInterval + 100);
	logD("Timeout ID: " + timeoutId);
}
document.onselectionchange = fnSelectionChanged;

var isCopied = false;
function copySelectedTextByTimeout()
{
	clearTimeout(timeoutId);
	var interval = getInterval(dtStart, new Date());
	if (interval > AutoCopyTextInterval)
	{
		if (isCopied) return;
		var text = getSelectedText().toString();
		logW("To Copy selected Text: " + text);
		// window.Clipboard.copy(text);
		// send message to background to copy text
		tab2ext(OperatorType.copySelectText, text);
		while (timeoutId > 0)
		{
			clearTimeout(--timeoutId);
		}
		isCopied = false;
	}
}


/*------- Send message --------*/
// Content Script => Extension page
function tab2ext(type, message) 
{
	if (!isDefined(message))
	{
		logW("Undefined object: message");
		return;
	}
	logD("tab2ext: function INVOKED with message: " + message);
	if (isValidText(message)) {
		logD("tab2ext: message is NOT null or empty");
		// save text to local storage
		setItem(OperatorType.selectText, message);
		setItem(OperatorType.copySelectText, message);		
		chrome.runtime.sendMessage(ExtenionUID, {type: type, message: message}, resp_tab);
	} else {
		logW("tab2ext: message is null or empty");
	}
}
// response callback
function resp_tab(response)
{
	if (isDefined(response))
	{
		logW("#RESPONSE#: RECEIVED type: 【" + response.type + "】, message:【" + response.message + "】");
	}
}
/*END*/


/*------- Receive message --------*/
// Register runtime.onMessage event listener to receive message from Extension
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) { rcvmsg_cs(request, sender, sendResponse); } );

function rcvmsg_cs(request, sender, sendResponse) 
{
	var msg = (sender.tab ?
                "in content script, sent from tab URL:-- [" + sender.tab.url + "]" :
                "in extension script");
	logD("rcvmsg_cs: Received type: " + request.type + ", message [" + request.message + "] " + msg);
	
	var send = (typeof(sendResponse) == "function");
	if (!send)
	{
		logW("rcvmsg_cs: NOT defined the response function!");
	}
	else
	{
		var type = request.type;
		var message = request.message;

		if (!isValidText(type))
		{
			logE("rcvmsg_cs: Message received is null or empty");
		}
		else if (type == OperatorType.selectText)
		{
			var text = getSelectedText().toString();
			if (isValidText(text))
			{
				logD("rcvmsg_cs: replied text [" + text + "] by response function...");
				sendResponse({type: OperatorType.selectText, message: text});
			}
		}
		// else if (type == OperatorType.viewWikipages)
		// {
		// 	logW("rcvmsg_cs: to open wiki page");
			
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
		// 	logW("rcvmsg_cs: to open home page");
		// }
		else
		{
			logE("rcvmsg_cs: feature NOT IMPLEMENTED type");
			// other features
			sendResponse({type: type, message: "rcvmsg_cs: [#NOT FEATURED#]"});
		}
	}
}
/*END*/


/*------- Get selection --------*/
// get selected text from web page user opened
function getSelectedText()
{
    var text = getWindowSelection(window);
    if (!isValidText(text))
    {
    	// try getting selection from iframes
    	var iframes = window.document.getElementsByTagName("iframe");
    	var count = iframes.length;
    	if (iframes && count > 0)
    	{
    		logW("Try to get selection from iframes");
    		for (var i = 0; i < count; i++) {
    			text = getWindowSelection(iframes[i].window);
    			if (isValidText(text))
    			{
	    			text = getWindowSelection(iframes[i].contentWindow);
	    			if (isValidText(text))
	    			{
	    				break;
	    			}
    			}
    		};
    	}
    }
    return text.toString();
}
// get selected text from window or document
function getWindowSelection(win)
{
    var text = "";
    if (!isDefined(win)) { return text; }

    if (win.getSelection) 
	{
		logW("window");
        text = "" + win.getSelection().toString();
    }

    var doc = win.document;
    if (!isValidText(text) && doc.getSelection) 
	{
		logW("document");
        text = "" + doc.getSelection().toString();
    }

	if (!isValidText(text) && doc.selection) 
	{
		logW("range");
        text = "" + doc.selection.createRange().text;
    }
    return text.toString();
}
/*END*/


/*------- scripts executed after page is loaded --------*/
function handlePages()
{
    showPopupMsg("handlePages:");
	// following data are set by chrome.tabs.executeScript() in wikipages.js
	var source = getItem(OperatorType.setBaikeType);
    var type = getItem(OperatorType.setPageControl);
    var value = getItem(OperatorType.copySelectText);
    var isTyped = isValidText(type);
    showPopupMsg(isDefined(source) ? source : "source undefined");
	
	// tencent soso baike
	if (isDefined(source) && source == BaikeType.tencent)
	{
		setPage_TencentAPI(isTyped, value);
	}
	if (isDefined(source) && source == BaikeType.baidu)
	{
		setPage_BaiduAPI(isTyped, value);
	}

    // clear data
    removeItem(OperatorType.setBaikeType);
    removeItem(OperatorType.copySelectText);
    removeItem(OperatorType.setPageControl);
}
/*END*/



// Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

// send message to notify the background page
// when content script page loaded
// tab2ext(OperatorType.showPageAction, OperatorType.showPageAction);
