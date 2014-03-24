
var prefix = "[OPTIONS PAGE]: ";

var OptionAPI =
{
    Initialize: function ()
    {
        OptionAPI.checkDebugger();

        OptionAPI.scrollTitle();

        $("#product_name").attr("href", ProductURIs.Product);

        // send feedback
        DomAPI.getElement("formSendFeedback").submit(OptionAPI.sendFeedback);

        // send donation
        DomAPI.getElement("txtDonation").change(OptionAPI.updateDonation);

        // save setting
        DomAPI.getElement("btnBasicSettings").click(OptionAPI.saveSettings);

        // hide msg when sending out email
        $(".close").click(OptionAPI.hideMsg);

        // load items of sections
        OptionAPI.loadItems();

        // hide message
        OptionAPI.hideMsg();

        // initialize donate
        OptionAPI.initDonation();

        // show tab on loading page
        OptionAPI.showTab();

        // bind events for legends
        OptionAPI.bindLegendEvent();

        // open page for h*
        $("h1").click(WikiAPI.openHomepage);

        // load settings for Options page
        MsgBugAPI.msg_send(OperatorType.loadSettings, null, OptionAPI.resp_option);

        $("#settings label:lt(4):even").css("color", "blue");

        // test email
        // testEmail();
    },

    // response callback
    resp_option: function (response)
    {
        LoggerAPI.logD("#RESPONSE#: Received type [" + response.type + "], message [" + response.message + "]");

        var type = response.type;
        var message = response.message;

        if (type == OperatorType.getSelectText)
        {
            if (CommonAPI.isDefined(response) && CommonAPI.isValidText(response.message))
            {
            }
        }
        else if (type == OperatorType.loadSettings)
        {
            OptionAPI.loadSettings(message);
        }
        else if (type == OperatorType.saveSettings)
        {
            OptionAPI.saveSettings();
        }
        else if (type == OperatorType.savedSettings)
        {
            alert("Settings saved successfully.");
        }
        else
        {
            var message = CommonAPI.isDefined(response) ? (CommonAPI.isValidText(response.message) ? response.message : "message not defined in response") : ("response not defined");
            LoggerAPI.logE("#RESPONSE#: Received response type: [" + response.type + "], response message: [" + message + "]");
        }
    },

    checkDebugger: function ()
    {
        if (IsDebugger)
        {
            $("h1").hide();
            $("h6").hide();
        }
    },

    scrollTitle: function ()
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
    },

    bindLegendEvent: function ()
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
    },

    loadItems: function ()
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
    },

    testEmail: function ()
    {
        var name = DomAPI.getElement("txtName").val("Eric Xu");
        var from = DomAPI.getElement("txtEmail").val("190170412@qq.com");
        var content = DomAPI.getElement("txtFeedback").html("What you see is TEST SUGGESTION");
    },

    showTab: function ()
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
    },

    hideMsg: function ()
    {
        DomAPI.getElement("msgContainer").hide();
    },

    showMsg: function (message)
    {
        OptionAPI.showWarn(message);
        setTimeout(OptionAPI.hideMsg, 1000 * 10);
    },

    showWarn: function (message)
    {
        DomAPI.getElement("msgContent").html(message);
        DomAPI.getElement("msgContainer").show();
    },

    updateDonation: function ()
    {
        var value = DomAPI.getElement("txtDonation").val();
        var span = DomAPI.getElement("spanDonation");
        span.html(value);
        var payPayAmount = $("input[name=amount]");
        payPayAmount.val(value);
    },

    initDonation: function ()
    {
        var donate = $(".paypal-button .large");
        donate.attr("title", "Donate to Author via safer & easier PayPal Online Payments Service!");
        donate.html("Donate via PayPal");
        OptionAPI.updateDonation();
    },

    sendFeedback: function ()
    {
        var name = DomAPI.getElement("txtName").val();
        var from = DomAPI.getElement("txtEmail").val();
        var content = DomAPI.getElement("txtFeedback").val();

        OptionAPI.showWarn("Submitting feedbacks, please wait...");

        // send out email
        //MailAPI.Send(name, from, content, showMsg, showWarn);
        MailAPI.Send(name, from, content, showMsg, showMsg);

        return false;
    },

    loadSettings: function (data)
    {
        LoggerAPI.logD("loadSettings");
        var options = data;
        if (typeof (options.EnablePopupDialog) != "undefined" && options.EnablePopupDialog == TrueValue)
        {
            DomAPI.getElement("chkEnablePopupDialg").click();
        }
        if (typeof (options.EnableTranslation) != "undefined" && options.EnableTranslation == TrueValue)
        {
            DomAPI.getElement("chkEnableTextTranslation").click();
        }
        if (typeof (options.EnableCopyText) != "undefined" && options.EnableCopyText == TrueValue)
        {
            DomAPI.getElement("chkEnableCopyText").click();
        }
        if (typeof (options.EnableLogger) != "undefined" && options.EnableLogger == TrueValue)
        {
            DomAPI.getElement("chkEnableTraceLog").click();
        }
    },

    saveSettings: function ()
    {
        LoggerAPI.logD("saveSettings");
        var data = {
            message: {
                EnableTranslation: DomAPI.getElement("chkEnableTextTranslation")[0].checked,
                EnablePopupDialog: DomAPI.getElement("chkEnablePopupDialg")[0].checked,
                EnableCopyText: DomAPI.getElement("chkEnableCopyText")[0].checked,
                EnableLogger: DomAPI.getElement("chkEnableTraceLog")[0].checked
            }
        };
        MsgBugAPI.msg_send(OperatorType.saveSettings, data, resp_option);
    }
};

$(document).ready(function ()
{
    OptionAPI.Initialize();
});
