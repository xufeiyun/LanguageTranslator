/*
	This javascript file is the defined translator features basedon google, baidu, youdao API etc.
*/
var prefix = "[TRANSLATORS]: ";

var translating = i18n.getMessage("Translating");
var emptytext = "";

var TranslatorAPI =
{
    translate: function (message)
    {
        LoggerAPI.logD("TRANSLATE..."); if (typeof (message) == "undefined") return false;

        message = $.trim(message);

        if (!CommonAPI.isValidText(message))
        {
            var classHide = "hide";
            $("#" + PronounceAudios.Source.ButtonId).addClass(classHide);
            $("#" + PronounceAudios.Main.ButtonId).addClass(classHide);
            $("#" + PronounceAudios.More.ButtonId).addClass(classHide);
        }

        // add Source pronounce
        if (typeof (AudioAPI.createTranslateAudio) != undefined)
        {
            AudioAPI.createTranslateAudio(PronounceAudios.Source, message);
        }
        //LoggerAPI.logD(AjaxAPI.getFileContentsSync('https://dl.yunio.com/pub/0LpA2l?name=webpage_popup.txt'));
        
        YouDaoTranslateAPI.translate(message);
        GoogleTranslateAPI.translate(message);
        BaiduTranslateAPI.translate(message);
        MicrosoftTranslateAPI.translate(message);
    },

    clearTexts: function (type)
    {
        LoggerAPI.logD("Clear Text...");
        var text = $("#txtSelected").val();
        if (!CommonAPI.isValidText(text))
        {
            TranslatorAPI._update_source_text(emptytext);
            TranslatorAPI._update_main_meaning(emptytext, type);
            TranslatorAPI._update_more_meaning(emptytext, type);
        }
        else
        {
            TranslatorAPI._update_height("#txtSelected");
        }
    },

    translateByInput: function ()
    {
        LoggerAPI.logD("Translating by input......");
        var text = $("#txtSelected").val();
        TranslatorAPI.translate(text);
    },

    translateByClipboard: function ()
    {
        var text = window.Clipboard.paste();
        LoggerAPI.logD("Translating by clipboard text......");
        TranslatorAPI.translate(text);
        return CommonAPI.isValidText(text);
    },

    _show_api_logo: function (id)
    {
        $("#" + id).removeClass("hidden");
    },

    _update_height: function (id)
    {
        if (typeof (isIFramePopup) != "undefined") return;

        var attribute = "height";

        $(id).css(attribute, emptytext);    // restore height

        TranslatorAPI._update_rows(id);

        $(id).css(attribute, $(id)[0].scrollHeight);    // set height
    },

    _update_rows: function (id)
    {
        return true;
        var rows = $(id).val().split("\n").length;
        var count = $(id).val().length / OneLineCharCount;
        if (rows < 2)
        {
            rows = count;
        }
        $(id).attr("rows", rows);
    },

    _get_valid_suffix: function (type)
    {
        return t = (CommonAPI.isValidText(type)) ? type : "";
    },

    _initial_texts: function (message, type)
    {
        if (!CommonAPI.isValidText(message)) return false;

        TranslatorAPI._update_source_text(message);
        TranslatorAPI._update_main_meaning(translating, type);
        TranslatorAPI._update_more_meaning(translating, type);
        return true;
    },

    _update_source_text: function (text)
    {
        LoggerAPI.logD('update source text');
        var id = "#txtSelected";
        $(id).val(text);
        TranslatorAPI._update_height(id);
        if (text != emptytext)
        {
            $(id).blur();
        }
    },

    _update_main_meaning: function (text, type)
    {
        var id = "#txtTranslated" + TranslatorAPI._get_valid_suffix(type);
        $(id).val(text);
        TranslatorAPI._update_height(id);
    },

    _update_more_meaning: function (text, type)
    {
        var id = "#txtTranslatedAll" + TranslatorAPI._get_valid_suffix(type);
        $(id).val(text);
        $(id).html(text);
        TranslatorAPI._update_height(id);
    }
};

var YouDaoTranslateAPI =
{

    /*-----------  Translate By YouDao API --------------*/
    translate: function (message)
    {
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
            success: function (result)
            {
                TranslatorAPI._show_api_logo("logoYouDao");
                if (result.errorCode == 0)
                {
                    YouDaoTranslateAPI._parse_yd_result(result);
                }
                else
                {
                    YouDaoTranslateAPI._handle_yd_error(result.errorCode);
                }

            }
        });

    },

    _handle_yd_error: function (errorCode)
    {
        var text = "Normal";
        var prefix = "YourDao";
        switch (errorCode)
        {
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
    },

    _parse_yd_result: function (result)
    {
        var type = "";
        LoggerAPI.logD(result.toString());

        //var data = JSON.parse(result);
        var data = result;
        if (data.errorCode == 0)
        {
            var single = "";
            var multiples = "";
            var sound = "";

            var hasBasic = (data.basic) ? true : false;
            if (hasBasic)
            {
                single = YouDaoTranslateAPI._combine_values(data.basic.explains, "." + NewLine);
                if (CommonAPI.isDefined(data.basic.phonetic))
                {
                    sound = "[" + data.basic.phonetic + "]  " + NewLine;
                }
            }
            else
            {
                single = YouDaoTranslateAPI._combine_values(data.translation);
            }

            // add Main pronounce
            AudioAPI.createTranslateAudio(PronounceAudios.Main, single);
            TranslatorAPI._update_main_meaning(sound + single);

            var hasWeb = (data.web) ? true : false;
            if (hasWeb)
            {
                var webs = data.web;
                for (var i = 0; i < webs.length; i++)
                {
                    var web = webs[i];
                    var key = web.key;
                    var value = YouDaoTranslateAPI._combine_values(web.value);
                    multiples += ((multiples == "") ? "" : NewLine) + key + ": " + value;
                }
            }
            else
            {
                multiples = single;
            }

            // add More pronounce
            AudioAPI.createTranslateAudio(PronounceAudios.More, multiples);
            TranslatorAPI._update_more_meaning(multiples);
        }
    },
    _combine_values: function (valuesArray, separator)
    {
        if (!CommonAPI.isValidText(separator)) { separator = ","; }
        var values = "";
        for (var i = 0; i < valuesArray.length; i++)
        {
            var value = valuesArray[i];
            if (values == "")
            {
                values += value.toString();
            }
            else
            {
                values += separator + value.toString();
            }
        }
        return values;
    }
    /*END*/
};

var GoogleTranslateAPI =
{
    /*-----------  Translate By Google API --------------*/
    translate: function (message)
    {
        return false;

        if (!CommonAPI.isValidText(message)) return false;

        var type = "G";
        TranslatorAPI._initial_texts(message, type);

        var text = CommonAPI.encodeText(message);
        var url = "http://translate.google.com.hk/translate_a/t?client=t&hl=en&sl=en&tl=zh-CN&ie=UTF-8&oe=UTF-8&multires=1&oc=2&otf=1&rom=1&ssel=4&tsel=4&pc=1&sc=1&q=" + text;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function ()
        {
            _show_api_logo("logoGoogle");
            if (xhr.readyState == 4)
            {
                // received json data
                // LoggerAPI.logD(xhr.responseText);

                // all meanings
                text = xhr.responseText;
                text = CommonAPI.removeDuplicated(text, ",");
                var meanings = text;
                $("#txtTranslatedAll" + type).html(meanings);

                // first meaning
                var data = JSON.parse(meanings);
                data = data[0][0][0];
                // LoggerAPI.logD(data);
                $("#txtTranslated" + type).val(data);
            }
            return true;
        };
        xhr.send();

        return true;
    },

    _parse_data: function (data)
    {
        var t = "";
        var l = 0;
        var values = "";
        t = typeof (data);
        l = (t == "object" && data.length > 0) ? (data.length) : (0);
        do
        {
            if (data.length > 0)
            {
                try
                {
                    values += _parse_data_item(data[data.length - l]) + ",";
                }
                catch (e)
                {
                    LoggerAPI.logW(e);
                }
                finally
                {
                }
            }
            l--;
        } while (l > 0);

        return values;
    },

    _parse_data_item: function (data)
    {
        var t = typeof (data);
        if (t && t == "string")
        {
            return data;
        }
        var values = "";
        var l = (t == "object" && data.length > 0) ? (data.length) : (0);
        do
        {
            if (data.length > 0)
            {
                try
                {
                    values += _parse_data_item(data[data.length - l]) + ",";
                }
                catch (e)
                {
                    LoggerAPI.logW(e);
                }
                finally
                {
                }
            }
            l--;
        } while (l > 0);

        return values;
    }
};

var BaiduTranslateAPI =
{
    /*-----------  Translate By BaiDu API --------------*/
    translate: function (message)
    {
        if (!CommonAPI.isValidText(message)) return false;

        var type = "B";
        TranslatorAPI._initial_texts(message, type);

        // TODO
    },
    /*END*/
};

var MicrosoftTranslateAPI = 
{
    /*-----------  Translate By YouDao API --------------*/
    translate: function (message)
    {
        if (!CommonAPI.isValidText(message)) return false;

        var type = "M";
        TranslatorAPI._initial_texts(message, type);

        // TODO
    }
    /*END*/
};