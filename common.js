
/*-------  --------*/

/**
	This javascript file is the common file including common features
*/

var ExtenionUID = "hfcnemnjojifmhdgdbhnhiinmjdohlel";
var NewLine = "\r\n";
var AutoCopyTextInterval = 1000;
var AutoTranslateInterval = 812;
var OneLineCharCount = 45;

var OperatorType = 
{
    selectText: "OperatorTypeKey_SelectText",
    viewWikipages: "OperatorTypeKey_ViewWikipages",
    viewHomepage: "OperatorTypeKey_ViewHomepage",
    copySelectText: "OperatorTypeKey_CopySelectText",
    setPageControl: "OperatorTypeKey_SetPageControl",
    setBaikeType: "OperatorTypeKey_SetBaikeType",
    showPageAction: "OperatorTypeKey_ShowPageAction"
};

var BaikeType = 
{
    baidu: "baidu",
    tencent: "soso",
    wikicn: "wikicn",
    wikien: "wikien"
};

var PronounceAudios =
{
    Source: {ContainerId: 'divReadSource', PlayerId: 'audioReadSource', ButtonId: 'btnReadSource'},
    Main: {ContainerId: 'divReadMain', PlayerId: 'audioReadMain', ButtonId: 'btnReadMain'},
    More: {ContainerId: 'divReadMore', PlayerId: 'audioReadMore', ButtonId: 'btnReadMore'}
};

function showPopupMsg(message)
{
    try
    {
        // notification popup
        var notify = webkitNotifications.createNotification(
                    'notify_logo.png',      // icon url - can be relative
                    prefix,                 // notification title
                    message                 // notification body text
                );
        notify.show();
    }
    catch (e)
    {     
        logE("try to popup msg: [" + message + "]. " + e.toLocaleString());
    }
}

/*-------Import js file dynamically--------*/
function importJS(path) 
{
	console.debug("[Try importing javascript file into viewed page dynamically] file path: " + path);
	var i;
	var ss = document.getElementsByTagName("script");
	for (i = 0; i < ss.length; i++) {
		if (ss[i].src && ss[i].src.indexOf(path) != -1) {
			return;
		}
	}
	// add script dynamically
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = path;
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(s);
}
/*END*/
/*
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>

http://code.jquery.com/
<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
<script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
*/

/*------- COMMON FUNCTIONS --------*/
function getInterval(start, end)
{
    var interval = (end.getTime() - start.getTime());
    return interval;
}

function encodeText(text)
{
    return encodeURIComponent(text);
}
function isDefined(variable) 
{
    return (typeof(variable) != "undefined");
}
function isValidText(text)
{
	return  isDefined(text) && !(text == null || text.trim() == "")
}
function isFunction(fnName)
{
    return (typeof(fnName) == "function");
}

function AlertMsg(message)
{
	alert(message);
}

// prefix is defined in each js file
function logD(message)
{
	console.debug(prefix + message);
}

function logW(message)
{
	console.warn(prefix + message);
}

function logE(message)
{
	console.error(prefix + message);
}

function getById(id)
{
	return document.getElementById(id);
}

function getsByTag(tag)
{
	return document.getElementsByTagName(tag);
}

function getValue(element, key)
{
    if (element) {
        return element.getAttribute(key);
    } else {
        return "";
    }
}

function setValue(element, key, value)
{
    if (element) {
        return element.setAttribute(key, value);
    } else {
        return "";
    }
}


function removeDuplicated(data, character)
{
    var text = data;
    // removing duplicated comma
    while (text.indexOf(character + character) > -1) {
        text = text.replace(character + character, character);
    }
    // end
    return text;
}
