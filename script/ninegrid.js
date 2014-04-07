/**
 * Nine Grid Pages: to load items and show in nine grid.
 **/
var prefix = "[Nine Grid]: ";
var CLEAR_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// t: Text, d: Image URL, f: function with one parameter which is the SourceText, tt: ToolTip/Title
var wikiTabs = new Array(
    {t: 'Wiki EN', d: 'wikien_wiki.png', f: WikiAPI.fromWikipediaEN, tt: 'View Wiki Page of Source Text on English Page'},
    {t: 'Wiki CN', d: 'wikicn_wiki.png', f: WikiAPI.fromWikipediaCN, tt: 'View Wiki Page of Source Text on Chinese-Simplified Page'},
    {t: 'Baidu Wiki', d: 'baidu_wiki.png', f: WikiAPI.fromBaiduWiki, tt: 'View Wiki Page of Source Text on Baidu Baike'},
    {t: 'Tencent', d: 'tencent_wiki.png', f: WikiAPI.fromTencentWiki, tt: 'View Wiki Page of Source Text on Tencent Baike'}
);
var searchTabs = new Array(
    {t: 'Google', d: 'google_search.png', f: SearchAPI.fromGoogleAPI, tt: 'Search Source Text on Google'},
    {t: 'Microsoft', d: 'bing_search.png', f: SearchAPI.fromMicrosoftAPI, tt: 'Search Source Text on Bing(Microsoft)'},
    {t: 'Baidu', d: 'baidu_search.png', f: SearchAPI.fromBaiduAPI, tt: 'Search Source Text on Baidu'},
    {t: 'Tencent', d: 'tencent_search.png', f: SearchAPI.fromTencentAPI, tt: 'Search Source Text on Soso(Tencent)'}
);
var shareTabs = new Array(
    {t: 'QQ空间', d: 'qzone_share.png', f: ShareAPI.fromQZoneAPI, tt: 'Share Source Text to QQ Space'},
    {t: '人人网', d: 'renren_share.png', f: ShareAPI.fromRenRenAPI, tt: 'Share Source Text to RenRen.com'},
    {t: 'Digg', d: 'digg_share.png', f: ShareAPI.fromDiggAPI, tt: 'Share Source Text to Digg.com'},
    {t: '36Kr', d: '36kr_share.png', f: ShareAPI.from36KrAPI, tt: 'Share Source Text to 36Kr.com'}
);
var studyTabs = new Array();
var cardTabs = new Array();

// t: type, d: data object
var tabs = new Array(
    { t: "search", d: searchTabs, f: '', tt: 'Search Source Text on Internet' },
    { t: "wiki", d: wikiTabs, f: '', tt: 'View Encyclopedia Page of Source Text' },
    { t: "share", d: shareTabs, f: '', tt: 'Share Source Text to my friends or blogs' },
    { t: "study", d: studyTabs, f: '', tt: 'Learn & Study words' },
    { t: "card", d: cardTabs, f: '', tt: 'Manage the Cards of Source Text' }
);

    var NineGridAPI = {

        SourceText: "",
        TabIdPrefix: "ng_",
        ImageBasePath: "image/ninegrid/",

        Initialize: function () {
            var url = "" + window.location.href;
            if (!url.contains('ninegrid.html')) return false;

            addDOMLoadEvent(this.ensureInit);

            //ListenerAPI.onMessageListener(MsgBusAPI.rcvmsg_ninegrid);

            NineGridAPI.sendMessage(NineGridAPI.resp_ninegrid);
        },

        sendMessage: function (callback) {
            // get latest selected text
            MsgBusAPI.msg_send(OperatorType.getSelectText, "", callback);
        },

        resp_ninegrid: function (response) {
            NineGridAPI.SourceText = response.message;
        },

        ensureInit: function () {
            NineGridAPI.loadTabItems();

            NineGridAPI.bindEvents();
        },

        loadTabItems: function () {
            var appendEachItem = function (type, text, image, fn, tooltip) {
                var tab = $("#" + NineGridAPI.TabIdPrefix + type);
                if (tab == null || tab.length == 0) { return false; }

                var div = DomAPI.createElement("div");  // the cell div
                var img = DomAPI.createElement("img");  // the cell image
                img.alt = text;
                if (image == "") {
                    img.src = CLEAR_GIF;
                } else {
                    img.src = NineGridAPI.ImageBasePath + image;    // image path
                }
                div.appendChild(img);
                tab[0].appendChild(div);

                if (text != "") {
                    var span = DomAPI.createElement("span");    // the cell text
                    span.innerHTML = text;
                    div.appendChild(span);
                    div.className = "productCellText";
                } else {
                    div.className = "productCell";
                }
                $(div).attr('title', tooltip);
                // click cell
                $(div).click(function (e) {
                    if (typeof (fn) == "function") {
                        var callback = function (response) {
                            NineGridAPI.SourceText = response.message;
                            fn(NineGridAPI.SourceText);
                        };
                        NineGridAPI.sendMessage(callback);
                    }
                });
                return true;
            };

            // load each tab & its items
            tabs.forEach(function (o) {
                var type = o.t;
                var data = o.d;
                var title = o.tt;
                var result = true;

                var tab = $("#" + NineGridAPI.TabIdPrefix + type + "_tab");
                if (tab && tab.length > 0) {
                    var cls = tab.parent().attr('class');
                    if (cls.contains("hide")) { return; }   /* skip those tab which is hidden */
                }

                $("#" + NineGridAPI.TabIdPrefix + type + "_tab").attr('title', title);
                $("#" + NineGridAPI.TabIdPrefix + type + "_title").attr('title', title);

                data.forEach(function (o) {
                    if (result) {
                        result = appendEachItem(type, o.t, o.d, o.f, o.tt);
                    }
                });
            });
        },

        bindEvents: function () {
            // toggle tab when mouse hovers
            var tabs = $("#tabNineGrid li a");
            tabs.mouseenter(function (e) { this.click(); });

            // set all the image to null image
            $("img[src='data']").attr('src', CLEAR_GIF);
        }
    };

NineGridAPI.Initialize();
