
var prefix = "[OPTIONS PAGE]: ";


// this includes: [select text by moving mouse] and [select text by dbl-clicking the text]
document.onselectionchange = fnSelectionChanged;
function fnSelectionChanged() {
    logD("OPTIONS page loaded.");
}


$(document).ready(function ()
{
    if (IsDebugger)
    {
        $("h1").hide();
        $("h6").hide();
    }

    $("#extesion_url").attr("href", "https://chrome.google.com/webstore/detail/language-translator/" + ExtenionUID);

    // send feedback
    getElement("formSendFeedback").submit(sendFeedback);

    // text donation
    getElement("txtDonation").change(updateDonation);

    $(".close").click(function ()
    {
        hideMsg();
    });

    $("#btnBasicSettings").click(function ()
    {
        saveSettings();
    });

    loadItems();

    // hide message
    hideMsg();

    // initialize donate
    initDonation();

    showTab();

    $("#lgdFeedback").click(function ()
    {
        $("#feedbackArea").toggle();
    });

    // load settings for Options page
    msgout(OperatorType.loadSettings, null);

    $("h1").click(function ()
    {
        openHomepage();
    });

    $("#settings label:lt(4):even").css("color", "blue");
    // test email
    // testEmail();
});

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
                        "__nice_fea",
                        "__releases",
                        "__sponsors");
    ids.forEach(function (id) { $("#" + id)[0].outerHTML = ReadFileAPI.getFileContentsSync(prefix + id + '.html'); });
};

var testEmail = function () {
    var name = getElement("txtName").val("Eric Xu");
    var from = getElement("txtEmail").val("190170412@qq.com");
    var content = getElement("txtFeedback").html("What you see is TEST SUGGESTION");
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
    getElement("msgContainer").hide();
};

var showMsg = function (message)
{
    showWarn(message);
    setTimeout(hideMsg, 1000 * 10);
};

var showWarn = function (message)
{
    getElement("msgContent").html(message);
    getElement("msgContainer").show();
}

var updateDonation = function ()
{
    var value = getElement("txtDonation").val();
    var span = getElement("spanDonation");
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
    var name = getElement("txtName").val();
    var from = getElement("txtEmail").val();
    var content = getElement("txtFeedback").val();

    showWarn("Submitting feedbacks, please wait...");

    // send out email
    //MailAPI.Send(name, from, content, showMsg, showWarn);
    MailAPI.Send(name, from, content, showMsg, showMsg);
    
    return false;
};

var loadSettings = function (data) {
    logD("loadSettings");
    var options = data;
    if (typeof(options.EnablePopupDialog) != "undefined" && options.EnablePopupDialog == TrueValue) {
        getElement("chkEnablePopupDialg").click();
    }
    if (typeof(options.EnableTranslation) != "undefined" && options.EnableTranslation == TrueValue) {
        getElement("chkEnableTextTranslation").click();
    }
    if (typeof(options.EnableCopyText) != "undefined" && options.EnableCopyText == TrueValue) {
        getElement("chkEnableCopyText").click();
    }
    if (typeof(options.EnableLogger) != "undefined" && options.EnableLogger == TrueValue) {
        getElement("chkEnableTraceLog").click();
    }
};

var saveSettings = function () {
    logD("saveSettings");
    var data = {
        message: {
            EnableTranslation: getElement("chkEnableTextTranslation")[0].checked,
            EnablePopupDialog: getElement("chkEnablePopupDialg")[0].checked,
            EnableCopyText: getElement("chkEnableCopyText")[0].checked,
            EnableLogger: getElement("chkEnableTraceLog")[0].checked
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
    logD("#RESPONSE#: Received type [" + response.type + "], message [" + response.message + "]");

    var type = response.type;
    var message = response.message;

    if (type == OperatorType.getSelectText) {
        if (isDefined(response) && isValidText(response.message)) {
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
        var message = isDefined(response) ? (isValidText(response.message) ? response.message : "message not defined in response") : ("response not defined");
        logE("#RESPONSE#: Received response type: [" + response.type + "], response message: [" + message + "]");
    }
}
/*END*/
