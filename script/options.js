
var prefix = "[OPTIONS PAGE]: ";


$(document).ready(function ()
{
    checkDebugger();
    
    scrollTitle();

    $("#product_name").attr("href", "https://chrome.google.com/webstore/detail/language-translator/" + ExtenionUID);

    // send feedback
    DomAPI.getElement("formSendFeedback").submit(sendFeedback);

    // send donation
    DomAPI.getElement("txtDonation").change(updateDonation);

    // save setting
    DomAPI.getElement("btnBasicSettings").click(saveSettings);

    // hide msg when sending out email
    $(".close").click(hideMsg);

    // load items of sections
    loadItems();

    // hide message
    hideMsg();

    // initialize donate
    initDonation();

    // show tab on loading page
    showTab();

    // bind events for legends
    bindLegendEvent();

    // open page for h*
    $("h1").click(openHomepage);

    // load settings for Options page
    msgout(OperatorType.loadSettings, null);

    $("#settings label:lt(4):even").css("color", "blue");

    // test email
    // testEmail();
});

var checkDebugger = function ()
{
    if (IsDebugger)
    {
        $("h1").hide();
        $("h6").hide();
    }
};

var scrollTitle = function ()
{
    $(window).scroll(function ()
    {
        var old = $("#divOptionPageTitle")[0].style.left;
        var left = 0 - scrollX + 40;
        if (old != left)
        {
            $("#divOptionPageTitle")[0].style.left = left + "px";
        }
    });
};

var bindLegendEvent = function ()
{
    var toggle = function (legend, area, click)
    {
        var l = $("#" + legend);
        l.click(function ()
        {
            $("#" + area).toggle();
        });
        if (click) { l.click(); }
    };

    var list = new Array(
        { l: 'lgdFeedback', a: 'feedbackArea', c: false },
        { l: 'lgdGrowth', a: 'ulGrowth', c: true },
        { l: 'lgdFixes', a: 'ulFixes', c: true },
        { l: 'lgdRelease', a: 'ulRelease', c: true }
    );
    
    list.forEach(function (o) { toggle(o.l, o.a, o.c); });
};

var loadItems = function ()
{
    var prefix = 'loadlist/';
    var ids = new Array("__authors",
                        "__basic_ops",
                        "__contributors",
                        "__fixes",
                        "__members",
                        "__more_fea",
                        "__more_ops",
                        "__news",
                        "__latest",
                        "__nice_fea",
                        "__releases",
                        "__advices",
                        "__sponsors");
    ids.forEach(function (id) { $("#" + id)[0].outerHTML = ReadFileAPI.getFileContentsSync(prefix + id + '.html'); });
};

var testEmail = function () {
    var name = DomAPI.getElement("txtName").val("Eric Xu");
    var from = DomAPI.getElement("txtEmail").val("190170412@qq.com");
    var content = DomAPI.getElement("txtFeedback").html("What you see is TEST SUGGESTION");
};

var showTab = function ()
{
    var tab = QueryString.getQueryStringByName(location, "tab");
    var selector = "#tabOptions a[href='#" + tab + "']";
    $(selector).tab("show");
    if (tab == "feedbacks")
    {
        $("#feedbackArea").toggle();
        // auto-donation
        // var donate = $(".paypal-button .large"); donate.click();
    }
};

var hideMsg = function ()
{
    DomAPI.getElement("msgContainer").hide();
};

var showMsg = function (message)
{
    showWarn(message);
    setTimeout(hideMsg, 1000 * 10);
};

var showWarn = function (message)
{
    DomAPI.getElement("msgContent").html(message);
    DomAPI.getElement("msgContainer").show();
}

var updateDonation = function ()
{
    var value = DomAPI.getElement("txtDonation").val();
    var span = DomAPI.getElement("spanDonation");
    span.html(value);
    var payPayAmount = $("input[name=amount]");
    payPayAmount.val(value);
};

var initDonation = function ()
{
    var donate = $(".paypal-button .large");
    donate.attr("title", "Donate to Author via safer & easier PayPal Online Payments Service!");
    donate.html("Donate via PayPal");
    updateDonation();
};

var sendFeedback = function () {
    var name = DomAPI.getElement("txtName").val();
    var from = DomAPI.getElement("txtEmail").val();
    var content = DomAPI.getElement("txtFeedback").val();

    showWarn("Submitting feedbacks, please wait...");

    // send out email
    //MailAPI.Send(name, from, content, showMsg, showWarn);
    MailAPI.Send(name, from, content, showMsg, showMsg);
    
    return false;
};

var loadSettings = function (data) {
    LoggerAPI.logD("loadSettings");
    var options = data;
    if (typeof(options.EnablePopupDialog) != "undefined" && options.EnablePopupDialog == TrueValue) {
        DomAPI.getElement("chkEnablePopupDialg").click();
    }
    if (typeof(options.EnableTranslation) != "undefined" && options.EnableTranslation == TrueValue) {
        DomAPI.getElement("chkEnableTextTranslation").click();
    }
    if (typeof(options.EnableCopyText) != "undefined" && options.EnableCopyText == TrueValue) {
        DomAPI.getElement("chkEnableCopyText").click();
    }
    if (typeof(options.EnableLogger) != "undefined" && options.EnableLogger == TrueValue) {
        DomAPI.getElement("chkEnableTraceLog").click();
    }
};

var saveSettings = function () {
    LoggerAPI.logD("saveSettings");
    var data = {
        message: {
            EnableTranslation: DomAPI.getElement("chkEnableTextTranslation")[0].checked,
            EnablePopupDialog: DomAPI.getElement("chkEnablePopupDialg")[0].checked,
            EnableCopyText: DomAPI.getElement("chkEnableCopyText")[0].checked,
            EnableLogger: DomAPI.getElement("chkEnableTraceLog")[0].checked
        }
    };
    msgout(OperatorType.saveSettings, data);
};



/*------- Send message --------*/
// Extension => Content Script
function msgout(type, message) 
{
    chrome.runtime.sendMessage(ExtenionUID, { type: type, message: message }, resp_opt);
}
// response callback
function resp_opt(response) {
    LoggerAPI.logD("#RESPONSE#: Received type [" + response.type + "], message [" + response.message + "]");

    var type = response.type;
    var message = response.message;

    if (type == OperatorType.getSelectText) {
        if (CommonAPI.isDefined(response) && CommonAPI.isValidText(response.message)) {
        }
    }
    else if (type == OperatorType.loadSettings) {
        loadSettings(message);
    }
    else if (type == OperatorType.saveSettings) {
        saveSettings();
    }
    else if (type == OperatorType.savedSettings) {
        alert("Settings saved successfully.");
    }
    else {
        var message = CommonAPI.isDefined(response) ? (CommonAPI.isValidText(response.message) ? response.message : "message not defined in response") : ("response not defined");
        LoggerAPI.logE("#RESPONSE#: Received response type: [" + response.type + "], response message: [" + message + "]");
    }
}
/*END*/
