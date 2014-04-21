/**
 * CONTENT SCRIPTS: to operate web-pages-opened-by-user.
 **/
 // Unlike the other chrome.* APIs, parts of chrome.runtime can be used by content scripts

var prefix = "[CONTEXT SCRIPTS]: ";

var ContextAPI =
{
    Initialize: function () {
        ListenerAPI.onMessageListener(MsgBusAPI.rcvmsg_context);
    },

    UpdateMeanings: function (result) {
        var source = result.source;
        var main = result.main;
        var more = result.more;
        var s = $(".context-source span");
        var m1 = $(".context-main textarea");
        var m2 = $(".context-more span");

        s.html(source);
        m1.html(main);
        m2.html(more);
        $("#txtTranslated").html(main);
    },

    BindCloseEvents: function () {
        $(".context-close span").click(function (e) {
            this.hide();
        });
    },

    ShowContextDialog: function () {
        $(".context-more span").html(more);
    },

    HideContextDialog: function () {
        $(".context-more span").html(more);
    }
};

$(document).ready(function () {
    ContextAPI.Initialize();
});
