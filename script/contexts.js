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
        $(".context-source span").html(source);
        $(".context-main span").html(main);
        $(".context-more span").html(more);
    }
};

$(document).ready(function () {
    ContextAPI.Initialize();
});
