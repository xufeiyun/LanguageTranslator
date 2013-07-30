/*
	This javascript file is the defined translator features basedon google, baidu, youdao API etc.
*/
var prefix = "[TRANSLATORS]: ";

var translating = "Now translating......";

function translate(message)
{
    message = message.trim();
    
    if (!isValidText(message))
    {
        $("#" + PronounceAudios.Source.ButtonId).addClass("hide");
        $("#" + PronounceAudios.Main.ButtonId).addClass("hide");
        $("#" + PronounceAudios.More.ButtonId).addClass("hide");
    }

    // add Source pronounce
	createTranslateAudio(PronounceAudios.Source, message);

    translateByYoudao(message);
    translateByGoogle(message);
	translateByBaidu(message);
	translateByMicrosoft(message);
}

function createTranslateAudio(audioType, word)
{
    var divId = audioType.ContainerId,
        audioId = audioType.PlayerId,
        buttonId = audioType.ButtonId;

    var url = "http://tts.baidu.com/text2audio?lan=zh&amp;ie=UTF-8&amp;text=" + encodeURI(word);

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

function updateRows(id)
{
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
	return t = (isValidText(type)) ? type : "";
}

function clearTexts(type)
{
    if (!isValidText($("#txtSelected").val()))
    {
        $("#txtSelected").val("");
        $("#txtTranslated" + getValidSuffix(type)).val("");
        $("#txtTranslatedAll" + getValidSuffix(type)).html("");
    }
}

function initializeTexts(message, type)
{
    $("#txtSelected").val(message);
    $("#txtTranslated" + getValidSuffix(type)).val(translating);
    $("#txtTranslatedAll" + getValidSuffix(type)).html(translating);
}

/*-----------  Translate By Input Text --------------*/
function translateByInput()
{
    logD("Translating by input......");
    var text = $("#txtSelected").val();
    translate(text);
}
/*END*/

/*-----------  Translate By Clipboard Text --------------*/
function translateByClipboard()
{
    var text = window.Clipboard.paste();
    logD("Translating by clipboard text......");
    translate(text);
    return isValidText(text);
}
/*END*/

/*-----------  Translate By Google API --------------*/
function translateByGoogle(message)
{
    if (!isValidText(message)) return false;
	
	var type = "G";	
	initializeTexts(message, type);
    
	var text = encodeText(message);
	var url = "http://translate.google.com.hk/translate_a/t?client=t&hl=en&sl=en&tl=zh-CN&ie=UTF-8&oe=UTF-8&multires=1&oc=2&otf=1&rom=1&ssel=4&tsel=4&pc=1&sc=1&q=" + text;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
      showAPILogo("logoGoogle");
	  if (xhr.readyState == 4) {
		// received json data
		logD(xhr.responseText);
		
		// all meanings
		text = xhr.responseText;
		text = removeDuplicated(text, ",");
		var meanings = text;
		$("#txtTranslatedAll" + type).html(meanings);
		
		// first meaning
		var data = JSON.parse(meanings);
		data = data[0][0][0];
		logD(data);
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
				console.warn(e);
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
				console.warn(e);
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
    if (!isValidText(message)) return false;
	
	var type = "B";	
    initializeTexts(message, type);

	// TODO
}
/*END*/


/*-----------  Translate By YouDao API --------------*/
function translateByYoudao(message)
{
    if (!isValidText(message)) return false;

	var type = "";
    initializeTexts(message, type);

    var text = message;
    var url = "http://fanyi.youdao.com/openapi.do?keyfrom=SZJWCKJ&key=998983058&type=data&doctype=json&version=1.1";
    $.ajax({
        url: url,
        dataType : "json",
        type: "get",
        data: "q=" + encodeText(text),
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
    switch (errorCode)
    {
        case 20: 
            text = "Text is too long!"
            break;
        case 30:
            text = "Can't process invalid translation!"
            break;
        case 40: 
            text = "Unsupported languang type!"
            break;
        case 50:
            text = "Invalid Private API Key!"
            break;
        defaut:
            text = "Undefined ErrorCode: " + errorCode;
    }
    $("#txtTranslated").val(text);
    $("#txtTranslatedAll").html(" ");
}
function parseResultYoudao(result)
{
	var type = "";
    logD(result.toString());

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
            if (isDefined(data.basic.phonetic))
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

        $("#txtTranslated").val(sound + single);
        updateRows("#txtTranslated");

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

        $("#txtTranslatedAll").html(multiples);
        updateRows("#txtTranslatedAll");
    }
}
function combineValues(valuesArray, separator)
{
    if (!isValidText(separator)) {separator = ",";}
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
    if (!isValidText(message)) return false;
	
	var type = "M";	
    initializeTexts(message, type);

	// TODO
}
/*END*/

