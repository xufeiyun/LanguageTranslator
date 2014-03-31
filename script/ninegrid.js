/**
 * Nine Grid Pages: to load items and show in nine grid.
 **/
var prefix = "[Nine Grid]: ";
var CLEAR_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

var NineGridAPI = {

    Initialize: function ()
    {
        addDOMLoadEvent(this.ensureInit);
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
