/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[IFRAME SCRIPTS]: ";

var isIFramePopup = true;

var dtStart;
var timeoutId;

var textSelected = null;

var DialogAPI =
{
    Initialize: function ()
    {
        addDOMLoadEvent(DialogAPI.fnDOMLoadCompleted);

        DialogAPI.checkClickAction();

        if (typeof (chrome) != "undefined")
        {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { MsgBusAPI.rcvmsg_iframe(request, sender, sendResponse); });
        }

        TranslatorAPI.clearTexts();

        SearchWeb.Initialize();

        i18n.SetLocalization();

        DialogAPI.bindTextEvent();

        DialogAPI.bindTopLinkEvent();

        DialogAPI.bindPronounceEvent();

        DialogAPI.bindBottomLinkEvent();

        TranslatorAPI.tryTranslateNow();    // serve for the extension dialog
    },

    fnDOMLoadCompleted: function ()
    {
        LoggerAPI.logD("DOM loaded completely - popup dialog.");
    },

    bindTextEvent: function ()
    {
        // add text events
        textSelected = $("#" + ElementIds.TextSelected);
        textSelected.focus(function (e)
        {
            TranslatorAPI.clearTexts();
        });
        textSelected.change(function (e)
        {
            TranslatorAPI.clearTexts();
        });
        textSelected.keyup(function (e)
        {
            clearTimeout(timeoutId);
            TranslatorAPI.clearTexts();
            timeoutId = setTimeout(TranslatorAPI.translateByTimeout, AutoTranslationInterval + 100);
        });
        textSelected.keydown(function (e)
        {
            dtStart = new Date();
            if (e.keyCode == 13 && e.shiftKey)
            {
            }
            else if (e.keyCode == 13 && e.ctrlKey)
            {
                TranslatorAPI.translateByInput();
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
    },

    bindTopLinkEvent: function ()
    {
        // add top link events
        $("#divNavTitle").click(function ()
        {
            WikiAPI.openPage(ProductURIs.Product);
        });
        $("#btnSourceText").click(function ()
        {
            WikiAPI.openWikipage($("#" + ElementIds.TextSelected).val());
        });
        // this button has been hidden
        $("#btnTranslate").click(function ()
        {
            clearTimeout(timeoutId);
            TranslatorAPI.translateByInput();
            textSelected.focus();
        });
    },

    bindPronounceEvent: function ()
    {
        // add button events for pronunciation
        $("#" + PronounceAudios.Source.ButtonId).click(function ()
        {
            DialogAPI.pronunceText(PronounceAudios.Source.PlayerId);
        });
        $("#" + PronounceAudios.Main.ButtonId).click(function ()
        {
            DialogAPI.pronunceText(PronounceAudios.Main.PlayerId);
        });
        $("#" + PronounceAudios.More.ButtonId).click(function ()
        {
            DialogAPI.pronunceText(PronounceAudios.More.PlayerId);
        });
    },

    bindBottomLinkEvent: function ()
    {
        // bottom buttons' events in popup dialog
        $("#btnTranslatorAPI").click(function ()
        {
            var page = this.getAttribute('href');
            WikiAPI.openPage(page);
        });
        $("#btnOperations").click(function ()
        {
            WikiAPI.openPage("options.html?tab=operations");
        });
        $("#btnOptions").click(function ()
        {
            WikiAPI.openPage("options.html");
        });
        $("#btnFeatures").click(function ()
        {
            WikiAPI.openPage("options.html?tab=features");
        });
        $("#btnDonations").click(function ()
        {
            WikiAPI.openPage("options.html?tab=feedbacks");
        });
        $("#btnAbout").click(function ()
        {
            WikiAPI.openPage("options.html?tab=about");
        });
    },

    pronunceText: function (playerId)
    {
        var player = $("#" + playerId);
        if (CommonAPI.isDefined(player))
        {
            player[0].controls = true;
            player[0].muted = false;
            player[0].volume = 1;
            player[0].play();
        }
    },

    checkClickAction: function ()
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
        // chrome.browserAction.onClicked.addListener(function(activeTab) {alert(activeTab.title);});
        if (UsePageAction == false)
        {
            LoggerAPI.logD("use browser action");
            if (typeof (chrome) != "undefined" && typeof (chrome.browserAction) != "undefined")
            {
                chrome.browserAction.onClicked.addListener(function (activeTab)
                {
                    logClickAction();
                    LoggerAPI.logD("Browser Action Icon Clicked.");
                    TranslatorAPI.translateByMessage(activeTab);
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
                    TranslatorAPI.translateByMessage(activeTab);
                });
            }
        }
    }
};

$(document).ready(function ()
{
    DialogAPI.Initialize();
});
