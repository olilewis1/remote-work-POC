"use strict";
var sessionType;
(function (sessionType) {
    sessionType[sessionType["ONLINE"] = 0] = "ONLINE";
    sessionType[sessionType["OFFLINE"] = 1] = "OFFLINE";
})(sessionType || (sessionType = {}));
var participant;
(function (participant) {
    participant[participant["PARTNER"] = 0] = "PARTNER";
    participant[participant["CUSTOMER"] = 1] = "CUSTOMER";
    participant[participant["SUPPORTING_PARTNER"] = 2] = "SUPPORTING_PARTNER";
})(participant || (participant = {}));
