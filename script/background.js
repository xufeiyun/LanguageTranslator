/*
	This javascript file is used in BACKGROUND PAGE named background.html
*/

var prefix = "[BACKGROUND SCRIPTS]: ";

var BgdAPI = {
    
    Initialize: function ()
    {
        // addDOMLoadEvent(CommonAPI.showPopupMsg); // run ok

        // enable translation by default
        //StorageAPI.setItem(OptionItemKeys.EnableTranslation, true);

        // Listen for any changes of any tab by script directly

        // Register runtime.onMessage event listener to receive message from Extension
        if (typeof (chrome) != "undefined")
        {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { CommonAPI.rcvmsg_background(request, sender, sendResponse); });
        }

        // uncomment this one if the extension uses page_action
        if (typeof (chrome) != "undefined" && UsePageAction) { chrome.tabs.onUpdated.addListener(BgdAPI._tab_updated); }

        if (typeof (chrome) != "undefined" && typeof (chrome.browserAction) != "undefined")
        {
            chrome.browserAction.onClicked.addListener(function (activeTab)
            {
                BgdAPI._update_icon(activeTab);
            });
        }
    },

    _update_icon: function (tab)
    {
        var action = StorageAPI.getItem(OptionItemKeys.EnableAction);
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
    },

    _tab_updated: function (tabId, changeInfo, tab)
    {
        if (typeof (chrome) != "undefined" && typeof (chrome.pageAction) != "undefined")
        {
            chrome.pageAction.show(tabId);
        }
    }

};

BgdAPI.Initialize();