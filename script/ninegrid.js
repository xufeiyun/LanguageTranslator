/**
 * Nine Grid Pages: to load items and show in nine grid.
 **/
var prefix = "[Nine Grid]: ";
var CLEAR_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

var NineGridAPI = {

    SourceText: "",

    Initialize: function ()
    {
        addDOMLoadEvent(this.ensureInit);

        var wiki = $("#baidu_wiki");
        if (wiki.length == 0)
        {
            wiki = document.getElementById('baidu_wiki');
        };
        if (wiki)
        {
            wiki.click(function (e)
            {
                WikiAPI.fromBaiduAPI(NineGridAPI.SourceText);
            });
        }

        if (typeof (chrome) != "undefined")
        {
            //chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { MsgBusAPI.rcvmsg_ninegrid(request, sender, sendResponse); });
        }

        // get selected text
        MsgBusAPI.msg_send(OperatorType.getSelectText, "", NineGridAPI.resp_ninegrid);
    },

    resp_ninegrid: function (response)
    {
        NineGridAPI.SourceText = response.message;
        console.error(response.message);
    },

    ensureInit: function ()
    {
        // set all the image to null image
        $("img[src='data']").attr('src', CLEAR_GIF);
    },

    onAdData: function (adData)
    {
        this.ensureInit();
        //theAd.setAdData(adData);
    },

    loadWikiItems: function ()
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

    loadSearchItems: function ()
    {
    },

    loadShareItems: function ()
    {
    },

    loadStudyItems: function ()
    {
    }
};

NineGridAPI.Initialize();
