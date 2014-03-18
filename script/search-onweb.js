
/**
	This javascript file is to search words from web: google, baidu or bing.
**/

var SearchWeb =
{
    Initialize: function ()
    {
        $(".PopupSearchDiv span").mouseenter(function (e)
        {
            SearchWeb.showList();
        });
        $(".PopupSearchDiv span").mousemove(function (e)
        {
            SearchWeb.showList();
        });
        /*
        $(".PopupSearchDiv span").mouseout(function (e) {
        $(".PopupSearchDiv ul").hide();
        });
        $(".PopupSearchDiv span").mouseleave(function (e) {
        $(".PopupSearchDiv ul").hide();
        });*/

        $(".PopupSearchList li").click(function (e)
        {
            var dataLeft = e.target.getAttribute('data-left');
            var dataMid = encodeText(textSelected.val());
            var dataRight = e.target.getAttribute('data-right');
            var url = dataLeft + dataMid + dataRight;

            openPage(url);

            SearchWeb.hideList();
        });
        $(".PopupSearchList").mouseout(function (e)
        {
            SearchWeb.hideList();
        });
        $(".PopupSearchList").mousemove(function (e)
        {
            SearchWeb.showList();
        });
    },

    showList: function ()
    {
        var ul = $(".PopupSearchList");
        // if the volume displays, then widthen the left
        var isHidden = ($('#btnReadSource').css('display') == 'none');
        if (isHidden)
        {
            ul.addClass("PopupSearchListOffset");
        }
        else
        {
            ul.removeClass("PopupSearchListOffset");
        }
        $(".PopupSearchDiv ul").show();
    },

    hideList: function ()
    {
        $(".PopupSearchDiv ul").hide();
    }
};