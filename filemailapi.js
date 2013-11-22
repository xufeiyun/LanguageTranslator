
/*-------

init:
https://www.filemail.com/api/transfer/initialize?apikey=5e10cf38-2152-4704-914d-39c1119f2135&from=190170412@qq.com&to=vanillapeter@163.com&subject=[FEEDBACK%20FROM]%20-%20xufeiyun&message=suggestions&days=1

{
  "transferid": "xuvslcfxgjcrqvi",
  "transferkey": "877b16914f5d4c4fbb15f4118daeb75f",
  "transferurl": "https://sl13.filemail.com/savefile.ashx",
  "responsestatus": "OK"
}

file:

https://sl13.filemail.com/savefile.ashx?transferid=xuvslcfxgjcrqvi&transferkey=877b16914f5d4c4fbb15f4118daeb75f&fileid=F877b16914f5d4c4fbb15f4118daeb75F

send:
https://www.filemail.com/api/transfer/complete?apikey=5e10cf38-2152-4704-914d-39c1119f2135&transferid=xuvslcfxgjcrqvi&transferkey=877b16914f5d4c4fbb15f4118daeb75f

{
  "responsestatus": "InvalidParameter",
  "errorcode": 1002,
  "errormessage": "No files added to transfer",
  "method": "/api/transfer/complete"
}

--------*/

/**
	This javascript file is to send email by API on www.filemail.com:
    http://www.filemail.com/api/doc/Authentication.aspx
*/



var MailAPI =
{
    Type:
    {
        InitEmail: "init",
        AddFile: "file",
        SendEmail: "send",
        Complete: "over"
    },

    Configs: {
        InitUrl: "https://www.filemail.com/api/transfer/initialize",
        SendUrl: "https://www.filemail.com/api/transfer/complete",
        APIKey: "5e10cf38-2152-4704-914d-39c1119f2135",
        ToUser: "vanillapeter@163.com",
        FileId: "",
        MimeType: "multipart/form-data",
        TransferId: "",
        TransferKey: "",
        Boundary: "------WebKitFormBoundary"
        //Boundary: "------WebKitFormBoundary34F8A5DF236B477E8E7E3FC9527A66F7"
    },

    Callbacks:
    {
        Success: null,
        Failure: null
    },

    Send: function (name, fromemail, content, fnSuccess, fnFailure) {
        // prepare to send at first
        if (!isValidText(name)) name = "[USER N/A]";
        if (!isValidText(fromemail)) fromemail = "[USER'S EMAIL N/A]";

        MailAPI.Callbacks.Success = fnSuccess;
        MailAPI.Callbacks.Failure = fnFailure;

        var apiurl = MailAPI.Configs.InitUrl
                    + "?apikey=" + (MailAPI.Configs.APIKey)
                    + "&from=" + (fromemail)
                    + "&to=" + MailAPI.Configs.ToUser
                    + "&subject=" + ("[FEEDBACK FROM] - " + name)
                    + "&message=" + (encodeURI(content))
                    + "&confirmation=False"
                    + "&days=1"
                    + "";
        MailAPI.get(apiurl, MailAPI.Type.AddFile);
    },

    AddFile: function (transferId, transferKey, transferUrl) {
        MailAPI.Configs.TransferId = transferId;
        MailAPI.Configs.TransferKey = transferKey;

        var newId = MailAPI.guid().replace(/-/g, '');
        // add ONE file at least
        var apiurl = transferUrl
                    + "?apikey=" + (MailAPI.Configs.APIKey)
                    + "&transferid=" + (transferId)
                    + "&transferkey=" + (transferKey)
                    + "&thefilename=" + ("test.txt")
                    + "&totalsize=" + ("18")
                    + "&fileid=" + (MailAPI.Configs.FileId + newId)
                    + "";
        // construct the entity body
        var postDataEntity =
                MailAPI.Configs.Boundary + newId + NewLine +
                "Content-Disposition: form-data; name=\"file\"; filename=\"test.txt\"" + NewLine +
                "Content-Type: text/plain" + NewLine +
                "" + NewLine +
                "JUST A TEST FILE!" + NewLine +
                "" + NewLine +
                MailAPI.Configs.Boundary + newId + NewLine;
        postDataEntity = "!JUST A TEST FILE!";

        MailAPI.post(apiurl, newId, postDataEntity, MailAPI.Type.SendEmail);
    },

    Complete: function (transferId, transferKey) {
        // send email to receiver at last
        var apiurl = MailAPI.Configs.SendUrl
                    + "?apikey=" + (MailAPI.Configs.APIKey)
                    + "&transferid=" + (transferId)
                    + "&transferkey=" + (transferKey)
                    + "";
        MailAPI.get(apiurl, MailAPI.Type.Complete);
    },

    get: function (apiUrl, nextType) {
        logD(apiUrl);
        $.ajax({
            url: apiUrl,
            type: "get",
            async: true,
            success: function (r) {
                MailAPI.Result(r, nextType);
            },
            error: function (e) {
                MailAPI.Result(e, nextType);
            }
        });
    },
    post: function (apiUrl, newId, postData, nextType) {
        logD(apiUrl);
        $.ajax({
            url: apiUrl,
            type: "post",
            async: true,
            mimeType: MailAPI.Configs.MimeType,
            contentType: MailAPI.Configs.MimeType + "; boundary=" + MailAPI.Configs.Boundary + newId,
            data: postData,
            success: function (r) {
                MailAPI.Result(r, nextType);
            },
            error: function (e) {
                MailAPI.Result(e, nextType);
            }
        });
    },

    guid: function () {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16).toUpperCase();
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
                guid += "-";
            }
        }
        return guid;
    },

    Result: function (apiResult, type) {
        /*
        returned JSON-formatted data:
        {
        "transferid": "YSEVQIGGNLJFVFP",
        "transferkey": "62612b1d95794a87a87e0d6cd4f65a0e",
        "transferurl": "http://sl21.filemail.com/api/file/add",
        "responsestatus": "ok"
        }
        */
        // var result = JSON.parse(apiResult.responseText);
        try {
            var result = (apiResult.responseJSON) ? apiResult.responseJSON : apiResult;
            var status = result.responsestatus;
            if (status == "ok" || status == "OK" || (result.match && result.match(/[okOK]/) != null)) {
                if (type == MailAPI.Type.InitEmail) {
                    // nothing to do
                }
                else if (type == MailAPI.Type.AddFile) {
                    MailAPI.AddFile(result.transferid, result.transferkey, result.transferurl);
                }
                else if (type == MailAPI.Type.SendEmail) {
                    // send to recievers
                    MailAPI.Complete(MailAPI.Configs.TransferId, MailAPI.Configs.TransferKey);
                }
                else if (type == MailAPI.Type.Complete) {
                    logD(result.downloadurl);
                    if (MailAPI.Callbacks.Success) { MailAPI.Callbacks.Success("Thanks a lot for your feedback. Feedback sent successfully."); }
                }
            }
            else {
                var code = result.errorcode;
                if (MailAPI.Callbacks.Failure) { MailAPI.Callbacks.Failure("[#" + code + ": " + status + "] " + result.errormessage); }
            }
        }
        catch (e) {
            msg = e.Message;
            logE(msg);
            if (MailAPI.Callbacks.Failure) { MailAPI.Callbacks.Failure(msg); }
        }
    }
};
