/**
 * Nine Grid Pages: to load items and show in nine grid.
 **/
var prefix = "[Nine Grid]: ";
var CLEAR_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// t: Title, d: Image URL
var wikiTabs = new Array(
    {t: 'Baidu Wiki', d: 'baidu_wiki.png'},
    {t: 'Tencent', d: 'tencent_wiki.png'},
    {t: 'Wiki EN', d: 'wikien_wiki.png'},
    {t: 'Wiki CN', d: 'wikicn_wiki.png'}
);
var searchTabs = new Array(
    {t: 'Google', d: 'google_search.png'},
    {t: 'Baidu', d: 'baidu_search.png'},
    {t: 'Microsoft', d: 'bing_search.png'},
    {t: 'Tencent', d: 'tencent_search.png'}
);
var shareTabs = new Array(
    {t: 'QQ空间', d: 'qzone_share.png'},
    {t: '人人网', d: 'renren_share.png'},
    {t: 'Digg', d: 'digg_share.png'},
    {t: '36Kr', d: '36kr_share.png'}
);
var studyTabs = new Array();
var cardTabs = new Array();

// t: type, d: data object
var tabs = new Array(
    { t: "wiki", d: wikiTabs },
    { t: "search", d: searchTabs },
    { t: "share", d: shareTabs }/*,
    { t: "study", d: studyTabs },
    { t: "card", d: cardTabs }*/
);

    var NineGridAPI = {

        SourceText: "",

        Initialize: function () {
            addDOMLoadEvent(this.ensureInit);

            if (typeof (chrome) != "undefined") {
                //chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { MsgBusAPI.rcvmsg_ninegrid(request, sender, sendResponse); });
            }

            // get selected text
            MsgBusAPI.msg_send(OperatorType.getSelectText, "", NineGridAPI.resp_ninegrid);
        },

        resp_ninegrid: function (response) {
            NineGridAPI.SourceText = response.message;
            console.error(response.message);
        },

        ensureInit: function () {
            NineGridAPI.loadTabItems();

            NineGridAPI.bindEvents();
        },

        loadTabItems: function () {
            var toggle = function (legend, area, click) {
                var l = $("#" + legend);
                l.click(function () {
                    $("#" + area).toggle();
                });
                if (click) { l.click(); }
            };

            var imgBasePath = "image/ninegrid/";
            var appendItems = function (tabId, title, image) {
                var tab = $("#" + tabId);
				if (tab == null || tab.length == 0) { return false; }
				
                var div = DomAPI.createElement("div");
                var img = DomAPI.createElement("img");
                img.alt = title;
                if (image == "") {
                    img.src = CLEAR_GIF;
                } else {
                    img.src = imgBasePath + image;
                }
                div.appendChild(img);
                tab[0].appendChild(div);

                if (title != "") {
                    var span = DomAPI.createElement("span");
                    span.innerHTML = title;
                    div.appendChild(span);
                    div.className = "productCellText";
                } else {
                    div.className = "productCell";
                }

                console.error("TODO: different event for different type");

                var wiki = $(div);
                if (tabId == "wiki" && wiki) {
                    wiki.click(function (e) {
                        WikiAPI.fromBaiduAPI(NineGridAPI.SourceText);
                    });
                }
				return true;
            };

            // load each tab & its items
            tabs.forEach(function (o) {
                var tabId = o.t;
                var data = o.d;
				var result = true;
                data.forEach(function (o) {
                    if (result) {
						result = appendItems(tabId, o.t, o.d);
					}					
                });
            });
        },

        bindEvents: function () {
            // add click events
            var wiki = $("#baidu_wiki");
            if (wiki.length == 0) {
                wiki = document.getElementById('baidu_wiki');
            };
            if (wiki) {
                wiki.click(function (e) {
                    WikiAPI.fromBaiduAPI(NineGridAPI.SourceText);
                });
            }

            // toggle tab by codes
            var tabs = $("#tabNineGrid li a");
            tabs.mouseenter(function (e) { console.error(this.href); this.click(); });

            // set all the image to null image
            $("img[src='data']").attr('src', CLEAR_GIF);
        }
    };

NineGridAPI.Initialize();
