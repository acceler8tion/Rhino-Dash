//connect
var Connect = require("../../../request/Request").Connection();

//error
var GDError = require("../../error/GDError").GDError;

//entities
var Indexes = require("../../entities/Index");

//logger
var Logger = require("../../../log/Logger").Logger;
var dir = require("../../../log/logs/setting").dir;

//utils
var GDUtils = require("../../utils/GDUtils");

function acceptfriend(r, accid, reqid) {

    if(accid === undefined) throw new GDError("Empty Account ID");
    if(reqid === undefined) throw new GDError("Empty Request ID");

    var body = {
        accountID : r.accountID,
        gjp : r.pass,
        targetAccountID : accid,
        requestID: reqid
    };

    return Connect.POST(GDUtils.URL(Indexes.URL_ACCEPT_REQUEST), {}, GDUtils.bodyParser(r, body), r.timeout, true, true, 
            (res, err) => {
                var logger = Logger.build(dir, "gdlogs");
                if(err !== null){
                    logger.write(Logger.ERROR, "An error has occured -> from 'GDAcceptFriendRequest.js'", err);
                    return null;
                } else if(res == "-1"){
                    logger.write(Logger.ERROR, "Received Code -1");
                    return -1;
                } else {
                    if(r.rawData) logger.write(Logger.DESCRIPTION, res, null);

                    return res == "1" ? "SUCCESS" : "FAILED";
                }
            }
    );
}

exports.acceptfriend = acceptfriend;