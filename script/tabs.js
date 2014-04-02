/*
	This javascript file is the defined tab features basedon google, baidu, youdao API etc.
*/
/*-----------  toggle tabs --------------*/

var TabsAPI =
{
    Initialize: function() {
        this.bindLinkEvents();
    },

    bindLinkEvents: function(){
        $('#tabAPIs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });
    }
};

$(document).ready(function(){
    TabsAPI.Initialize();
});
/*END*/

