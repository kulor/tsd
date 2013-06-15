var tsd = require("..\\deploy\\main.js");

var config = {
    "version": "v2",
    "typingsPath": "typings",
    "libPath": "lib",
    "repo": {
        "uriList": [{
                "sourceType": "1",
                "source": "http://www.tsdpm.com/repository_v2.json"
            }
        ]
    }
};

tsd.load(config, function (tsd, er) {
    if (er) {
        console.log("error trying initialize api");
        return;
    }

    tsd.commands.install(["backbone", "express", "node"], function (er, data) {
        if (er) {
            console.log("install error");
            return;
        }
        console.log("command succeeded!");
    });

    tsd.on('log', function (message) {
        console.log('# [api log] : ' + message);
    });
});