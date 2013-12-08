/**
 * WIKI Pages: to get wiki pages definitions for word.
 **/
var prefix = "[WIKI PAGES]: ";

/*-----------  open pages from popup buttons/links --------------*/
function openHomepage()
{
	// send message to content scripts
	//pup2tab(OperatorType.viewHomepage, ExtenionUID);

    // ok
    fromHomepage(ExtenionUID);
}

function openWikipage(word)
{
    logD("call openWikipage with word:" + word);

    var fromGoogle = function (word)
    {
        logW("Undefined Wikipedia Type: " + OptionItemValues.DefaultBaike);
        logW("Searching [" + word + "] by google.com ...");
        fromGoogleAPI(word);
    };

    // ok
    if (isChinese(word))
    {
        if (OptionItemValues.DefaultBaike == BaikeType.wikicn)
        {
            fromWikipediaCN(word);
        } 
        else if (OptionItemValues.DefaultBaike == BaikeType.tencent)
        {
            fromTencentAPI(word);
        }
        else if (OptionItemValues.DefaultBaike == BaikeType.baidu)
        {
            fromBaiduAPI(word);
        }
        else
        {
            fromGoogle(word);
        }
    }
    else
    {
        if (OptionItemValues.DefaultBaike == BaikeType.wikien)
        {
            fromWikipediaEN(word);
        }
        else if (OptionItemValues.DefaultBaike == BaikeType.tencent)
        {
            fromTencentAPI(word);
        }
        else if (OptionItemValues.DefaultBaike == BaikeType.baidu)
        {
            fromBaiduAPI(word);
        }
        else
        {
            fromGoogle(word);
        }
    }
}
/*END*/

function openPage(url, callback){
	if (chrome.tabs) {
	    chrome.tabs.create({ url: url }, callback);
	}
    else {
        logW(callback ? callback : "callback is undefined");
        logW(prefix + "chrome.tabs is NOT defined!");
        if (url.indexOf("://") == -1) 
        {
            url = "chrome-extension://" + ExtenionUID + "/" + url;
        }
        if (url.indexOf("http") == 0)
        {
            //window.open(url);
            // send data to background for open the page by chrome.tabs
            msg_send(OperatorType.openOptionPage, url, callback);
        }
        else
        {
            // send data to background for open the page by chrome.tabs
            msg_send(OperatorType.openOptionPage, url, callback);
        }
    }
}

/*-----------  open pages of different source from content or popup scripts--------------*/
function fromHomepage(uid)
{
	var url = "https://chrome.google.com/webstore/detail/language-translator/" + uid;
	openPage(url);
}
function fromWikipediaEN(word)
{
	var url = "http://en.wikipedia.org/wiki/" + encodeText(word);
    openPage(url);
}
function fromWikipediaCN(word)
{
    var url = "http://zh.wikipedia.org/wiki/" + encodeText(word);
    openPage(url);
}
function fromGoogleAPI(word)
{
    var url = 'https://www.google.com/#q=' + encodeText(word) + "&safe=strict";
    openPage(url);
}
// by scripts
function fromBaiduAPI(word)
{
    // Reference: http://baike.baidu.com/hezuo/hzsq.html
    // 1. open http://baike.baidu.com/
    // 2. set content of text id: word
    // 3. click the button of id: find by value [进入词条] and type [submit]

    var data = {
        type: BaikeType.baidu,
        control: true,
        value: word
    };

    msg_send(OperatorType.setBaikeSetting, data)

    openPage('http://baike.baidu.com/');
}
// by scripts
function fromTencentAPI(word)
{
    // Reference: http://baike.soso.com/
    // 1. open http://baike.soso.com/
    // 2. set content of text id: searchText
    // 3. click the button of id: find by id enterLemma or by value [进入词条] and type [submit]id = "searchText";
    
    var data = {
        type: BaikeType.tencent,
        control: true,
        value: word
    };

    msg_send(OperatorType.setBaikeSetting, data)

    openPage('http://baike.soso.com/');
}
/*END*/



/*-----------  set values of page elements of opened page, called by content scripts--------------*/
function setPage_BaiduAPI(isPageControl, value)
{
    if (isPageControl && isPageControl == true)
    {
        // text element
        var text = $("#word");
        if (text)
        {
            text.val(value);
            // button element
            var submit = $("input[value='进入词条']");
            logD(submit ? "submit found" : "submit NOT found");
            //if (submit.length > 0 && isDefined(submit[0].click))
            if (submit && isDefined(submit.click))
            {
                submit.click();
                logD("Submit button clicked.");
            }
            else
            {
                logE("Submit button not found.");
            }
        }
    }
}
function setPage_TencentAPI(isPageControl, value)
{
    if (isPageControl && isPageControl == true)
    {
        // text element
        var text = $("#searchText");
        if (text)
        {
            text.val(value);
            // button element
            var submit = $("#enterLemma");
            if (submit.length > 0 && isDefined(submit[0].click))
            {
                submit[0].click();
                logD("Submit button clicked.");
            }
            else
            {
                logE("Submit button not found.");
            }
        }
    }
}
/*END*/

