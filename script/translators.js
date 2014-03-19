/*
	This javascript file is the defined translator features basedon google, baidu, youdao API etc.
*/
var prefix = "[TRANSLATORS]: ";

var translating = i18n.getMessage("Translating");
var emptytext = "";

function translate(message)
{
    LoggerAPI.logD("TRANSLATE...");
    if (typeof(message) == "undefined") return false;
    
    message = $.trim(message);

    if (!CommonAPI.isValidText(message))
    {
        var classHide = "hide";
        $("#" + PronounceAudios.Source.ButtonId).addClass(classHide);
        $("#" + PronounceAudios.Main.ButtonId).addClass(classHide);
        $("#" + PronounceAudios.More.ButtonId).addClass(classHide);
    }

    // add Source pronounce
    if (typeof(createTranslateAudio) != undefined) {
       createTranslateAudio(PronounceAudios.Source, message);
    }
    //LoggerAPI.logD(AjaxAPI.getFileContentsSync('https://dl.yunio.com/pub/0LpA2l?name=webpage_popup.txt'));

    translateByYoudao(message);
    translateByGoogle(message);
    translateByBaidu(message);
    translateByMicrosoft(message);
}

function createTranslateAudio(audioType, word)
{
    if (OptionItemValues.EnablePronunciation == false)
    {
        LoggerAPI.logD("Pronunciation Feature has been disabled, it may be in DEBUG mode.");
        //return;
    }

    var divId = audioType.ContainerId,
        audioId = audioType.PlayerId,
        buttonId = audioType.ButtonId;

    var isChineseWord = CommonAPI.isChinese(word);
    LoggerAPI.logW("Is Chinese Word: " + isChineseWord);
    var url = "http://tts.baidu.com/text2audio?lan=" + (isChineseWord ? "zh" : "en") +"&amp;ie=UTF-8&amp;text=" + encodeURI(word);

    // creat audio element
    var htmlAudio = "<audio buttonid='" + buttonId +  "' controls='controls' preload='preload' src='" + url + "' id='" + audioId + "'></audio>";
    var div = "#" + divId;
    $(div).html("");
    $(div).html(htmlAudio);

    var hideButton = function (e) {
        // hide button element or not after loaded data
        var button = $("#" + e.target.getAttribute("buttonid"));
        if (e.target.networkState == 3 || e.target.readyState == 0) {
            button.addClass("hide");
        }
        else {
            button.removeClass("hide");
        }
    };

    var audio = $("#" + audioId)[0];
    audio.addEventListener("loadeddata", hideButton);
    audio.addEventListener("error", hideButton);
}

function showAPILogo(id) {
	$("#" + id).removeClass("hidden");
}

function updateHeight(id)
{
    if (typeof(isIFramePopup) != "undefined") return;

    var attribute = "height";

    $(id).css(attribute, emptytext);    // restore height

    updateRows(id);

    $(id).css(attribute, $(id)[0].scrollHeight);    // set height
}

function updateRows(id)
{
    return true;
    var rows = $(id).val().split("\n").length;
    var count = $(id).val().length / OneLineCharCount;
    if (rows < 2)
    {
        rows = count;
    }
    $(id).attr("rows", rows);
}

function getValidSuffix(type)
{
	return t = (CommonAPI.isValidText(type)) ? type : "";
}

function clearTexts(type)
{
    LoggerAPI.logD("Clear Text...");
    var text = $("#txtSelected").val();
    if (!CommonAPI.isValidText(text))
    {
        updateSourceText(emptytext);
        updateMainMeaning(emptytext, type);
        updateMoreMeaning(emptytext, type);
    }
    else 
    {
        updateHeight("#txtSelected");
    }
}

function initializeTexts(message, type)
{
    updateSourceText(message);

    updateMainMeaning(translating, type);
    
    updateMoreMeaning(translating, type);
}

function updateSourceText(text)
{
    LoggerAPI.logD('update source text');
    var id = "#txtSelected";
    $(id).val(text);
    updateHeight(id);
    if (text != emptytext)
    {
        $(id).blur();
    }
}

function updateMainMeaning(text, type)
{
    var id = "#txtTranslated" + getValidSuffix(type);
    $(id).val(text);
    updateHeight(id);
}

function updateMoreMeaning(text, type)
{
    var id = "#txtTranslatedAll" + getValidSuffix(type);
    $(id).val(text);
    $(id).html(text);
    updateHeight(id);
}

/*-----------  Translate By Input Text --------------*/
function translateByInput()
{
    LoggerAPI.logD("Translating by input......");
    var text = $("#txtSelected").val();
    translate(text);
}
/*END*/

/*-----------  Translate By Clipboard Text --------------*/
function translateByClipboard()
{
    var text = window.Clipboard.paste();
    LoggerAPI.logD("Translating by clipboard text......");
    translate(text);
    return CommonAPI.isValidText(text);
}
/*END*/

/*-----------  Translate By Google API --------------*/
function translateByGoogle(message)
{
    return false;

    if (!CommonAPI.isValidText(message)) return false;
	
	var type = "G";	
	initializeTexts(message, type);
    
	var text = CommonAPI.encodeText(message);
	var url = "http://translate.google.com.hk/translate_a/t?client=t&hl=en&sl=en&tl=zh-CN&ie=UTF-8&oe=UTF-8&multires=1&oc=2&otf=1&rom=1&ssel=4&tsel=4&pc=1&sc=1&q=" + text;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
      showAPILogo("logoGoogle");
	  if (xhr.readyState == 4) {
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
		$("#txtTranslated"  + type).val(data);
	  }
	  return true;
	};
	xhr.send();
	
	return true;
}
function parseData(data)
{
	var t = "";
	var l = 0;
	var values = "";
	t = typeof(data);
	l = (t == "object" && data.length > 0) ? (data.length) : (0);
	do 
	{
		if (data.length > 0) {
			try {
				values += parseEachData(data[data.length - l]) + ",";
			}
			catch (e) {
				LoggerAPI.logW(e);
			}
			finally {
			}
		}
		l--;
	} while (l > 0);
	
	return values;
}
function parseEachData(data)
{
	var t = typeof(data);
	if (t && t == "string")
	{
		return data;
	}
	var values = "";
	var l = (t == "object" && data.length > 0) ? (data.length) : (0);
	do 
	{
		if (data.length > 0) {
			try {
				values += parseEachData(data[data.length - l]) + ",";
			}
			catch (e) {
				LoggerAPI.logW(e);
			}
			finally {
			}
		}
		l--;
	} while (l > 0);
	
	return values;
}
/*END*/


/*-----------  Translate By BaiDu API --------------*/
function translateByBaidu(message)
{
    if (!CommonAPI.isValidText(message)) return false;
	
	var type = "B";	
    initializeTexts(message, type);

	// TODO
}
/*END*/


/*-----------  Translate By YouDao API --------------*/
function translateByYoudao(message)
{
    if (!CommonAPI.isValidText(message)) return false;

	var type = "";
    initializeTexts(message, type);

    var text = message;
    var url = "http://fanyi.youdao.com/openapi.do?keyfrom=SZJWCKJ&key=998983058&type=data&doctype=json&version=1.1";
    $.ajax({
        url: url,
        dataType : "json",
        type: "get",
        data: "q=" + CommonAPI.encodeText(text),
        success: function(result)
        {
            showAPILogo("logoYouDao");
            if (result.errorCode == 0) 
            {
                parseResultYoudao(result);
            }
            else
            {
                handleErrorYouDao(result.errorCode);
            }
            
        }
    });

}
function handleErrorYouDao(errorCode)
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
    updateMainMeaning(text);
    updateMoreMeaning(" ");
}
function parseResultYoudao(result)
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
            single = combineValues(data.basic.explains, "." + NewLine);
            if (CommonAPI.isDefined(data.basic.phonetic))
            {
                sound = "[" + data.basic.phonetic + "]  " + NewLine;
            }
        }
        else
        {
            single = combineValues(data.translation);
        }

        // add Main pronounce
        createTranslateAudio(PronounceAudios.Main, single);
        updateMainMeaning(sound + single);

        var hasWeb = (data.web) ? true : false;
        if (hasWeb)
        {
            var webs = data.web;
            for (var i = 0; i < webs.length; i++) {
                var web = webs[i];
                var key = web.key;
                var value = combineValues(web.value);
                multiples += ((multiples == "") ? "" : NewLine) + key + ": " + value;
            }
        }
        else
        {
            multiples = single;
        }

        // add More pronounce
        createTranslateAudio(PronounceAudios.More, multiples);        
        updateMoreMeaning(multiples);
    }
}
function combineValues(valuesArray, separator)
{
    if (!CommonAPI.isValidText(separator)) {separator = ",";}
    var values = "";
    for (var i = 0; i < valuesArray.length; i++) {
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

/*-----------  Translate By YouDao API --------------*/
function translateByMicrosoft(message)
{
    if (!CommonAPI.isValidText(message)) return false;
	
	var type = "M";	
    initializeTexts(message, type);

	// TODO
}
/*END*/

