/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[CONTENT SCRIPTS]: ";

var isTranslatedByInput = false;

function InitializeEvents()
{
	//var txtInputBox = document.getElementById("kw");
	//if (txtInputBox) { txtInputBox.setAttribute("value", "Eric Xu"); txtInputBox.select(); }
	tab2ext(OperatorType.getCopiedText, "");
}
//InitializeEvents();

// Run our scripts as soon as the document's DOM is ready.
addDOMLoadEvent(fnDOMLoadCompleted);
function fnDOMLoadCompleted() 
{
	LoggerAPI.logD("DOM Loaded Completedly.");
	// add events
	handlePages();
    //setTimeout(handlePages, 1000);
}

var dtStart;
var timeoutId;
var thePopup;
var theEvent;
var MousePosition = {x: null, y: null};

function hidePopupTranslator()
{
    var id = "divLanguageTranslator";
    var text = getSelectedText().toString();
    if (!CommonAPI.isValidText(text))
    {
        $("#" + id).hide();
    }
}

// this includes: [select text by moving mouse] and [select text by dbl-clicking the text]
document.onselectionchange = fnSelectionChanged;
function fnSelectionChanged() 
{
    // need save selected text
    // then translate it when expanding or enabling the popup dialog
    //if (OptionItemValues.EnableTranslation)
    {
        var text = getSelectedText().toString();
        if (!CommonAPI.isValidText(text))
        {
            return false;
        }
        isTranslatedByInput = false;
        clearTimeout(timeoutId);
        dtStart = new Date();
        theEvent = window.event;
        LoggerAPI.logD("Selection Changed in DOM: " + dtStart.getTime());

        //selectTextByTimeout(text);
        timeoutId = setTimeout(selectTextByTimeout, AutoTranslationInterval + 100);
    }
}

$(document).ready(function ()
{
    $(document).mousemove(function (e)
    {
        MousePosition.x = e.pageX;
        MousePosition.y = e.pageY;
    });
    $(document).click(function (e)
    {
        //hidePopupTranslator();
    });
    $(window).scroll(function (e)
    {
        popupPosition();
    });

    // load configs
    tab2ext(OperatorType.loadSettings, "[load settings]");
});

var loadConfigs = function (data)
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
};

var isCopied = false;
function selectTextByTimeout(text)
{
	clearTimeout(timeoutId);
	var interval = CommonAPI.getInterval(dtStart, new Date());
	if (interval > AutoTranslationInterval)
	{
		if (isCopied) return;

        var message = getSelectedText().toString();

        // copy the selected text to clipboard
        if (OptionItemValues.EnableCopyText)
        {
            LoggerAPI.logD("To Copy selected Text: " + message);
            // window.Clipboard.copy(text);
            // send message to background to copy text
            tab2ext(OperatorType.copySelectText, message);
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
		//translateByYoudao(text);
		if (OptionItemValues.EnableTranslation)
		{
		    showPopupDialogForTranslation(message, 'main meanings', 'more meanings');
		    // send message to background to translate text
		    tab2ext(OperatorType.getSelectText, message);

		    setTimeout(focusParentPage, 100);
		}

        // clear all timeout ids
		while (timeoutId > 0)
		{
			clearTimeout(--timeoutId);
		}
		isCopied = false;
	}
}

function focusParentPage()
{
    // focus original element
    if (originalElement != null && typeof(originalElement.focus) != undefined)
    {
        window.top.document.body.click();
        originalElement.focus();
    }
}

var popupPosition = function ()
{
    if (!OptionItemValues.ClosedPopupDialog)
    {
        // replaced by CSS
        // var divContainer = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument).css("top", window.scrollY);
        // divContainer.css("display", "block");
    }
    // focus original element
    // focusParentPage();
}

var pDocument = null;

var getDocument = function (isFrame)
{
    if (!pDocument && isFrame)
    {
        var fs = window.top.frames;
        for (var i = 0; i < fs.length; i++)
        {
            var frameHeight = fs[i].window.frameElement.height;
            if (frameHeight > 400) // ElementIds.PopupIFrame's height
            {
                pDocument = fs[i].window.document;
                break;
            }
        }
    }
    return pDocument;
};

function showPopupDialogForTranslation(sourceText, mainMeaning, moreMeaning)
{
    LoggerAPI.logD("[X]=" + MousePosition.x + " [Y]=" + MousePosition.y + ", Selected Text: " + sourceText);
    
    pDocument = getDocument(window.top.window.document.body.tagName == "FRAMESET");
    
    var divContainer = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument);

    if (divContainer == null || divContainer.length == 0)
    {
        var styles = "left: " + (MousePosition.x - 10) + "px; top: " + (MousePosition.y + 10) + "px;";
        //var html =  AjaxAPI.getFileContentsSync(ProductURIs.WebpagePopup);
        var html = "<div id='btnLanguageTranslatorCollapse' class='collapselink' title='Collapse/Expand Me!' href='javascript:void(0);'></div>"
                 + "<div id='btnLanguageTranslatorDisable' class='disablelink' title='Enable/Disable Popup!' href='javascript:void(0);'></div>"
                 + "<div id='btnLanguageTranslatorClose' class='closelink' title='Close Me! Reload page to Translate!' href='javascript:void(0);'></div>"
                 + "<iframe id='" + ElementIds.PopupIFrame + "' width='326px' height='455px' style='border: 0px; display: none;' src='" + ProductURIs.PopupIFramePage + "'></iframe>";
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
        //divContainer.show();
        //divContainer.popover('show');
        if (!isTranslatedByInput)
        {
            //divContainer.css("left", MousePosition.x);
            //divContainer.css("top", MousePosition.y + 10);
        }
    }
    popupPosition();

    // udpate meanings
    //$("#txtSelected").html(sourceText);
    //$("#txtTranslated").html(mainMeaning);
    //$("#txtTranslatedAll").html(moreMeaning);
    //updateHeight("#txtSelected");
    //updateHeight("#txtTranslated");
    //updateHeight("#txtTranslatedAll");

    attachEvetns();

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
        divContainer.addClass("content_translator_circle");

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
}

function updateIcons()
{
    var img = "url(chrome-extension://" + ExtenionUID + "/image/glyphicons-halflings.png)";
    //LoggerAPI.logD(img);
    DomAPI.getById(ElementIds.PopupButtonCollapse, pDocument).style.backgroundImage = img;
    DomAPI.getById(ElementIds.PopupButtonDisable, pDocument).style.backgroundImage = img;
    DomAPI.getById(ElementIds.PopupButtonClose, pDocument).style.backgroundImage = img;
}

var eventAttached = false;
function attachEvetns()
{
    if (!eventAttached)
    {
        eventAttached = true;

        updateIcons();

        var div = DomAPI.getElement(ElementIds.WebPagePopupDiv, pDocument);
        var collpase = DomAPI.getElement(ElementIds.PopupButtonCollapse, pDocument);
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
            collpase.removeClass("collapselink");
            collpase.removeClass("expandlink");
            collpase.removeClass("expandcollapserectangle");
            collpase.removeClass("expandcollapsecircle");

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
                div.removeClass("content_translator_circle");
                div.css("width", "326px");
                div.css("height", "490px");

                collpase.addClass("collapselink");
                collpase.addClass("expandcollapserectangle");

                disable.addClass("disableenablerectangle");

                close.addClass("closerectangle");
            }
            else
            {
                frame.css("display", "none");
                div.addClass("content_translator_circle");
                div.css("width", "48px");
                div.css("height", "40px");

                collpase.addClass("expandlink");
                collpase.addClass("expandcollapsecircle");

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

        collpase.click(function ()
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

        div.click(function(e){
           LoggerAPI.logD("clicked div");
           e.bubbles = false;
        });        
    }
}

/*------- Send message --------*/
// Content Script => Extension page
function tab2ext(type, message) 
{
	if (!CommonAPI.isDefined(message))
	{
		LoggerAPI.logW("Undefined object: message");
		return;
	}

	LoggerAPI.logD("tab2ext: function INVOKED with message: " + message);

	if (CommonAPI.isValidText(message)) {
		LoggerAPI.logD("tab2ext: message is NOT null or empty");

		// save text to local storage
		StorageAPI.setItem(type, message);

        // send out message
		chrome.runtime.sendMessage(ExtenionUID, {type: type, message: message}, resp_tab);
	} else {
		LoggerAPI.logW("tab2ext: message is null or empty");
	}
}
// response callback
function resp_tab(response)
{
	if (CommonAPI.isDefined(response))
	{
		LoggerAPI.logW("#RESPONSE#: RECEIVED type: 【" + response.type + "】, message:【" + response.message + "】");
	}
    else
    {
        return; 
    }
	var type = response.type;
	if (type == OperatorType.loadSettings)
	{
	    loadConfigs(response.message);
	}
}
/*END*/


/*------- Receive message --------*/
// Register runtime.onMessage event listener to receive message from Extension
if (typeof(chrome) != "undefined")
{
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { rcvmsg_cs(request, sender, sendResponse); });
}

function rcvmsg_cs(request, sender, sendResponse) 
{
	var msg = (sender.tab ?
                "in content script, sent from tab URL:-- [" + sender.tab.url + "]" :
                "in extension script");
	LoggerAPI.logD("rcvmsg_cs: Received type: " + request.type + ", message [" + request.message + "] " + msg);
	
	var send = (typeof(sendResponse) == "function");
	if (!send)
	{
		LoggerAPI.logW("rcvmsg_cs: NOT defined the response function!");
	}
	else
	{
		var type = request.type;
		var message = request.message;

		if (!CommonAPI.isValidText(type))
		{
			LoggerAPI.logW("rcvmsg_cs: Message received is null or empty");
		}
		else if (type == OperatorType.getSelectText)
		{
			var text = getSelectedText().toString();
			if (CommonAPI.isValidText(text))
			{
				LoggerAPI.logD("rcvmsg_cs: replied text [" + text + "] by response function...");
				sendResponse({type: type, message: text});
			}
		}
		// else if (type == OperatorType.viewWikipages)
		// {
		// 	LoggerAPI.logW("rcvmsg_cs: to open wiki page");
			
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
		// 	LoggerAPI.logW("rcvmsg_cs: to open home page");
		// }
		else
		{
			LoggerAPI.logE("rcvmsg_cs: feature NOT IMPLEMENTED type: " + type);
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
    if (!CommonAPI.isValidText(text))
    {
    	// try getting selection from iframes
    	var iframes = window.document.getElementsByTagName("iframe");
    	var count = iframes.length;
    	if (iframes && count > 0)
    	{
    		LoggerAPI.logD("Try to get selection from iframes");
    		for (var i = 0; i < count; i++) {
    			text = getWindowSelection(iframes[i].window);
    			if (CommonAPI.isValidText(text))
    			{
	    			text = getWindowSelection(iframes[i].contentWindow);
	    			if (CommonAPI.isValidText(text))
	    			{
	    				break;
	    			}
    			}
    		};
    	}
    }
    return text.toString();
}

var originalElement = null;
// get selected text from window or document
function getWindowSelection(win)
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
}
/*END*/


/*------- scripts executed after page is loaded --------*/
function handlePages()
{
    MsgBusAPI.msg_send(OperatorType.getBaikeSetting, OperatorType.getBaikeSetting, executeScriptsOnPage)
}
function executeScriptsOnPage(response)
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
            setPage_TencentAPI(isPageControl, value);
        }
        if (type == BaikeType.baidu)
        {
            setPage_BaiduAPI(isPageControl, value);
        }
    }
}
/*END*/



// Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

// send message to notify the background page
// when content script page loaded
// tab2ext(OperatorType.showPageAction, OperatorType.showPageAction);
