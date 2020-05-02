const Indexes = require("./gdindex");
const GDUtils = require("./gdutils");
const GDCrypto = GDUtils.GDCrypto();
const GDError = require("./gderror").GDError;
const Connect = require("./dfconnection").Connection();
const FileManager = require("./filemanager");
const Base64 = require("./webtoolkit/webtoolkit.base64").Base64;

exports.GDRequest = function(){
    function GDRequest(){
        this.body.gdw = 4;
        this.body.gameVersion = 21;
        this.body.binaryVersion = 35;
    }

    GDRequest.prototype.authicate = function(accid, nick, pass){

        /*
        @params

        (Number) accid : the AccountId
        (String) nick : the Nickname
        (String) pass : the Password
        */

        if(!accid || !pass) throw new TypeError("AccountID and password must not be empty");
    
        this.accountID = accid;
        this.nick = nick;
        this.pass = new GDCrypto(pass).encodeAccPass();
    }

    GDRequest.prototype.searchGDLevel = function(name, page, filter, field){

        if(name == undefined) throw new TypeError("Empty level name");
        filter = GDUtils.emptyTo(filter, {});

        var body = {
            levelID: name,
            page: GDUtils.emptyTo(page, 0),
            type: GDUtils.emptyTo(field, Indexes.STRATEGY_REGULAR),
            uncompleted: GDUtils.emptyTo(filter.uncompleted, 0),
            onlyCompleted: GDUtils.emptyTo(filter.onlyCompleted, 0),
            featured: GDUtils.emptyTo(filter.featured, 0),
            original: GDUtils.emptyTo(filter.original, 0),
            twoPlayer: GDUtils.emptyTo(filter.twoPlayer, 0),
            coins: GDUtils.emptyTo(filter.coins, 0),
            epic: GDUtils.emptyTo(filter.epic, 0),
            star: GDUtils.emptyTo(filter.star, 0)
        }

        if(this.pass){
            body.accountID = this.accountID;
            body.gjp = this.pass;
            body.extra = 1;
        }
        
        return Connect.POST(GDUtils.URL(Indexes.URL_LEVEL_SEARCH), {}, GDUtils.bodyParser(body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    res = res.split("#");
                    data = {
                        levels: res[0].split("|").map(v => GDUtils.convertTable(v, ":")),
                        creators: res[1].split("|").map(v => GDUtils.Tuple3.apply(null, v.split(":"))),
                        songs: res[2].split(":").map(v => v == "" ? null : GDUtils.convertTable(v, "~|~")),
                        page: GDUtils.Tuple3.apply(res[3].split(":"))
                    }
                }
            });    
    }

    GDRequest.prototype.findGDLevel = function(){
        if(!this.body.levelid) throw new GDError("levelid must not be empty");
        this.editParams(
            GDUtils.Tuple3("levelid", GDRequest.param("levelid"), null)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_DOWNLOAD_LEVEL), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    data = GDUtils.convertTable(res, ":");
                }
            });
        return data;
    }

    GDRequest.prototype.searchGDUser = function(){
        this.editParams(
            GDUtils.Tuple3("name", GDRequest.param("name"), v => encodeURI(GDUtils.emptyTo(v, "")))
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_USER_SEARCH), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    res = res.split("#");
                    data = {
                        users: res[0].split("|").map(v => GDUtils.convertTable(v, ":")),
                        page: GDUtils.Tuple3.apply(null, res[1].split(":"))
                    };
                }
            });
        return data;
    }

    GDRequest.prototype.findGDUser = function(){
        if(!this.body.player) throw new GDError("player must not be empty");
        this.editParams(
            GDUtils.Tuple3("player", GDRequest.param("player"), null)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_GET_USER_INFO), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    data = GDUtils.convertTable(res, ":");
                }
            });
        return data;
    }

    GDRequest.prototype.getTimelyLevel = function(){
        if(!this.body.type) throw new GDError("type must be (string) \"DAILY\" or \"WEEKLY\"");
        this.editParams(
            GDUtils.Tuple3("type", GDRequest.param("levelid"), v => v == "DAILY" ? -1 : -2)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_DOWNLOAD_LEVEL), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    data = GDUtils.convertTable(res, ":");
                }
            });
        return data;
    }

    GDRequest.prototype.getlevelComments = function(){
        if(!this.body.levelid) throw new GDError("levelid must not be empty");
        this.editParams(
            GDUtils.Tuple3("levelid", GDRequest.param("levelid"), null),
            GDUtils.Tuple3("page", "page", v => GDUtils.emptyTo(v, 0)),
            GDUtils.Tuple3("top", "top", v => GDUtils.emptyTo(v, 0))
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_LEVEL_COMMENT), {}, this.body, this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    res = res.split("|").map(v => v.split(":"));
                    data = res.map(v => {
                        return {
                            record: GDUtils.convertTable(v[0], "~"),
                            user: GDUtils.convertTable(v[1], "~")
                        }
                    });
                }
            });
        return data;
    }

    GDRequest.prototype.postLevelComment = function(){
        if(!this.body.accpass) throw new GDError("accpass must not be empty");
        if(!this.body.accid) throw new GDError("accid must not be empty");
        if(!this.body.levelid) throw new GDError("levelid must not be empty");
        if(!this.body.comment) throw new GDError("comment must not be empty");
        if(!this.body.username) throw new GDError("username must not be empty");
        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("levelid", GDRequest.param("levelid"), null),
            GDUtils.Tuple3("comment", "comment", v => Base64.encode(v)),
            GDUtils.Tuple3("username", GDRequest.param("username"), null),
            GDUtils.Tuple3("percent", "percent", v => GDUtils.emptyTo(v, 0))
        );
        var args = [this.body.userName, this.body.comment, this.body.levelID, this.body.percent, 0];
        var chk = GDCrypto.makeChk(args, GDCrypto.comment);
        this.addParams(
            GDUtils.Tuple2("chk", chk)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_UPLOAD_COMMENT), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    data = res;
                }
            });
        return data;
    }

    GDRequest.prototype.levelRanking = function(){
        if(!this.body.levelid) throw new GDError("levelid must not be empty");
        this.editParams(
            GDUtils.Tuple3("type", "type", v => GDUtils.emptyTo(v, 1)), //TOP(1) WEEK(2)
            GDUtils.Tuple3("levelid", GDRequest.param("levelid"), null)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_LEVEL_SCORE), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    res = res.split("|");
                    data = res.map(v => GDUtils.convertTable(v, ":"));
                }
            });
        return data;
    }

    GDRequest.prototype.songInfo = function(){
        if(!this.body.songid) throw new GDError("songid must not be empty");
        this.editParams(
            GDUtils.Tuple3("songid", GDRequest.param("songid"), null)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_GET_SONG_INFO), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    data = GDUtils.convertTable(res, "~|~");
                }
            });
        return data;
    }

    GDRequest.prototype.getLeaderboard = function(){
        this.editParams(
            GDUtils.Tuple3("type", "type", v => GDUtils.emptyTo(v, 0)),
            GDUtils.Tuple3("count", "count", v => GDUtils.emptyTo(v, 100))
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_USER_SCORE), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else if(res == "-1"){
                    data = -1;
                } else {
                    res = res.split("|").splice(0, this.body.count);
                    data = res.map(v => GDUtils.convertTable(v, ":"));
                }
            });
        return data;
    }

    GDRequest.prototype.sendMessage = function(){
        if(!this.body.accpass) throw new GDError("accpass must not be empty");
        if(!this.body.accid) throw new GDError("accid must not be empty");
        if(!this.body.toaccid) throw new GDError("toaccid must not be empty");
        if(!this.body.subject) throw new GDError("subject must not be empty");
        if(!this.body.content) throw new GDError("content must not be empty");
        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("toaccid", GDRequest.param("toaccid"), null),
            GDUtils.Tuple3("subject", "subject", v => Base64.encode(v)),
            GDUtils.Tuple3("content", GDRequest.param("content"), v => new GDCrypto(v).encodeMsgBody()),
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_SEND_PRIVATE_MESSAGE), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    data = res == "-1" ? -1 : 1;
                }
            });
        return data;
    }

    GDRequest.prototype.getMessages = function(){
        if(!this.body.accpass) throw new GDError("accpass must not be empty");
        if(!this.body.accid) throw new GDError("accid must not be empty");
        if(!this.body.type) throw new GDError("type must be (string) \"INBOX\" or \"SENT\"");
        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("type", "getSent", v => v == "INBOX" ? 0 : 1),
            GDUtils.Tuple3("page", "page", v => GDUtils.emptyTo(v, 0))
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_GET_PRIVATE_MESSAGES), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    res = res.split("|");
                    data = res.map(v => GDUtils.convertTable(v, ":"));
                }
            });
        return data;
    }

    GDRequest.prototype.openMessage = function(){
        if(!this.body.accpass) throw new GDError("accpass must not be empty");
        if(!this.body.accid) throw new GDError("accid must not be empty");
        if(!this.body.msgid) throw new GDError("msgid must not be empty");
        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("msgid", GDRequest.param("msgid"), null)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_READ_PRIVATE_MESSAGES), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    data = GDUtils.convertTable(res, ":");
                }
            });
        return data;
    }

    GDRequest.prototype.getProfileComment = function(){
        //later...
    }

    GDRequest.prototype.postProfileComment = function(){
        if(!this.body.accpass) throw new GDError("accpass must not be empty");
        if(!this.body.accid) throw new GDError("accid must not be empty");
        if(!this.body.comment) throw new GDError("comment must not be empty");
        if(!this.body.username) throw new GDError("username must not be empty");
        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("comment", "comment", v => Base64.encode(v)),
            GDUtils.Tuple3("username", GDRequest.param("username"), null)
        );
        var args = [this.body.userName, this.body.comment, 0, 0, 1];
        var chk = GDCrypto.makeChk(args, GDCrypto.comment);
        this.addParams(
            GDUtils.Tuple2("chk", chk),
            GDUtils.Tuple2("cType", 1)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_UPLOAD_ACC_COMMENT), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    data = res;
                }
            });
        return data;
    }

    GDRequest.prototype.likeLevel = function(){
        if(!this.body.accpass) throw new GDError("accpass must not be empty");
        if(!this.body.accid) throw new GDError("accid must not be empty");
        if(!this.body.levelid) throw new GDError("levelid must not be empty");

        var rs = GDCrypto.makeRs();
        var args = [0, this.body.levelid, this.body.like, 1, rs, this.body.accid, 0, 0];
        var chk = GDCrypto.makeChk(args, GDCrypto.like_rate);

        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("levelid", "itemID", null),
            GDUtils.Tuple3("like", "like", v => GDUtils.emptyTo(v, 1))
        );
        this.addParams(
            GDUtils.Tuple2("uuid", GDCrypto.makeUuid()),
            GDUtils.Tuple2("udid", GDCrypto.makeUdid()),
            GDUtils.Tuple2("rs", rs),
            GDUtils.Tuple2("chk", chk),
            GDUtils.Tuple2("type", 1),
            GDUtils.Tuple2("special", 0)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_LIKE_ITEM), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    data = res;
                }
            });
        return data;
    }

    GDRequest.prototype.rateDifficulty = function(){
        if(!this.body.gjp) throw new GDError("gjp must not be empty");
        if(!this.body.accountID) throw new GDError("accountID must not be empty");
        if(!this.body.levelID) throw new GDError("levelID must not be empty");
        if(!this.body.star || (this.body.star < 1 || this.body.star > 10 || !Number.isSafeInteger(this.body.star))) throw new GDError("star must be (int) 1 to 10");

        var rs = GDCrypto.makeRs();
        var args = [this.body.levelID, this.body.stars, rs, this.body.accountID, 0, 0];
        var chk = GDCrypto.makeChk(args, GDCrypto.like_rate);

        this.editParams(
            GDUtils.Tuple3("accpass", GDRequest.param("accpass"), v => new GDCrypto(v).encodeAccPass()),
            GDUtils.Tuple3("accid", GDRequest.param("accid"), null),
            GDUtils.Tuple3("levelid", GDRequest.param("levelid"), null),
            GDUtils.Tuple3("star", "stars", null)
        );
        this.addParams(
            GDUtils.Tuple2("uuid", GDCrypto.makeUuid()),
            GDUtils.Tuple2("udid", GDCrypto.makeUdid()),
            GDUtils.Tuple2("rs", rs),
            GDUtils.Tuple2("chk", chk)
        );
        var data;

        Connect.POST(GDUtils.URL(Indexes.URL_RATE_LEVEL_STARS), {}, GDUtils.bodyParser(this.body), this.timeout, {}, true, true,
            (res, err) => {
                if(err !== null){
                    FileManager.concatJSON("/sdcard/GDBot/errors/LOGS", err);
                } else {
                    data = res;
                }
            });
        return data;
    }

    return GDRequest;
}