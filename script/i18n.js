
/**
	This javascript file is to set the localizations.
**/

var i18n =
{
    SetLocalization: function ()
    {
        var locale = (i18n.getMessage("@@ui_locale"));
        //if (locale.match(/^en/) != null) { return false; }

        // title
        i18n.SetText("btnTitle", "ExtesionTitle");
        i18n.SetTitle("divNavTitle", "ExtesionTitleTooltip");

        i18n.SetText("btnSourceText", "SourceTexts");
        i18n.SetTitle("btnSourceText", "SourceTextsTooltip");
        i18n.SetTitle("btnReadSource", "SourceSoundTooltip");

        i18n.SetText("btnTranslate", "TranslateButton");
        i18n.SetTitle("btnTranslate", "TranslateButtonTooltip");

        i18n.SetText("btnMainText", "MainMeanings");
        i18n.SetTitle("btnReadMain", "MainSoundTooltip");

        i18n.SetText("btnMoreText", "MoreMeanings");
        i18n.SetTitle("btnReadMore", "MoreSoundTooltip");

        i18n.SetText("btnDataProvider", "DataProvided");
        i18n.SetText("btnYouDaoAPI", "YouDataTranslation");
        i18n.SetTitle("btnYouDaoAPI", "YouDataTranslationTooltip");

        i18n.SetText("btnFeatures", "FeatureText");
        i18n.SetTitle("btnFeatures", "FeatureTitle");

        i18n.SetText("btnOptions", "OptionText");
        i18n.SetTitle("btnOptions", "OptionTitle");

        i18n.SetText("btnOperations", "OperationText");
        i18n.SetTitle("btnOperations", "OperationTitle");

        i18n.SetText("btnDonations", "DonateText");
        i18n.SetTitle("btnDonations", "DonateTitle");

        i18n.SetText("btnAbout", "AboutText");
        i18n.SetTitle("btnAbout", "AboutTitle");

        return true;
    },

    SetText: function (element_id, message_name)
    {
        var value = i18n.getMessage(message_name);
        logW("i18n value: " + value);
        var element = $("#" + element_id);
        if (element.length > 0)
        {
            if (element[0].tagName == "INPUT")
            {
                element[0].value = value;
            } else
            {
                element[0].innerText = value;
            }
        }
    },

    SetTitle: function (element_id, message_name)
    {
        var value = i18n.getMessage(message_name);
        logW("i18n value: " + value);
        var element = $("#" + element_id);
        if (element.length > 0)
        {
            element[0].title = value;
        }
    },

    PrintLocale: function ()
    {
        var locale = (chrome.i18n.getMessage("@@ui_locale"));
        console.warn("Current Locale: " + locale);
        
        chrome.i18n.getAcceptLanguages(function (languageList)
        {
            var languages = languageList.join(",");
            console.warn("Configured Languages: " + languages);
        });

    },

    getMessage: function (message_name)
    {
        return chrome.i18n.getMessage(message_name);
    }

};
