/*
	This javascript file is used in BACKGROUND PAGE named background.html
*/

var prefix = "[BACKGROUND SCRIPTS]: ";

var BgdAPI = {

    Initialize: function () {
        // addDOMLoadEvent(CommonAPI.showPopupMsg); // run ok

        // enable translation by default
        //StorageAPI.setItem(OptionItemKeys.EnableTranslation, true);

        // Listen for any changes of any tab by script directly

        // Register receiver
        ListenerAPI.onMessageListener(MsgBusAPI.rcvmsg_background);

        ListenerAPI.onTabUpdateListener(BgdAPI._tab_updated);

        ListenerAPI.onIconClickListener(BgdAPI._update_icon);
    },

    _update_icon: function (tab) {
        var action = StorageAPI.getItem(OptionItemKeys.EnableAction);
        if (typeof (action) != "undefined" && action == TrueValue) {
            chrome.browserAction.setIcon({
                path: "image/language_19.png"
            });
        }
        else {
            chrome.browserAction.setIcon({
                path: "image/language_on.png"
            });
        }
    },

    _tab_updated: function (tabId, changeInfo, tab) {
        if (typeof (chrome) != "undefined" && typeof (chrome.pageAction) != "undefined") {
            chrome.pageAction.show(tabId);
        }
    }

};

BgdAPI.Initialize();