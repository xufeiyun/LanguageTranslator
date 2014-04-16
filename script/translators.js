/*
	This javascript file is the defined translator features basedon google, baidu, youdao API etc.
*/
var prefix = "[TRANSLATORS]: ";

var translating = i18n.getMessage("Translating");

var TranslatorAPI =
{
    LastSource: "",
    IsTypedText: false, /* true when typing text, false when selecting text on page */
    CurrentCallBack: null,  /* Data Object: {source: "", main: "", more: ""} */

    /* entry for translating word */
    translate: function (message, callback) {
        TranslatorAPI.CurrentCallBack = null;
        TranslatorAPI.CurrentCallBack = callback;

        if (typeof (message) == "undefined") return false;

        message = $.trim(message);

        LoggerAPI.logD("TRANSLATE TEXT: " + message);

        if (!CommonAPI.isValidText(message)) {
            var classHide = "hide";
            $("#" + PronounceAudios.Source.ButtonId).addClass(classHide);
            $("#" + PronounceAudios.Main.ButtonId).addClass(classHide);
            $("#" + PronounceAudios.More.ButtonId).addClass(classHide);
        }

        if (!TranslatorAPI.IsTypedText) {
            // it will called by content dialog & context dialog
            if (typeof (TranslatorAPI.CurrentCallBack) == 'undefined' || typeof (TranslatorAPI.CurrentCallBack) != 'function') {
                // no need to translate if not changed:
                if (TranslatorAPI.LastSource.toLowerCase() == message.toLowerCase()) { return false; }
            }
        }

        // add Source pronounce
        if (typeof (AudioAPI.createTranslateAudio) != 'undefined') {
            AudioAPI.createTranslateAudio(PronounceAudios.Source, message);
        }

        TranslatorAPI.LastSource = message;

        if (message != '') { StorageAPI.setItem(OperatorType.getSelectText, message); }

        YouDaoTranslateAPI.translate(message, callback);
        //GoogleTranslateAPI.translate(message);
        //BaiduTranslateAPI.translate(message);
        //MicrosoftTranslateAPI.translate(message);
    },

    translateByInput: function () {
        TranslatorAPI.IsTypedText = true;
        LoggerAPI.logD("Translating by input......");
        var text = $("#" + ElementIds.TextSelected).val();
        TranslatorAPI.translate(text);
    },

    translateByTimeout: function () {
        clearTimeout(timeoutId);
        var interval = CommonAPI.getInterval(dtStart, new Date());
        if (interval > AutoTranslationInterval) {
            TranslatorAPI.translateByInput();
        }
    },

    translateByMessage: function (activeTab) {
        // response callback
        var resp_popup = function (response) {
            if (!CommonAPI.isDefined(response)) return false;

            LoggerAPI.logD("#RESPONSE#: Received type [" + response.type + "], message [" + response.message + "]");

            var type = response.type;
            var message = response.message;

            if (type == OperatorType.getSelectText) {
                if (CommonAPI.isDefined(response) && CommonAPI.isValidText(response.message)) {
                    LoggerAPI.logD("#RESPONSE#: Translating text: " + response.message);
                    TranslatorAPI.translate(response.message);
                    textSelected.focus();
                    textSelected.select();
                }
            }
            else if (type == OperatorType.viewWikipages) {
                WikiAPI.showWikipages(message);
            }
            else if (type == OperatorType.viewHomepage) {
                WikiAPI.showHomepage(message);
            }
            else {
                var message = CommonAPI.isDefined(response) ? (CommonAPI.isValidText(response.message) ? response.message : "message not defined in response") : ("response not defined");
                LoggerAPI.logE("#RESPONSE#: Received response type: [" + response.type + "], response message: [" + message + "]");
            }
        };

        // test create new tab with specific URL
        //chrome.tabs.create({ url: "http://www.163.com" });

        // test notification popup
        // CommonAPI.showPopupMsg('How are you? - popup');  // notification body text

        // send message to CONTENT SCRIPTS
        LoggerAPI.logD("Translating by message......");

        MsgBusAPI.msg_send(OperatorType.getSelectText, "", resp_popup);
    },

    tryTranslateNow: function () {
        var resp_translate = function (response) {
            TranslatorAPI.translate(response.message);
        }

        // translate firstly
        MsgBusAPI.msg_send(OperatorType.getSelectText, "", resp_translate);
    },

    translateByClipboard: function () {
        var text = window.Clipboard.paste();
        LoggerAPI.logD("Translating by clipboard text......");
        TranslatorAPI.translate(text);
        return CommonAPI.isValidText(text);
    },

    getDataResult: function (main, more) {
        var data = {
            'source': TranslatorAPI.LastSource,
            'main': main,
            'more': more
        };
        return data;
    },

    clearTexts: function (type) {
        LoggerAPI.logD("Clear Text...");
        var text = $("#" + ElementIds.TextSelected).val();
        if (!CommonAPI.isValidText(text)) {
            TranslatorAPI._update_source_text(EmptyText);
            TranslatorAPI._update_main_meaning(EmptyText, type);
            TranslatorAPI._update_more_meaning(EmptyText, type);
        }
        else {
            TranslatorAPI._update_height("#" + ElementIds.TextSelected);
        }
    },

    _show_api_logo: function (id) {
        $("#" + id).removeClass("hidden");
    },

    _update_height: function (id) {
        if (typeof (isIFramePopup) != "undefined") return;
        var attribute = "height";
        var obj = $(id);
        if (obj) {
            $(id).css(attribute, EmptyText);    // restore height
            TranslatorAPI._update_rows(id);
            if (obj.length > 0 && obj[0])
                $(id).css(attribute, $(id)[0].scrollHeight);    // set height
        }
    },

    _update_rows: function (id) {
        return true;
        var rows = $(id).val().split("\n").length;
        var count = $(id).val().length / OneLineCharCount;
        if (rows < 2) { rows = count; }
        $(id).attr("rows", rows);
    },

    _get_valid_suffix: function (type) {
        return (CommonAPI.isValidText(type)) ? type : "";
    },

    _initial_texts: function (message, type) {
        if (!CommonAPI.isValidText(message)) return false;
        TranslatorAPI._update_source_text(message);
        TranslatorAPI._update_main_meaning(translating, type);
        TranslatorAPI._update_more_meaning(translating, type);
        return true;
    },

    _update_source_text: function (text) {
        LoggerAPI.logD('update source text');
        var id = "#" + ElementIds.TextSelected;
        $(id).val(text);
        TranslatorAPI._update_height(id);
        if (text != EmptyText && !TranslatorAPI.IsTypedText) { $(id).blur(); }
    },

    _update_main_meaning: function (text, type) {
        var id = "#" + ElementIds.TextTranslated + TranslatorAPI._get_valid_suffix(type);
        $(id).val(text);
        TranslatorAPI._update_height(id);
    },

    _update_more_meaning: function (text, type) {
        var id = "#" + ElementIds.TextTranslatedAll + TranslatorAPI._get_valid_suffix(type);
        $(id).val(text);
        $(id).html(text);
        TranslatorAPI._update_height(id);
    }
};

var YouDaoTranslateAPI =
{
    CurrentCallBack: null,

    /*-----------  Translate By YouDao API --------------*/
    translate: function (message, callback) {
        YouDaoTranslateAPI.CurrentCallBack = null;
        YouDaoTranslateAPI.CurrentCallBack = callback;

        if (!CommonAPI.isValidText(message)) return false;

        var type = "";
        TranslatorAPI._initial_texts(message, type);

        var text = message;
        var url = "http://fanyi.youdao.com/openapi.do?keyfrom=SZJWCKJ&key=998983058&type=data&doctype=json&version=1.1";
        $.ajax({
            url: url,
            dataType: "json",
            type: "get",
            data: "q=" + CommonAPI.encodeText(text),
            success: function (result) {
                TranslatorAPI._show_api_logo("logoYouDao");
                if (result.errorCode == 0) {
                    YouDaoTranslateAPI._parse_yd_result(result);
                }
                else {
                    YouDaoTranslateAPI._handle_yd_error(result.errorCode);
                }
            }
        });

    },

    _handle_yd_error: function (errorCode) {
        var text = "Normal";
        var prefix = "YourDao";
        switch (errorCode) {
            case 20:
            case 30:
            case 40:
            case 50:
                text = i18n.getMessage(prefix + errorCode);
                break;
                defaut:
                text = i18n.getMessage(prefix + "Default");
        }
        TranslatorAPI._update_main_meaning(text);
        TranslatorAPI._update_more_meaning(" ");

        // invoke callback
        if (YouDaoTranslateAPI.CurrentCallBack && typeof (YouDaoTranslateAPI.CurrentCallBack) == 'function') { YouDaoTranslateAPI.CurrentCallBack(TranslatorAPI.getDataResult(text, " ")); }
    },

    _parse_yd_result: function (result) {
        var type = "";
        LoggerAPI.logD(result.toString());

        //var data = JSON.parse(result);
        var main = "";
        var more = "";
        var data = result;

        if (data.errorCode == 0) {
            var single = "";
            var multiples = "";
            var sound = "";

            var hasBasic = (data.basic) ? true : false;
            if (hasBasic) {
                single = YouDaoTranslateAPI._combine_values(data.basic.explains, "." + NewLine);
                if (CommonAPI.isDefined(data.basic.phonetic)) {
                    sound = "[" + data.basic.phonetic + "]  " + NewLine;
                }
            }
            else {
                single = YouDaoTranslateAPI._combine_values(data.translation);
            }

            // add Main pronounce
            AudioAPI.createTranslateAudio(PronounceAudios.Main, single);
            main = sound + single;
            TranslatorAPI._update_main_meaning(main);

            var hasWeb = (data.web) ? true : false;
            if (hasWeb) {
                var webs = data.web;
                for (var i = 0; i < webs.length; i++) {
                    var web = webs[i];
                    var key = web.key;
                    var value = YouDaoTranslateAPI._combine_values(web.value);
                    multiples += ((multiples == "") ? "" : NewLine) + key + ": " + value;
                }
            }
            else {
                multiples = single;
            }

            // add More pronounce
            AudioAPI.createTranslateAudio(PronounceAudios.More, multiples);
            more = multiples;
            TranslatorAPI._update_more_meaning(more);

            // invoke callback
            if (YouDaoTranslateAPI.CurrentCallBack && typeof (YouDaoTranslateAPI.CurrentCallBack) == 'function') { YouDaoTranslateAPI.CurrentCallBack(TranslatorAPI.getDataResult(main, more)); }
        }
    },
    _combine_values: function (valuesArray, separator) {
        if (!CommonAPI.isValidText(separator)) { separator = Comma; }
        var values = "";
        for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
            if (values == "") {
                values += value.toString();
            }
            else {
                values += separator + value.toString();
            }
        }
        return values;
    }
    /*END*/
};

var GoogleTranslateAPI =
{
    CurrentCallBack: null,

    /*-----------  Translate By Google API --------------*/
    translate: function (message, callback)
    {
        GoogleTranslateAPI.CurrentCallBack = null;
        GoogleTranslateAPI.CurrentCallBack = callback;

        if (!CommonAPI.isValidText(message)) return false;

        //var type = "G";
        var type = "";
        TranslatorAPI._initial_texts(message, type);

        var text = CommonAPI.encodeText(message);
        var url = "http://translate.google.com.hk/translate_a/t?client=t&hl=en&sl=en&tl=zh-CN&ie=UTF-8&oe=UTF-8&multires=1&oc=2&otf=1&rom=1&ssel=4&tsel=4&pc=1&sc=1&q=" + text;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function ()
        {
            TranslatorAPI._show_api_logo("logoGoogle");
            /*
             0 (Uninitialized) The object has been created, but not initialized (the open method has not been called).
             1 (Open) The object has been created, but the send method has not been called.
             2 (Sent) The send method has been called, but the status and headers are not yet available.
             3 (Receiving) Some data has been received.
             4 (Loaded) All the data has been received, and is available.
             * */
            if (xhr.readyState == 4)
            {
                // received json data
                // all meanings sent back
                text = xhr.responseText;
                text = CommonAPI.removeDuplicated(text, Comma);

                // main meaning
                var data = JSON.parse(text);
                var main = data[0][0][0];
                // LoggerAPI.logD(data);
                $("#" +  ElementIds.TextTranslated + type).val(main);

                // more meanings
                var more = GoogleTranslateAPI._parse_data(data);
                if (more == EmptyText) { more = main; }
                more = CommonAPI.removeDuplicated(more, Comma);
                more = CommonAPI.removeDuplicated(more, NewLine);
                $("#" + ElementIds.TextTranslatedAll + type).val(more);
            }
            return true;
        };
        xhr.send();

        return true;
    },

    /* data should be array */
    _parse_data: function (data)
    {
        var t = "";
        var counts = 0;
        var index = 0;
        var values = " ";
        var value = "";
        t = typeof (data);
        counts = (t == "object" && data.length > 0) ? (data.length) : (0);
        while (index < counts)
        {
            try
            {
                value = data[index];
                if (typeof(value) == "object") {
                    values += Comma + GoogleTranslateAPI._parse_data(value);
                } else if (typeof(value) == "string" && $.trim(value) != EmptyText) {
                    values += Comma + value;
                }
            }
            catch (e)
            {
                LoggerAPI.logW(e);
                console.error(e);
            }
            finally
            {
            }
            index++;
            values += NewLine;
        }
        return values;
    }
};

var BaiduTranslateAPI =
{
    CurrentCallBack: null,

    /*-----------  Translate By BaiDu API --------------*/
    translate: function (message, callback)
    {
        BaiduTranslateAPI.CurrentCallBack = null;
        BaiduTranslateAPI.CurrentCallBack = callback;

        if (!CommonAPI.isValidText(message)) return false;

        var type = "B";
        TranslatorAPI._initial_texts(message, type);

        // TODO
    }
    /*END*/
};

var MicrosoftTranslateAPI = 
{
    CurrentCallBack: null,

    /*-----------  Translate By YouDao API --------------*/
    translate: function (message, callback)
    {
        MicrosoftTranslateAPI.CurrentCallBack = null;
        MicrosoftTranslateAPI.CurrentCallBack = callback;

        if (!CommonAPI.isValidText(message)) return false;

        var type = "M";
        TranslatorAPI._initial_texts(message, type);

        // TODO
    }
    /*END*/
};