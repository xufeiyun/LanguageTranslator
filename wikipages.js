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
    showPopupMsg("call openWikipage with word:" + word);

    // send message to content scripts
    //pup2tab(OperatorType.viewWikipages, word);

    // ok
    //fromWikipediaEN(word);
    //fromWikipediaCN(word);
    //fromTencentAPI(word);
    fromBaiduAPI(word);
}
/*END*/


/*-----------  open pages of different source from content or popup scripts--------------*/
function fromHomepage(uid)
{
	var url = "https://chrome.google.com/webstore/detail/language-translator/" + uid;
    chrome.tabs.create({ url: url });
}
function fromWikipediaEN(word)
{
	var url = "http://en.wikipedia.org/wiki/" + encodeText(word);
    chrome.tabs.create({ url: url });
}
function fromWikipediaCN(word)
{
    var url = "http://zh.wikipedia.org/wiki/" + encodeText(word);
    chrome.tabs.create({ url: url });
}
function fromBaiduAPI(word)
{
    // Reference: http://baike.baidu.com/hezuo/hzsq.html
    // 1. open http://baike.baidu.com/
    // 2. set content of text id: word
    // 3. click the button of id: find by value [进入词条] and type [submit]
    var success = function(results) {
        showPopupMsg("RESULT:" + results.toString());
    };
    var initialData = function (tab) {
        var tabId = tab.id;
        var windowId = tab.windowId;
        var value = getItem(OperatorType.copySelectText);
        // execute script code
        var details = {code: "localStorage['" + OperatorType.copySelectText + "'] = '" + value + "';", allFrames: false};
        chrome.tabs.executeScript(tabId, details, success);
        details = {code: "localStorage['" + OperatorType.setPageControl + "'] = true;", allFrames: false};
        chrome.tabs.executeScript(tabId, details, success);
        details = {code: "localStorage['" + OperatorType.setBaikeType + "'] = '" + BaikeType.baidu + "';", allFrames: false};
        chrome.tabs.executeScript(tabId, details, success);
    };
    // works in background & popup
    chrome.tabs.create({ url: 'http://baike.baidu.com/' }, initialData);
}
function fromTencentAPI(word)
{
    // Reference: http://baike.soso.com/
    // 1. open http://baike.soso.com/
    // 2. set content of text id: searchText
    // 3. click the button of id: find by id enterLemma or by value [进入词条] and type [submit]id = "searchText";
    var initialData = function (tab) {
        var tabId = tab.id;
        var windowId = tab.windowId;
        var value = getItem(OperatorType.copySelectText);
        // execute script code
        var details = {code: "localStorage['" + OperatorType.copySelectText + "'] = '" + value + "';", allFrames: false};
        chrome.tabs.executeScript(tabId, details);
        details = {code: "localStorage['" + OperatorType.setPageControl + "'] = true;", allFrames: false};
        chrome.tabs.executeScript(tabId, details);
        details = {code: "localStorage['" + OperatorType.setBaikeType + "'] = '" + BaikeType.tencent + "';", allFrames: false};
        chrome.tabs.executeScript(tabId, details);
    };
    // works in background & popup
    chrome.tabs.create({ url: 'http://baike.soso.com/' }, initialData);
}
/*END*/



/*-----------  set values of page elements of opened page, called by content scripts--------------*/
function setPage_BaiduAPI(isTyped, value)
{
    showPopupMsg("setPage_BaiduAPI:" + value);
    if (isTyped && isTyped == true)
    {
        // text element
        var text = $("#word");
        showPopupMsg(text ? "text found" : "text NOT found");
        if (text)
        {
            text.val(value);
            // button element
            var submit = $("input[value='进入词条']");
            showPopupMsg(submit ? "submit found" : "submit NOT found");
            //if (submit.length > 0 && isDefined(submit[0].click))
            if (submit && isDefined(submit.click))
            {
                submit.click();
                console.log("Submit button clicked.");
                showPopupMsg("Submit button clicked.");
            }
            else
            {
                logE("Submit button not found.");
            }
        }
    }
}
function setPage_TencentAPI(isTyped, value)
{
    if (isTyped && isTyped == true)
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
                console.log("Submit button clicked.");
            }
            else
            {
                console.error("Submit button not found.");
            }
        }
    }
}
/*END*/

