/*
	This javascript file is used in BACKGROUND PAGE named background.html
*/

var prefix = "[BACKGROUND SCRIPTS]: ";

/*------- Send message --------*/
// Backgound => Content Script
function bgd2tab(message) 
{
	chrome.tabs.getSelected(
		null, 
		function(tab) {
			chrome.tabs.sendMessage(
				tab.id, 
				{message: message}, 
				resp_bgd);
		});
}
// response callback
function resp_bgd(response)
{
	logD("#RESPONSE#: type=>" + response.type + ", message=>" + response.message);
}
/*END*/

/*------- Receive message --------*/
// Register runtime.onMessage event listener to receive message from Extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { rcvmsg_bgd(request, sender, sendResponse); } );

function rcvmsg_bgd(request, sender, sendResponse) 
{
	var msg = (sender.tab ?
                "in content script, sent from tab URL: [" + sender.tab.url + "]" :
                "in extension script");
	logD("rcvmsg_bgd: Received TYPE: " + request.type + ", MESSAGE [" + request.message + "] " + msg);
	
	var type = request.type;
	var message = request.message;
	var send = (typeof(sendResponse) == "function");

	if (!isValidText(type))
	{
		logE("rcvmsg_bgd: Message received is null or empty");
	}
	else if (type == OperatorType.copySelectText)
	{
		if (isValidText(message))
		{
			setItem(OperatorType.selectText, message);
			setItem(OperatorType.copySelectText, message);		
			var result = window.Clipboard.copy(message);
			if (result) { logD("rcvmsg_bgd: Copied text OK."); }
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
			logD("rcvmsg_bgd: Try to open wikipage");
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
			sendResponse({type: type, message: "rcvmsg_bgd: #BACKGROUND SEND RESPONSE# Received Message:" + message});
		}
		else
		{
			logW(prefix, "rcvmsg_bgd: NOT defined the response function!");
		}
	}

}
/*END*/

// addDOMLoadEvent(showPopupMsg); // run ok


// Listen for any changes of any tab by script directly
var tabUpdated = function(tabId, changeInfo, tab){
	chrome.pageAction.show(tabId);
};
// chrome.tabs.onUpdated.addListener(tabUpdated);
