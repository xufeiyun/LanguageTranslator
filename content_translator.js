/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[CONTENT SCRIPTS]: ";

// Error: SecurityError: DOM Exception 18
// when invode webkitNotifications.createNotification in common.js
// from content scripts
var showPopupMsg = logD;
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
	logD("DOM Loaded Completedly.");
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
    if (!isValidText(text))
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
        if (!isValidText(text))
        {
            return false;
        }
        isTranslatedByInput = false;
        clearTimeout(timeoutId);
        dtStart = new Date();
        theEvent = window.event;
        logD("Selection Changed in DOM: " + dtStart.getTime());

        selectTextByTimeout(text);
        //timeoutId = setTimeout(selectTextByTimeout, AutoCopyTextInterval + 100);
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
    if (typeof (options.EnableLogger) != "undefined")
    {
        OptionItemValues.EnableLogger = (options.EnableLogger == TrueValue);
    }
};

var isCopied = false;
function selectTextByTimeout(text)
{
	clearTimeout(timeoutId);
	var interval = getInterval(dtStart, new Date());
	//if (interval > AutoCopyTextInterval)
	{
		if (isCopied) return;

        var message = getSelectedText().toString();

        // copy the selected text to clipboard
        if (OptionItemValues.EnableCopyText)
        {
            logD("To Copy selected Text: " + message);
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

var frameLoaded = function (e)
{
    var t = this;
    var type = event.type;
    var e = event.srcElement;
    logW("iframe event type: " + type);
};

var popupPosition = function ()
{
    if (!OptionItemValues.ClosedPopupDialog)
    {
        // replaced by CSS
        // var divContainer = getElement(ElementIds.WebPagePopupDiv, pDocument).css("top", window.scrollY);
        // divContainer.css("display", "block");
    }
    // focus original element
}

var pDocument = null;
function showPopupDialogForTranslation(sourceText, mainMeaning, moreMeaning)
{
    logD("[X]=" + MousePosition.x + " [Y]=" + MousePosition.y);

    var isFrame = window.top.window.document.body.tagName == "FRAMESET";

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
    
    var divContainer = getElement(ElementIds.WebPagePopupDiv, pDocument);

    if (divContainer == null || divContainer.length == 0)
    {
        var styles = "left: " + (MousePosition.x - 10) + "px; top: " + (MousePosition.y + 10) + "px;";
        //var html =  getFileContentsSync(ProductURIs.WebpagePopup);
        var html = "<div id='btnLanguageTranslatorCollapse' class='collapselink' title='Collapse/Expand Me!' href='javascript:void(0);'></div>"
                 + "<div id='btnLanguageTranslatorDisable' class='disablelink' title='Enable/Disable Popup!' href='javascript:void(0);'></div>"
                 + "<div id='btnLanguageTranslatorClose' class='closelink' title='Close Me! Translation by reloading page!' href='javascript:void(0);'></div>"
                 + "<iframe id='" + ElementIds.PopupIFrame + "' width='326px' height='450px' style='border: 0px; display: none;' src='" + ProductURIs.PopupIFramePage + "'></iframe>";
        // iframe: width='326px' height='450px'
        divContainer = createElement("div");
        divContainer.setAttribute("id", ElementIds.WebPagePopupDiv);
        divContainer.setAttribute("class", "content_translator");
        //divContainer.setAttribute("style", styles);
        divContainer.innerHTML = html;
        
        appendChild(divContainer, pDocument);

        getElement(ElementIds.PopupIFrame, pDocument).bind("load", frameLoaded);
        getElement(ElementIds.PopupIFrame, pDocument).bind("loadeddata", frameLoaded);
        getElement(ElementIds.PopupIFrame, pDocument).bind("loadedmetadata", frameLoaded);

        divContainer = getElement(ElementIds.WebPagePopupDiv, pDocument);
    }
    else
    {
        divContainer.html(html);
        showPopup(ElementIds.WebPagePopupDiv, pDocument);
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
    if (OptionItemValues.EnablePopupDialog == true)
    {
        divContainer.removeClass("content_translator_circle");

        // update container width
        divContainer.css("width", getElement(ElementIds.PopupIFrame, pDocument).css("width"));
        divContainer.css("height", "490px");

        var expandLink = getElement(ElementIds.PopupButtonCollapse, pDocument);
        // enabled & expand webpage-based popup dialog
        expandLink.removeClass("expandlink");
        expandLink.removeClass("collapselink");
        expandLink.removeClass("expandcollapsecircle");
        expandLink.removeClass("expandcollapserectangle");
        expandLink.addClass("collapselink");
        expandLink.addClass("expandcollapserectangle");

        var disableLink = getElement(ElementIds.PopupButtonDisable, pDocument);
        disableLink.removeClass("enablelink");
        disableLink.removeClass("disablelink");
        disableLink.removeClass("disableenablecircle");
        disableLink.removeClass("disableenablerectangle");
        disableLink.addClass("disablelink");
        disableLink.addClass("disableenablerectangle");

        var closeLink = getElement(ElementIds.PopupButtonClose, pDocument);
        closeLink.removeClass("closecircle");
        closeLink.removeClass("closerectangle");
        closeLink.addClass("closerectangle");

        var iframe = getElement(ElementIds.PopupIFrame, pDocument);
        iframe.css("display", "block");
    }
    else
    {
        divContainer.addClass("content_translator_circle");

        // update container width
        divContainer.css("width", "48px");
        divContainer.css("height", "40px");

        var expandLink = getElement(ElementIds.PopupButtonCollapse, pDocument);
        // disable & collapse webpage-based popup dialog
        expandLink.removeClass("expandlink");
        expandLink.removeClass("collapselink");
        expandLink.removeClass("expandcollapsecircle");
        expandLink.removeClass("expandcollapserectangle");
        expandLink.addClass("expandlink");
        expandLink.addClass("expandcollapsecircle");

        var disableLink = getElement(ElementIds.PopupButtonDisable, pDocument);
        disableLink.removeClass("enablelink");
        disableLink.removeClass("disablelink");
        disableLink.removeClass("disableenablecircle");
        disableLink.removeClass("disableenablerectangle");
        disableLink.addClass("enablelink");
        disableLink.addClass("disableenablecircle");

        var closeLink = getElement(ElementIds.PopupButtonClose, pDocument);
        closeLink.removeClass("closecircle");
        closeLink.removeClass("closerectangle");
        closeLink.addClass("closecircle");

        var iframe = getElement(ElementIds.PopupIFrame, pDocument);
        iframe.css("display", "none");
    }
}

function updateIcons()
{
    var img = "url(chrome-extension://" + ExtenionUID + "/glyphicons-halflings.png)";
    //console.log(img);
    getById(ElementIds.PopupButtonCollapse, pDocument).style.backgroundImage = img;
    getById(ElementIds.PopupButtonDisable, pDocument).style.backgroundImage = img;
    getById(ElementIds.PopupButtonClose, pDocument).style.backgroundImage = img;
}

var eventAttached = false;
function attachEvetns()
{
    if (!eventAttached)
    {
        eventAttached = true;

        updateIcons();

        var div = getElement(ElementIds.WebPagePopupDiv, pDocument);
        var collpase = getElement(ElementIds.PopupButtonCollapse, pDocument);
        var disable = getElement(ElementIds.PopupButtonDisable, pDocument);
        var close = getElement(ElementIds.PopupButtonClose, pDocument);
        var frame = getElement(ElementIds.PopupIFrame, pDocument);
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
                hidePopup(ElementIds.WebPagePopupDiv, pDocument);
            }
            //hideThisPopup();
            window.setTimeout(hideThisPopup, 100);
        });

        div.click(function(e){
           logD("clicked div");
           e.bubbles = false;
        });        
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
		setItem(type, message);

        // send out message
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
			logW("rcvmsg_cs: Message received is null or empty");
		}
		else if (type == OperatorType.getSelectText)
		{
			var text = getSelectedText().toString();
			if (isValidText(text))
			{
				logD("rcvmsg_cs: replied text [" + text + "] by response function...");
				sendResponse({type: type, message: text});
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
			logE("rcvmsg_cs: feature NOT IMPLEMENTED type: " + type);
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
    		logD("Try to get selection from iframes");
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

var originalElement = null;
// get selected text from window or document
function getWindowSelection(win)
{
    originalElement = win;
    var text = "";
    if (!isDefined(win)) { return text; }    
    
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
            logW("1#element: " + focused.tagName);
            text = focused.value.substring(focused.selectionStart, focused.selectionEnd);
        }
        catch (err)
        {
        }
    }

    if (!isValidText(text) && win.getSelection) 
	{
	    originalElement = win;
		logW("2#window");
        text = "" + win.getSelection().toString();
    }

    if (!isValidText(text) && doc.getSelection) 
	{
	    originalElement = doc;
		logW("3#document");
        text = "" + doc.getSelection().toString();
    }

	if (!isValidText(text) && doc.selection) 
	{
	    originalElement = doc;
		logW("4#range");
        text = "" + doc.selection.createRange().text;
    }

    return text.toString();
}
/*END*/


/*------- scripts executed after page is loaded --------*/
function handlePages()
{
    logD("check for setting wiki pages...");
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
