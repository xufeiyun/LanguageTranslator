/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[CONTENT SCRIPTS]: ";

var dtStart;
var timeoutId;
var thePopup;
var theEvent;
var MousePosition = {x: null, y: null};
var isCopied = false;
var pDocument = null;
var originalElement = null;


var ContentAPI =
{
    eventAttached: false,

    Initialize: function ()
    {
        // Run our scripts as soon as the document's DOM is ready.
        addDOMLoadEvent(ContentAPI.fnDOMLoadCompleted);

        // this includes: [select text by moving mouse] and [select text by dbl-clicking the text]
        document.onselectionchange = ContentAPI.fnSelectionChanged;

        $(document).mousemove(function (e)
        {
            MousePosition.x = e.pageX;
            MousePosition.y = e.pageY;
        });
        $(document).click(function (e)
        {
            // ContentAPI.hidePopupTranslator();
        });
        $(window).scroll(function (e)
        {
            ContentAPI.popupPosition();
        });

        if (typeof (chrome) != "undefined")
        {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { MsgBusAPI.rcvmsg_content(request, sender, sendResponse); });
        }

        // load configs
        MsgBusAPI.msg_send(OperatorType.loadSettings, "[load settings]");
    },    

    ShowPopupDialogForTranslation: function (sourceText, mainMeaning, moreMeaning)
    {
        LoggerAPI.logD("[X]=" + MousePosition.x + " [Y]=" + MousePosition.y + ", Selected Text: " + sourceText);

        var isPopupFrame = window.top.window.document.body.tagName == "FRAMESET";
        pDocument = ContentAPI.getDocument(isPopupFrame);

        var divContainer = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument);

        if (divContainer == null || divContainer.length == 0)
        {
            var styles = "left: " + (MousePosition.x - 10) + "px; top: " + (MousePosition.y + 10) + "px;";
            //var html =  AjaxAPI.getFileContentsSync(ProductURIs.WebpagePopup);
            var html = "<div id='btnLanguageTranslatorCollapse' class='collapselink' title='Collapse/Expand Me!' href='javascript:void(0);'></div>"
                 + "<div id='btnLanguageTranslatorDisable' class='disablelink' title='Enable/Disable Popup!' href='javascript:void(0);'></div>"
                 + "<div id='btnLanguageTranslatorClose' class='closelink' title='Close Me! Reload page to Translate!' href='javascript:void(0);'></div>"
                 + "<iframe id='" + ElementIds.PopupIFrame + "' width='326px' height='455px' style='border: 1px #BDBDBD solid; margin: -1px -1px -1px -1px; padding: 0px 0px 0px 1px; display: none;' src='" + ProductURIs.PopupIFramePage + "'></iframe>";
            // iframe: width='326px' height='450px'
            divContainer = DomAPI.createElement("div");
            divContainer.setAttribute("id", ElementIds.WebPagePopupDiv);
            divContainer.setAttribute("class", "content_popup");
            //divContainer.setAttribute("style", styles);
            divContainer.innerHTML = html;

            DomAPI.appendChild(divContainer, pDocument);

            var frameLoaded = function (e)
            {
                var t = this;
                var type = event.type;
                var e = event.srcElement;
                LoggerAPI.logW("iframe event type: " + type);
            };

            DomAPI.getElement(ElementIds.PopupIFrame, pDocument).bind("load", frameLoaded);
            DomAPI.getElement(ElementIds.PopupIFrame, pDocument).bind("loadeddata", frameLoaded);
            DomAPI.getElement(ElementIds.PopupIFrame, pDocument).bind("loadedmetadata", frameLoaded);

            divContainer = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument);
        }
        else
        {
            divContainer.html(html);
            PopupAPI.showPopup(ElementIds.WebPagePopupDiv, pDocument);
            // show or move divContainer?
        }
        ContentAPI.popupPosition();

        // udpate meanings
        //$("#txtSelected").html(sourceText);
        //$("#txtTranslated").html(mainMeaning);
        //$("#txtTranslatedAll").html(moreMeaning);
        //updateHeight("#txtSelected");
        //updateHeight("#txtTranslated");
        //updateHeight("#txtTranslatedAll");

        ContentAPI._attach_events();

        // collapse the popup dialog if disabling popup
        var expandLink = DomAPI.getElement(ElementIds.PopupButtonCollapse, pDocument);
        var disableLink = DomAPI.getElement(ElementIds.PopupButtonDisable, pDocument);
        var closeLink = DomAPI.getElement(ElementIds.PopupButtonClose, pDocument);

        i18n.SetTitle(ElementIds.PopupButtonCollapse, "ExpandPopupTitle");
        i18n.SetTitle(ElementIds.PopupButtonDisable, "EnablePopupTitle");
        i18n.SetTitle(ElementIds.PopupButtonClose, "ClosePopupTitle");

        if (OptionItemValues.EnablePopupDialog == true)
        {
            divContainer.removeClass("content_popup_circle");

            // update container width
            divContainer.css("width", DomAPI.getElement(ElementIds.PopupIFrame, pDocument).css("width"));
            divContainer.css("height", "450px");

            // enabled & expand webpage-based popup dialog
            expandLink.removeClass("expandlink");
            expandLink.removeClass("collapselink");
            expandLink.removeClass("expandcollapsecircle");
            expandLink.removeClass("expandcollapserectangle");
            expandLink.addClass("collapselink");
            expandLink.addClass("expandcollapserectangle");

            disableLink.removeClass("enablelink");
            disableLink.removeClass("disablelink");
            disableLink.removeClass("disableenablecircle");
            disableLink.removeClass("disableenablerectangle");
            disableLink.addClass("disablelink");
            disableLink.addClass("disableenablerectangle");

            closeLink.removeClass("closecircle");
            closeLink.removeClass("closerectangle");
            closeLink.addClass("closerectangle");

            var iframe = DomAPI.getElement(ElementIds.PopupIFrame, pDocument);
            iframe.css("display", "block");
        }
        else
        {
            divContainer.addClass("content_popup_circle");

            // update container width
            divContainer.css("width", "48px");
            divContainer.css("height", "40px");

            // disable & collapse webpage-based popup dialog
            expandLink.removeClass("expandlink");
            expandLink.removeClass("collapselink");
            expandLink.removeClass("expandcollapsecircle");
            expandLink.removeClass("expandcollapserectangle");
            expandLink.addClass("expandlink");
            expandLink.addClass("expandcollapsecircle");

            disableLink.removeClass("enablelink");
            disableLink.removeClass("disablelink");
            disableLink.removeClass("disableenablecircle");
            disableLink.removeClass("disableenablerectangle");
            disableLink.addClass("enablelink");
            disableLink.addClass("disableenablecircle");

            closeLink.removeClass("closecircle");
            closeLink.removeClass("closerectangle");
            closeLink.addClass("closecircle");

            var iframe = DomAPI.getElement(ElementIds.PopupIFrame, pDocument);
            iframe.css("display", "none");
        }
    },

    fnDOMLoadCompleted: function ()
    {
        LoggerAPI.logD("DOM Loaded completely - content.");
        // add events
        ContentAPI.handlePages();
        //setTimeout(ContentAPI.handlePages, 1000);
    },

    fnSelectionChanged: function ()
    {
        TranslatorAPI.IsTypedText = false;
        // need save selected text
        // then translate it when expanding or enabling the popup dialog
        //if (OptionItemValues.EnableTranslation)
        {
            var text = ContentAPI.getSelectedText().toString();
            if (!CommonAPI.isValidText(text)) { return false; }
            clearTimeout(timeoutId);
            dtStart = new Date();
            theEvent = window.event;
            LoggerAPI.logD("Selection Changed in DOM: " + dtStart.getTime());

            timeoutId = setTimeout(ContentAPI.selectTextByTimeout, AutoTranslationInterval + 100);
        }
    },

    hidePopupTranslator: function ()
    {
        var id = "divLanguageTranslator";
        var text = ContentAPI.getSelectedText().toString();
        if (!CommonAPI.isValidText(text))
        {
            $("#" + id).hide();
        }
    },

    loadConfigs: function (data)
    {
        LoggerAPI.logD("setting OptionItemValues from loaded configs......");
        var options = data;
        if (typeof (options.EnablePopupDialog) != "undefined")
        {
            OptionItemValues.EnablePopupDialog = (options.EnablePopupDialog == TrueValue);
        }
        if (typeof (options.EnableTranslation) != "undefined")
        {
            OptionItemValues.EnableTranslation = (options.EnableTranslation == TrueValue);
        }
        if (typeof (options.EnableCopyText) != "undefined")
        {
            OptionItemValues.EnableCopyText = (options.EnableCopyText == TrueValue);
        }
        if (!IsDebugger && typeof (options.EnableLogger) != "undefined")
        {
            OptionItemValues.EnableLogger = (options.EnableLogger == TrueValue);
        }

        if (OptionItemValues.EnablePopupDialog && !OptionItemValues.EnableTranslation)
        {
            LoggerAPI.logW("[Enable Popup Dialog] feature was enabled manually but without enabling the [Enable Text Translation] feature!");
            LoggerAPI.logD("To enable the [Enable Text Translation] feature......");
            OptionItemValues.EnableTranslation = OptionItemValues.EnablePopupDialog;
        }
    },

    selectTextByTimeout: function (text)
    {
        clearTimeout(timeoutId);
        var interval = CommonAPI.getInterval(dtStart, new Date());
        if (interval > AutoTranslationInterval)
        {
            if (isCopied) return;

            var message = ContentAPI.getSelectedText().toString();

            // copy the selected text to clipboard
            if (OptionItemValues.EnableCopyText)
            {
                LoggerAPI.logD("To Copy selected Text: " + message);
                // window.Clipboard.copy(text);
                // send message to background to copy text
                MsgBusAPI.msg_send(OperatorType.copySelectText, message);
            }

            if (OptionItemValues.EnableTranslation)
            {
                //OptionItemValues.EnablePopupDialog = true;
            }

            // enable the webpage-based popup dialog
            if (OptionItemValues.EnablePopupDialog)
            {
            }

            // start translate and create web page popup element
            // no need to translate here => translated in iframe popup page
            // translateByYoudao(text);
            if (OptionItemValues.EnableTranslation)
            {
                ContentAPI.ShowPopupDialogForTranslation(message, 'main meanings', 'more meanings');
                // send message to background to translate text
                MsgBusAPI.msg_send(OperatorType.getSelectText, message);
                setTimeout(ContentAPI.focusParentPage, 100);
            }

            // clear all timeout ids
            while (timeoutId > 0)
            {
                clearTimeout(--timeoutId);
            }
            isCopied = false;
        }
    },

    focusParentPage: function ()
    {
        // focus original element
        if (originalElement != null && typeof (originalElement.focus) != undefined)
        {
            window.top.document.body.click();
            originalElement.focus();
        }
    },

    popupPosition: function ()
    {
        if (!OptionItemValues.ClosedPopupDialog)
        {
            // replaced by CSS
            // var divContainer = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument).css("top", window.scrollY);
            // divContainer.css("display", "block");
        }
        // focus original element
        // focusParentPage();
    },

    getDocument: function (isFrame)
    {
        if (!pDocument && isFrame)
        {
            var fs = window.top.frames;
            for (var i = 0; i < fs.length; i++)
            {
                var frameHeight = fs[i].window.frameElement.height;
                var width = fs[i].window.frameElement.width;
                if (frameHeight > 400 && width > 300) // ElementIds.PopupIFrame's height & width
                {
                    pDocument = fs[i].window.document;
                    break;
                }
            }
        }
        return pDocument;
    },


    /*------- Get selection --------*/
    // get selected text from web page user opened
    getSelectedText: function ()
    {
        var text = ContentAPI.getWindowSelection(window);
        if (!CommonAPI.isValidText(text))
        {
            // try getting selection from iframes
            var iframes = window.document.getElementsByTagName("iframe");
            var count = iframes.length;
            if (iframes && count > 0)
            {
                LoggerAPI.logD("Try to get selection from iframes");
                for (var i = 0; i < count; i++)
                {
                    text = ContentAPI.getWindowSelection(iframes[i].window);
                    if (CommonAPI.isValidText(text))
                    {
                        text = ContentAPI.getWindowSelection(iframes[i].contentWindow);
                        if (CommonAPI.isValidText(text))
                        {
                            break;
                        }
                    }
                };
            }
        }
        return text.toString();
    },

    // get selected text from window or document
    getWindowSelection: function (win)
    {
        originalElement = win;
        var text = "";
        if (!CommonAPI.isDefined(win)) { return text; }

        var doc = win.document;
        var focused = doc.activeElement;
        if (focused)
        {
            originalElement = focused;
            try
            {
                if (focused.tagName == 'SELECT')
                {
                    return text;
                }
                LoggerAPI.logW("1#element: " + focused.tagName);
                text = focused.value.substring(focused.selectionStart, focused.selectionEnd);
            }
            catch (err)
            {
            }
        }

        if (!CommonAPI.isValidText(text) && win.getSelection)
        {
            originalElement = win;
            LoggerAPI.logW("2#window");
            text = "" + win.getSelection().toString();
        }

        if (!CommonAPI.isValidText(text) && doc.getSelection)
        {
            originalElement = doc;
            LoggerAPI.logW("3#document");
            text = "" + doc.getSelection().toString();
        }

        if (!CommonAPI.isValidText(text) && doc.selection)
        {
            originalElement = doc;
            LoggerAPI.logW("4#range");
            text = "" + doc.selection.createRange().text;
        }

        return text.toString();
    },


    /*------- scripts executed after page is loaded --------*/
    handlePages: function ()
    {
        MsgBusAPI.msg_send(OperatorType.getBaikeSetting, OperatorType.getBaikeSetting, ContentAPI.executeScriptsOnPage)
    },

    executeScriptsOnPage: function (response)
    {
        LoggerAPI.logW("What's the type of encyclopedia?");
        LoggerAPI.logD(response);

        // get data
        var data = response.object;
        if (data == undefined || data.control == undefined || data.control == null) { return; }

        var control = data.control;
        var type = data.type;
        var value = data.value;

        var isPageControl = CommonAPI.isValidText(control);
        var isTyped = CommonAPI.isDefined(type);

        // tencent soso baike
        if (isTyped)
        {
            if (type == BaikeType.tencent)
            {
                WikiAPI.setPage_TencentAPI(isPageControl, value);
            }
            if (type == BaikeType.baidu)
            {
                WikiAPI.setPage_BaiduAPI(isPageControl, value);
            }
        }
    },

    _update_icons: function ()
    {
        var img = "url(chrome-extension://" + ExtenionUID + "/image/glyphicons-halflings.png)";
        //LoggerAPI.logD(img);
        DomAPI.getById(ElementIds.PopupButtonCollapse, pDocument).style.backgroundImage = img;
        DomAPI.getById(ElementIds.PopupButtonDisable, pDocument).style.backgroundImage = img;
        DomAPI.getById(ElementIds.PopupButtonClose, pDocument).style.backgroundImage = img;
    },

    _attach_events: function ()
    {
        if (!ContentAPI.eventAttached)
        {
            ContentAPI.eventAttached = true;

            ContentAPI._update_icons();

            var div = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument);
            var collapse = DomAPI.getElement(ElementIds.PopupButtonCollapse, pDocument);
            var disable = DomAPI.getElement(ElementIds.PopupButtonDisable, pDocument);
            var close = DomAPI.getElement(ElementIds.PopupButtonClose, pDocument);
            var frame = DomAPI.getElement(ElementIds.PopupIFrame, pDocument);
            var display = frame.css("display");
            var shouldDisplay = function ()
            {
                display = frame.css("display");
                return (display == "none");
            };

            var collapseIFrame = function ()
            {
                collapse.removeClass("collapselink");
                collapse.removeClass("expandlink");
                collapse.removeClass("expandcollapserectangle");
                collapse.removeClass("expandcollapsecircle");

                disable.removeClass("enablelink");
                disable.removeClass("disablelink");
                disable.removeClass("disableenablecircle");
                disable.removeClass("disableenablerectangle");

                close.removeClass("closerectangle");
                close.removeClass("closecircle");

                var display = shouldDisplay();

                if (display == true)
                {
                    frame.css("display", "block");
                    div.removeClass("content_popup_circle");
                    div.css("width", "326px");
                    div.css("height", "490px");

                    collapse.addClass("collapselink");
                    collapse.addClass("expandcollapserectangle");

                    disable.addClass("disableenablerectangle");

                    close.addClass("closerectangle");
                }
                else
                {
                    frame.css("display", "none");
                    div.addClass("content_popup_circle");
                    div.css("width", "48px");
                    div.css("height", "40px");

                    collapse.addClass("expandlink");
                    collapse.addClass("expandcollapsecircle");

                    disable.addClass("disableenablecircle");

                    close.addClass("closecircle");
                }

                if (OptionItemValues.EnableTranslation)
                {
                    disable.addClass("disablelink");
                }
                else
                {
                    disable.addClass("enablelink");
                }
            };

            collapse.click(function ()
            {
                OptionItemValues.EnablePopupDialog = shouldDisplay();
                if (shouldDisplay())
                {
                    OptionItemValues.EnableTranslation = OptionItemValues.EnablePopupDialog;  // if open dialog, then enable translation   
                }
                //collapseIFrame();
                window.setTimeout(collapseIFrame, 100);
            });

            disable.click(function ()
            {
                //OptionItemValues.EnableTranslation = !OptionItemValues.EnableTranslation;
                //OptionItemValues.EnablePopupDialog = OptionItemValues.EnableTranslation;
                OptionItemValues.EnablePopupDialog = !OptionItemValues.EnablePopupDialog;

                var disableThisPopup = function ()
                {
                    collapseIFrame();
                }
                //collapseIFrame();
                window.setTimeout(disableThisPopup, 100);
            });

            close.click(function ()
            {
                // don't translate text any more unless reloading the webpage
                OptionItemValues.EnablePopupDialog = false;
                OptionItemValues.EnableTranslation = false;
                OptionItemValues.ClosedPopupDialog = true;

                var hideThisPopup = function ()
                {
                    PopupAPI.hidePopup(ElementIds.WebPagePopupDiv, pDocument);
                }
                //hideThisPopup();
                window.setTimeout(hideThisPopup, 100);
            });

            div.click(function (e)
            {
                LoggerAPI.logD("clicked div");
                e.bubbles = false;
            });
        }
    }

};


// Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

// send message to notify the background page
// when content script page loaded
// tab2ext(OperatorType.showPageAction, OperatorType.showPageAction);


$(document).ready(function ()
{
    ContentAPI.Initialize();
});
