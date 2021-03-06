var System;
(function (System) {
    var Environment = (function () {
        function Environment() { }
        Environment.isNode = function isNode() {
            return !(typeof ActiveXObject === "function");
        };
        Environment.isWsh = function isWsh() {
            return !Environment.isNode();
        };
        return Environment;
    })();
    System.Environment = Environment;    
})(System || (System = {}));
var System;
(function (System) {
    })(System || (System = {}));
var System;
(function (System) {
    (function (IO) {
        var StreamWriter = (function () {
            function StreamWriter() {
                this.autoFlush = true;
            }
            StreamWriter.prototype.flush = function () {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.flushAsync = function (callback) {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.write = function (value) {
                if(!this._buffer) {
                    this._buffer = '';
                }
                this._buffer += value;
                if(this.autoFlush) {
                    this.flush();
                    this._buffer = null;
                }
            };
            StreamWriter.prototype.writeLine = function (value) {
                this.write(value + '\n');
            };
            StreamWriter.prototype.writeAsync = function (value, callback) {
                var _this = this;
                if(!this._buffer) {
                    this._buffer = '';
                }
                this._buffer += value;
                if(this.autoFlush) {
                    this.flushAsync(function () {
                        _this._buffer = null;
                        callback();
                    });
                }
            };
            StreamWriter.prototype.writeLineAsync = function (value, callback) {
                this.writeAsync(value + '\n', callback);
            };
            StreamWriter.prototype.dispose = function () {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.close = function () {
                throw new Error("Not Implemented Exception");
            };
            return StreamWriter;
        })();
        IO.StreamWriter = StreamWriter;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;
})(System || (System = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NodeJs;
(function (NodeJs) {
    var ConsoleWriter = (function (_super) {
        __extends(ConsoleWriter, _super);
        function ConsoleWriter() {
            _super.apply(this, arguments);

        }
        ConsoleWriter.prototype.flush = function () {
            process.stdout.write(this._buffer);
        };
        ConsoleWriter.prototype.flushAsync = function (callback) {
            this.flush();
            callback();
        };
        ConsoleWriter.prototype.dispose = function () {
            throw new Error("Not Implemented Exception");
        };
        return ConsoleWriter;
    })(System.IO.StreamWriter);
    NodeJs.ConsoleWriter = ConsoleWriter;    
})(NodeJs || (NodeJs = {}));
var System;
(function (System) {
    var Console = (function () {
        function Console() { }
        Console.out = new NodeJs.ConsoleWriter();
        Console.initialize = function initialize(proxy) {
            if(proxy) {
                Console.out = proxy;
            }
        };
        Console.write = function write(value) {
            Console.out.write(value);
        };
        Console.writeLine = function writeLine(value) {
            Console.out.writeLine(value);
        };
        Console.writeAsync = function writeAsync(value, callback) {
            Console.out.writeAsync(value, callback);
        };
        Console.writeLineAsync = function writeLineAsync(value, callback) {
            Console.out.writeLineAsync(value, callback);
        };
        return Console;
    })();
    System.Console = Console;    
})(System || (System = {}));
var System;
(function (System) {
    })(System || (System = {}));
var NodeJs;
(function (NodeJs) {
    var FileStreamWriter = (function (_super) {
        __extends(FileStreamWriter, _super);
        function FileStreamWriter(path) {
                _super.call(this);
            this.path = path;
            this._fs = require('fs');
            this.autoFlush = false;
        }
        FileStreamWriter.prototype.flush = function () {
            this._fs.appendFileSync(this.path, this._buffer);
        };
        FileStreamWriter.prototype.flushAsync = function (callback) {
            this._fs.writeFile(this.path, this._buffer, function (err) {
                if(err) {
                    throw err;
                }
                callback();
            });
        };
        FileStreamWriter.prototype.close = function () {
        };
        return FileStreamWriter;
    })(System.IO.StreamWriter);    
    var FileHandle = (function () {
        function FileHandle() {
            this._fs = require('fs');
        }
        FileHandle.prototype.readFile = function (file) {
            var buffer = this._fs.readFileSync(file);
            switch(buffer[0]) {
                case 0xFE:
                    if(buffer[1] == 0xFF) {
                        var i = 0;
                        while((i + 1) < buffer.length) {
                            var temp = buffer[i];
                            buffer[i] = buffer[i + 1];
                            buffer[i + 1] = temp;
                            i += 2;
                        }
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xFF:
                    if(buffer[1] == 0xFE) {
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xEF:
                    if(buffer[1] == 0xBB) {
                        return buffer.toString("utf8", 3);
                    }
            }
            return buffer.toString();
        };
        FileHandle.prototype.createFile = function (path) {
            this._fs.writeFileSync(path, '');
            return new FileStreamWriter(path);
        };
        FileHandle.prototype.writeFile = function (path, content) {
            var sw = this.createFile(path);
            sw.write(content);
            sw.flush();
            sw.close();
        };
        FileHandle.prototype.deleteFile = function (path) {
            try  {
                this._fs.unlinkSync(path);
            } catch (e) {
            }
        };
        FileHandle.prototype.fileExists = function (path) {
            return this._fs.existsSync(path);
        };
        return FileHandle;
    })();
    NodeJs.FileHandle = FileHandle;    
})(NodeJs || (NodeJs = {}));
var System;
(function (System) {
    (function (IO) {
        var FileManager = (function () {
            function FileManager() { }
            FileManager.handle = new NodeJs.FileHandle();
            return FileManager;
        })();
        IO.FileManager = FileManager;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;
})(System || (System = {}));
var System;
(function (System) {
    })(System || (System = {}));
var NodeJs;
(function (NodeJs) {
    var WebRequest = (function () {
        function WebRequest() {
            this._request = require('request');
        }
        WebRequest.prototype.getUrl = function (url, callback) {
            System.Console.writeLine("tsd \033[32mhttp \033[35mGET\033[0m " + url);
            var timeStart = Date.now();
            this._request(url, function (error, response, body) {
                if(error) {
                    System.Console.writeLine("tsd \033[31mERR!\033[0m \033[35mGET\033[0m Please, check your internet connection - " + error + '\n');
                    callback(error, null);
                } else {
                    System.Console.writeLine("tsd \033[32mhttp \033[35m" + response.statusCode + "\033[0m " + url);
                    if(response.statusCode == 404) {
                        System.Console.writeLine("tsd \033[31mERR!\033[0m " + response.statusCode + " Not Found");
                        callback({
                            statusCode: response.statusCode,
                            messagem: "Connection failure."
                        }, null);
                    } else if(!error && response.statusCode == 200) {
                        callback(null, body);
                    } else {
                        System.Console.writeLine("tsd \033[31ERR!\033[0m " + response.statusCode + " " + error);
                        callback({
                            statusCode: response.statusCode,
                            messagem: "Connection failure."
                        }, null);
                    }
                }
            });
        };
        return WebRequest;
    })();
    NodeJs.WebRequest = WebRequest;    
})(NodeJs || (NodeJs = {}));
var System;
(function (System) {
    (function (Web) {
        var WebHandler = (function () {
            function WebHandler() { }
            WebHandler.request = new NodeJs.WebRequest();
            return WebHandler;
        })();
        Web.WebHandler = WebHandler;        
    })(System.Web || (System.Web = {}));
    var Web = System.Web;
})(System || (System = {}));
var Repo = (function () {
    function Repo() {
        this.uriList = [];
    }
    return Repo;
})();
var Config = (function () {
    function Config() {
        this.version = "v3";
        this.dependencies = {
        };
        this.tv4 = require('tv4').tv4;
        this.schema = JSON.parse(System.IO.FileManager.handle.readFile(Config.SCHEMA_PATH));
    }
    Config.FILE_NAME = 'tsd-config.json';
    Config.CORE_REPO = 'http://www.tsdpm.com/repository_v2.json';
    Config.SCHEMA_PATH = require('path').resolve('./schema/tsd-config_v3.json');
    Config.isNull = function isNull(cfg, key, alternativeValue) {
        return cfg[key] ? cfg[key] : alternativeValue;
    };
    Config.cascadeProp = function cascadeProp(key, cfg, defaults, alternativeValue) {
        if (typeof alternativeValue === "undefined") { alternativeValue = null; }
        if(cfg.hasOwnProperty(key)) {
            return cfg[key];
        }
        if(defaults.hasOwnProperty(key)) {
            return defaults[key];
        }
        return alternativeValue;
    };
    Config.tryGetConfigFile = function tryGetConfigFile() {
        var cfg;
        try  {
            cfg = JSON.parse(System.IO.FileManager.handle.readFile(Config.FILE_NAME));
        } catch (e) {
        }
        return cfg;
    };
    Config.getDefault = function getDefault() {
        return {
            typingsPath: 'typings',
            dependencies: {
            },
            version: 'v3',
            repo: {
                uriList: [
                    Config.CORE_REPO
                ]
            }
        };
    };
    Config.prototype.load = function (cfg) {
        var cfg = cfg || Config.tryGetConfigFile();
        var def = Config.getDefault();
        this.version = Config.cascadeProp('version', cfg, def);
        this.typingsPath = Config.cascadeProp('typingsPath', cfg, def);
        this.dependencies = Config.cascadeProp('dependencies', cfg, def);
        this.repo = Config.cascadeProp('repo', cfg, def);
        var res = this.tv4.validateResult(this, this.schema);
        if(!res.valid) {
            throw (new Error(res.error.message + ' -> ' + res.error.dataPath + ' -> ' + res.error.schemaPath));
        }
    };
    Config.prototype.save = function () {
        var dep = {
        };
        for(var attr in this.dependencies) {
            if(this.dependencies.hasOwnProperty(attr)) {
                dep[attr] = this.dependencies[attr];
            }
        }
        var cfg = {
            typingsPath: this.typingsPath,
            repo: this.repo,
            version: this.version,
            dependencies: dep
        };
        var res = this.tv4.validateResult(cfg, this.schema);
        if(!res.valid) {
            throw (new Error(res.error.message + ' -> ' + res.error.dataPath + ' -> ' + res.error.schemaPath));
        }
        System.IO.FileManager.handle.writeFile(Config.FILE_NAME, JSON.stringify(cfg, null, 4));
    };
    Config.prototype.addDependency = function (name, version, key, uri, repo) {
        this.dependencies[name + '@' + version] = {
            repo: repo,
            key: key,
            uri: uri
        };
    };
    return Config;
})();
var Common = (function () {
    function Common() { }
    Common.complete = function complete(val) {
        var result = '';
        for(var i = 0; i < val; i++) {
            result += ' ';
        }
        return result;
    };
    Common.format = function format(start, maxLen, text) {
        return Common.complete(start) + (text.length > maxLen ? text.substr(0, maxLen - 3) + '...' : text + Common.complete(maxLen - text.length));
    };
    return Common;
})();
var System;
(function (System) {
    })(System || (System = {}));
var NodeJs;
(function (NodeJs) {
    var DirectoryHandle = (function () {
        function DirectoryHandle() {
            this._fs = require('fs');
            this._path = require('path');
        }
        DirectoryHandle.prototype.directoryExists = function (path) {
            return this._fs.existsSync(path) && this._fs.lstatSync(path).isDirectory();
        };
        DirectoryHandle.prototype.createDirectory = function (path) {
            if(!this.directoryExists(path)) {
                var parts = this._path.normalize(path).split(/[\\\/]/g);
                var dpath = '';
                for(var i = 0; i < parts.length; i++) {
                    if(parts[i].length === 0) {
                        continue;
                    }
                    dpath += parts[i] + this._path.sep;
                    if(!this.directoryExists(dpath)) {
                        this._fs.mkdirSync(dpath);
                    }
                }
            }
        };
        DirectoryHandle.prototype.dirName = function (path) {
            return this._path.dirname(path);
        };
        DirectoryHandle.prototype.getAllFiles = function (path, spec, options) {
            var _this = this;
            options = options || {
            };
            var filesInFolder = function (folder) {
                var paths = [];
                var files = _this._fs.readdirSync(folder);
                for(var i = 0; i < files.length; i++) {
                    var p = _this._path.join(folder, files[i]);
                    var stat = _this._fs.statSync(p);
                    if(options.recursive && stat.isDirectory()) {
                        paths = paths.concat(filesInFolder(p));
                    } else if(stat.isFile() && (!spec || files[i].match(spec))) {
                        paths.push(p);
                    }
                }
                return paths;
            };
            return filesInFolder(path);
        };
        return DirectoryHandle;
    })();
    NodeJs.DirectoryHandle = DirectoryHandle;    
})(NodeJs || (NodeJs = {}));
var System;
(function (System) {
    (function (IO) {
        var DirectoryManager = (function () {
            function DirectoryManager() { }
            DirectoryManager.handle = new NodeJs.DirectoryHandle();
            return DirectoryManager;
        })();
        IO.DirectoryManager = DirectoryManager;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;
})(System || (System = {}));
var Uri = (function () {
    var options = {
        strictMode: false,
        key: [
            "source", 
            "protocol", 
            "authority", 
            "userInfo", 
            "user", 
            "password", 
            "host", 
            "port", 
            "relative", 
            "path", 
            "directory", 
            "file", 
            "query", 
            "anchor"
        ],
        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
    function parseUri(str) {
        var o = options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {
        }, i = 14;
        while(i--) {
            uri[o.key[i]] = m[i] || "";
        }
        uri[o.q.name] = {
        };
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if($1) {
                uri[o.q.name][$1] = $2;
            }
        });
        return uri;
    }
    ;
    return {
        parseUri: parseUri
    };
})();
var DataSource;
(function (DataSource) {
    var WebDataSource = (function () {
        function WebDataSource(repositoryUrl) {
            this.repositoryUrl = repositoryUrl;
        }
        WebDataSource.prototype.all = function (callback) {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, function (err, body) {
                if(err) {
                    return callback(err, null);
                }
                var data;
                try  {
                    data = JSON.parse(body);
                } catch (e) {
                    return callback(e, null);
                }
                callback(null, data.repo);
            });
        };
        WebDataSource.prototype.find = function (keys) {
            return null;
        };
        WebDataSource.prototype.content = function (callback) {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, function (err, body) {
                callback(err, body);
            });
        };
        return WebDataSource;
    })();
    DataSource.WebDataSource = WebDataSource;    
})(DataSource || (DataSource = {}));
var DataSource;
(function (DataSource) {
    var FileSystemDataSource = (function () {
        function FileSystemDataSource(repositoryPath) {
            this.repositoryPath = repositoryPath;
            this._fs = require('fs');
        }
        FileSystemDataSource.prototype.all = function (callback) {
            this._fs.readFile(this.repositoryPath, 'utf8', function (err, body) {
                if(err) {
                    return callback(err, null);
                }
                var data;
                try  {
                    data = JSON.parse(body);
                } catch (e) {
                    return callback(e, null);
                }
                callback(null, data.repo);
            });
        };
        FileSystemDataSource.prototype.find = function (keys) {
            return null;
        };
        FileSystemDataSource.prototype.content = function (callback) {
            this._fs.readFile(this.repositoryPath, 'utf8', callback);
        };
        return FileSystemDataSource;
    })();
    DataSource.FileSystemDataSource = FileSystemDataSource;    
})(DataSource || (DataSource = {}));
var DataSource;
(function (DataSource) {
    var LibVersion = (function () {
        function LibVersion() { }
        return LibVersion;
    })();
    DataSource.LibVersion = LibVersion;    
    var Lib = (function () {
        function Lib() {
            this.versions = new Array();
        }
        return Lib;
    })();
    DataSource.Lib = Lib;    
    var LibContent = (function () {
        function LibContent() { }
        return LibContent;
    })();
    DataSource.LibContent = LibContent;    
})(DataSource || (DataSource = {}));
var DataSource;
(function (DataSource) {
    var fileUri = /^file:\/\/\//i;
    ;
    var httpUri = /^https?:\/\//i;
    var winFileUri = /^[a-zA-Z]:/;
    var DataSourceFactory = (function () {
        function DataSourceFactory() { }
        DataSourceFactory.factory = function factory(uri) {
            if(fileUri.test(uri)) {
                uri = decodeURI(uri.replace(fileUri, ''));
                return new DataSource.FileSystemDataSource(uri);
            } else if(httpUri.test(uri)) {
                return new DataSource.WebDataSource(uri);
            } else {
                throw Error('Invalid dataSource uri: ' + uri);
            }
        };
        return DataSourceFactory;
    })();
    DataSource.DataSourceFactory = DataSourceFactory;    
})(DataSource || (DataSource = {}));
var Command;
(function (Command) {
    var BaseCommand = (function () {
        function BaseCommand() { }
        BaseCommand.prototype.accept = function (args) {
            throw new Error("Not implemented exception");
        };
        BaseCommand.prototype.exec = function (args, callback) {
            throw new Error("Not implemented exception");
        };
        BaseCommand.prototype.toString = function () {
            return Common.format(2, 15, this.shortcut) + "   " + Common.format(0, 57, this.usage);
        };
        return BaseCommand;
    })();
    Command.BaseCommand = BaseCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var Helper = (function () {
        function Helper() { }
        Helper.print = function print(lib, repoNumber) {
            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;
            System.Console.writeLine(Common.format(1, 28, name) + ' ' + Common.format(0, 7, version) + ' ' + Common.format(0, 39, description) + ' ' + repoNumber.toString());
        };
        Helper.printLibs = function printLibs(libs, repo, repoNumber) {
            System.Console.writeLine('');
            System.Console.writeLine(' ------------------------------------------------------------------------------');
            System.Console.writeLine(' Repo [' + repoNumber + ']: ' + repo);
            System.Console.writeLine('');
            System.Console.writeLine(' Name                         Version Description                             R');
            System.Console.writeLine(' ---------------------------- ------- --------------------------------------- -');
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                Helper.print(lib, repoNumber);
            }
            System.Console.writeLine(' ------------------------------------------------------------------------------');
            System.Console.writeLine(' Repo [' + repoNumber + '] - Total: ' + libs.length + ' lib(s).');
            System.Console.writeLine('');
        };
        Helper.getDataSource = function getDataSource(uri) {
            return DataSource.DataSourceFactory.factory(uri);
        };
        Helper.getSourceContent = function getSourceContent(uri, callback) {
            Helper.getDataSource(uri).content(callback);
        };
        return Helper;
    })();
    Command.Helper = Helper;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var InstallCommand = (function (_super) {
        __extends(InstallCommand, _super);
        function InstallCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "install";
            this.usage = "Intall file definition. Use install* to map dependencies.";
            this._cache = [];
            this._index = 0;
            this._withDep = false;
            this._withRepoIndex = false;
            this._path = require('path');
            this._map = {
            };
        }
        InstallCommand.prototype.accept = function (args) {
            return (args[2] == this.shortcut || args[2] == this.shortcut + '*' || args[2] == this.shortcut + '-all');
        };
        InstallCommand.prototype.print = function (lib) {
            System.Console.write(lib.name + ' - ' + lib.description + '[');
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.writeLine(']');
        };
        InstallCommand.prototype.match = function (key, name) {
            return name.toUpperCase() == key.toUpperCase();
        };
        InstallCommand.prototype.saveFile = function (name, content) {
            var sw = System.IO.FileManager.handle.createFile(name);
            sw.write(content);
            sw.flush();
            sw.close();
        };
        InstallCommand.prototype.normalizeGithubUrl = function (uri) {
            if(uri.host == 'github.com') {
                var parts = uri.directory.split('/');
                var repo = parts[2];
                var ignore = '/' + parts[1] + '/' + parts[2] + '/' + parts[3] + '/' + parts[4];
                uri.directory = '/' + repo + uri.directory.substr(ignore.length);
            }
        };
        InstallCommand.prototype.save = function (uri, name, version, key, content, repo) {
            var uriParsed = Uri.parseUri(uri);
            this.normalizeGithubUrl(uriParsed);
            var path = '';
            path = this._path.join(this.cfg.typingsPath, uriParsed.directory);
            if(!System.IO.DirectoryManager.handle.directoryExists(path)) {
                System.IO.DirectoryManager.handle.createDirectory(path);
            }
            this.saveFile(path + name + ".d.ts", content);
            System.Console.writeLine("+-- " + name + "@" + version + " -> " + path);
            System.Console.writeLine("");
            if(repo) {
                this.cfg.addDependency(name, version, key, uri, repo);
                this.cfg.save();
            }
        };
        InstallCommand.prototype.find = function (key, libs) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(this.match(lib.name, key)) {
                    return lib;
                }
            }
            return null;
        };
        InstallCommand.prototype.cacheContains = function (name) {
            for(var i = 0; i < this._cache.length; i++) {
                if(this._cache[i] == name) {
                    return true;
                }
            }
            return false;
        };
        InstallCommand.prototype.getVersion = function (versions, strVersion) {
            for(var i = 0; i < versions.length; i++) {
                var version = versions[i];
                if(version.version == strVersion) {
                    return version;
                }
            }
            return versions[0];
        };
        InstallCommand.prototype.install = function (targetLib, targetVersion, libs, repo, callback) {
            var _this = this;
            if(this.cacheContains(targetLib.name)) {
                return;
            }
            if(targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = this.getVersion(targetLib.versions, targetVersion);
                Command.Helper.getSourceContent(version.uri, function (err, body) {
                    if(err) {
                        callback(err, null);
                        return;
                    }
                    _this.save(version.uri, targetLib.name, version.version, version.key, body, repo);
                    _this._cache.push(targetLib.name);
                    if(_this._withDep) {
                        var deps = (version.dependencies) || [];
                        for(var i = 0; i < deps.length; i++) {
                            if(!_this._map[deps[i].name]) {
                                _this._map[deps[i].name] = false;
                            }
                            var dep = _this.find(deps[i].name, libs);
                            _this.install(dep, dep.versions[0].version, libs, _this.cfg.repo.uriList[0], callback);
                        }
                    }
                    _this.verifyFinish(targetLib.name, callback);
                });
            }
        };
        InstallCommand.prototype.verifyFinish = function (name, callback) {
            var isFinish = true;
            this._map[name] = true;
            for(var attr in this._map) {
                if(!this._map[attr]) {
                    isFinish = false;
                }
            }
            if(isFinish) {
                var data = {
                };
                for(var attr in this._map) {
                    for(var key in this.cfg.dependencies) {
                        if(key.split('@')[0] == attr) {
                            data[key] = this.cfg.dependencies[key];
                        }
                    }
                }
                callback(null, {
                    typings: data
                });
            }
        };
        InstallCommand.prototype.execInternal = function (index, uriList, args, callback) {
            var _this = this;
            var targetLib;
            var tryInstall = function (libs, lib) {
                targetLib = _this.find(lib.split('@')[0], libs);
                if(targetLib) {
                    var name = lib.split('@')[0];
                    var version = lib.split('@')[1];
                    _this.install(targetLib, version || targetLib.versions[0].version, libs, uriList[index], callback);
                } else {
                    System.Console.writeLine("   [!] Lib not found.\n");
                    _this.verifyFinish(lib.split('@')[0], callback);
                }
            };
            for(var i = 3; i < args.length; i++) {
                if(!this._map[args[i]]) {
                    this._map[args[i]] = false;
                }
            }
            var dataSource = Command.Helper.getDataSource(uriList[index]);
            dataSource.all(function (err, libs) {
                if(err) {
                    callback(err, null);
                    return;
                }
                var index = (_this._withRepoIndex ? 4 : 3);
                var lib = args[index];
                while(lib) {
                    tryInstall(libs, lib);
                    index++;
                    lib = args[index];
                }
            });
        };
        InstallCommand.prototype.installFromConfig = function (callback) {
            var libs = [];
            for(var dep in this.cfg.dependencies) {
                var name = dep.split('@')[0];
                var version = dep.split('@')[1];
                var key = this.cfg.dependencies[dep].key;
                var uri = this.cfg.dependencies[dep].uri;
                var lib = new DataSource.Lib();
                lib.name = name;
                lib.versions.push({
                    version: version,
                    key: key,
                    dependencies: [],
                    uri: uri,
                    lib: []
                });
                libs.push(lib);
            }
            for(var i = 0; i < libs.length; i++) {
                this.install(libs[i], libs[i].versions[0].version, [], null, callback);
            }
        };
        InstallCommand.prototype.exec = function (args, callback) {
            if(args[2].indexOf('*') != -1) {
                this._withDep = true;
            } else if(args[2] == this.shortcut + '-all') {
                this._withDep = true;
            }
            if(!args[3]) {
                this.installFromConfig(callback);
            } else {
                if(args[args.length - 1] == 'full') {
                    this._isFull = true;
                    args.pop();
                }
                var uriList = this.cfg.repo.uriList;
                if(args[3].indexOf('!') != -1) {
                    this._withRepoIndex = true;
                    var index = parseInt(args[3][1]);
                    if(index.toString() != "NaN") {
                        this.execInternal(index, uriList, args, callback);
                    } else {
                        System.Console.writeLine("   [!] Invalid repository index.\n");
                    }
                } else {
                    this.execInternal(0, uriList, args, callback);
                }
            }
        };
        return InstallCommand;
    })(Command.BaseCommand);
    Command.InstallCommand = InstallCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var HelpCommand = (function (_super) {
        __extends(HelpCommand, _super);
        function HelpCommand() {
            _super.apply(this, arguments);

            this.shortcut = "-h";
            this.usage = "Print this help message";
        }
        HelpCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        HelpCommand.prototype.exec = function (args, callback) {
        };
        return HelpCommand;
    })(Command.BaseCommand);
    Command.HelpCommand = HelpCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var AllCommand = (function (_super) {
        __extends(AllCommand, _super);
        function AllCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "all";
            this.usage = "Show all file definitions from repository";
            this._indexSync = 0;
        }
        AllCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        AllCommand.prototype.repoExplorer = function (dataSource, uriList, callback) {
            var _this = this;
            dataSource.all(function (err, libs) {
                if(err) {
                    callback(err, null);
                    return;
                }
                var repoNumber = _this._indexSync - 1;
                Command.Helper.printLibs(libs, uriList[repoNumber], repoNumber);
                if(_this._indexSync < uriList.length) {
                    _this.repoExplorer(Command.Helper.getDataSource(uriList[_this._indexSync++]), uriList, callback);
                } else {
                    callback(null, libs);
                }
            });
        };
        AllCommand.prototype.exec = function (args, callback) {
            var uriList = this.cfg.repo.uriList;
            if(this._indexSync < uriList.length) {
                this.repoExplorer(Command.Helper.getDataSource(uriList[this._indexSync++]), uriList, callback);
            }
        };
        return AllCommand;
    })(Command.BaseCommand);
    Command.AllCommand = AllCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var SearchCommand = (function (_super) {
        __extends(SearchCommand, _super);
        function SearchCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "search";
            this.usage = "Search a file definition on repository";
            this._indexSync = 0;
        }
        SearchCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        SearchCommand.prototype.print = function (lib) {
            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;
            System.Console.writeLine(Common.format(1, 28, name) + ' ' + Common.format(0, 7, version) + ' ' + Common.format(0, 41, description));
        };
        SearchCommand.prototype.match = function (key, name) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        };
        SearchCommand.prototype.verifyMatch = function (lib, args) {
            var found = false;
            for(var i = 3; i < args.length; i++) {
                var key = args[i];
                if(this.match(key, lib.name)) {
                    found = true;
                }
            }
            return found;
        };
        SearchCommand.prototype.showResults = function (dataSource, uriList, args) {
            var _this = this;
            dataSource.all(function (libs) {
                var repoNumber = _this._indexSync - 1;
                var foundLibs = [];
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    if(_this.verifyMatch(lib, args)) {
                        foundLibs.push(lib);
                    }
                }
                if(foundLibs.length == 0) {
                    System.Console.writeLine("   [!] No results found.");
                } else {
                    Command.Helper.printLibs(foundLibs, uriList[repoNumber], repoNumber);
                }
                if(_this._indexSync < uriList.length) {
                    _this.showResults(Command.Helper.getDataSource(uriList[_this._indexSync++]), uriList, args);
                }
            });
        };
        SearchCommand.prototype.exec = function (args, callback) {
            var uriList = this.cfg.repo.uriList;
            if(this._indexSync < uriList.length) {
                this.showResults(Command.Helper.getDataSource(uriList[this._indexSync++]), uriList, args);
            }
        };
        return SearchCommand;
    })(Command.BaseCommand);
    Command.SearchCommand = SearchCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var Lib = (function () {
        function Lib() { }
        return Lib;
    })();    
    var UpdateCommand = (function (_super) {
        __extends(UpdateCommand, _super);
        function UpdateCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "update";
            this.usage = "Checks if any definition file needs to be updated";
            this._index = 0;
            this._libList = [];
        }
        UpdateCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        UpdateCommand.prototype.getVersion = function (libs, name, strVersion) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(lib.name == name) {
                    for(var j = 0; j < lib.versions.length; j++) {
                        var version = lib.versions[j];
                        if(version.version == strVersion) {
                            return version;
                        }
                    }
                    return lib.versions[0];
                }
            }
            return null;
        };
        UpdateCommand.prototype.update = function (lib) {
            var _this = this;
            var ds = Command.Helper.getDataSource(this.cfg.dependencies[lib].repo);
            ds.all(function (data) {
                var name = lib.split('@')[0];
                var version = lib.split('@')[1];
                var ver = _this.getVersion(data, name, version);
                if(ver) {
                    if(ver.key != _this.cfg.dependencies[lib].key) {
                        System.Console.writeLine(Common.format(1, 34, lib) + Common.format(1, 35, '  Update is available!'));
                    } else {
                        System.Console.writeLine(Common.format(1, 34, lib) + Common.format(1, 35, '  Is the latest version.'));
                    }
                }
                if(_this._index < _this._libList.length) {
                    _this.update(_this._libList[(_this._index++)]);
                } else {
                    System.Console.writeLine('\n');
                }
            });
        };
        UpdateCommand.prototype.exec = function (args, callback) {
            System.Console.writeLine(' Lib                                  Status');
            System.Console.writeLine(' ------------------------------------ ----------------------------------------');
            for(var lib in this.cfg.dependencies) {
                this._libList.push(lib);
            }
            this.update(this._libList[(this._index++)]);
        };
        return UpdateCommand;
    })(Command.BaseCommand);
    Command.UpdateCommand = UpdateCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var CreateLocalConfigCommand = (function (_super) {
        __extends(CreateLocalConfigCommand, _super);
        function CreateLocalConfigCommand() {
            _super.apply(this, arguments);

            this.shortcut = "ncfg";
            this.usage = "Create a local config file";
        }
        CreateLocalConfigCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        CreateLocalConfigCommand.prototype.saveConfigFile = function () {
            System.IO.FileManager.handle.writeFile(Config.FILE_NAME, JSON.stringify(Config.getDefault(), null, 4));
        };
        CreateLocalConfigCommand.prototype.exec = function (args, callback) {
            if(System.IO.FileManager.handle.fileExists(Config.FILE_NAME)) {
                throw new Error("   [!] There is already a configuration file in this folder.");
            } else {
                this.saveConfigFile();
            }
            System.Console.writeLine("   [!] Configuration file created successfully.");
            System.Console.writeLine("");
        };
        return CreateLocalConfigCommand;
    })(Command.BaseCommand);
    Command.CreateLocalConfigCommand = CreateLocalConfigCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var InfoCommand = (function (_super) {
        __extends(InfoCommand, _super);
        function InfoCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "info";
            this.usage = "Get lib information";
            this._index = 0;
            this._withRepoIndex = false;
        }
        InfoCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut && args[3];
        };
        InfoCommand.prototype.match = function (key, name) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        };
        InfoCommand.prototype.find = function (key, libs) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(this.match(lib.name, key)) {
                    return lib;
                }
            }
            return null;
        };
        InfoCommand.prototype.display = function (targetLib, targetVersion, libs) {
            if(targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = targetLib.versions[0];
                System.Console.writeLine("         name: " + targetLib.name);
                System.Console.writeLine("  description: " + Common.format(0, 60, targetLib.description));
                System.Console.writeLine("          key: " + version.key);
                System.Console.writeLine("      version: " + version.version);
                System.Console.writeLine("       author: " + Common.format(0, 60, version.author.name + ' (' + version.author.url + ')'));
                System.Console.writeLine("          url: " + Common.format(0, 60, version.uri));
                System.Console.writeLine("");
            }
        };
        InfoCommand.prototype.execInternal = function (index, uriList, args) {
            var _this = this;
            var targetLib;
            var tryGetInfo = function (libs, lib) {
                targetLib = _this.find(lib, libs);
                if(targetLib) {
                    _this.display(targetLib, targetLib.versions[0].version, libs);
                } else {
                    System.Console.writeLine("   [!] Lib not found.\n");
                }
            };
            var dataSource = Command.Helper.getDataSource(uriList[index]);
            dataSource.all(function (libs) {
                var index = (_this._withRepoIndex ? 4 : 3);
                var lib = args[index];
                tryGetInfo(libs, lib);
            });
        };
        InfoCommand.prototype.exec = function (args, callback) {
            var uriList = this.cfg.repo.uriList;
            if(args[3].indexOf('!') != -1) {
                this._withRepoIndex = true;
                var index = parseInt(args[3][1]);
                if(index.toString() != "NaN") {
                    this.execInternal(index, uriList, args);
                } else {
                    System.Console.writeLine("   [!] Invalid repository index.\n");
                }
            } else {
                this.execInternal(0, uriList, args);
            }
        };
        return InfoCommand;
    })(Command.BaseCommand);
    Command.InfoCommand = InfoCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var RepoCommand = (function (_super) {
        __extends(RepoCommand, _super);
        function RepoCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "repo";
            this.usage = "Show repo list";
            this._index = 0;
            this._withRepoIndex = false;
        }
        RepoCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        RepoCommand.prototype.exec = function (args, callback) {
            var uriList = this.cfg.repo.uriList;
            if(uriList.length > 0) {
                var index = 0;
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' REPOSITORY LIST ');
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                for(var i = 0; i < uriList.length; i++) {
                    System.Console.writeLine(' [' + (index++) + '] ' + uriList[i]);
                }
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' Total: ' + uriList.length + ' repositories.\n');
            }
        };
        return RepoCommand;
    })(Command.BaseCommand);
    Command.RepoCommand = RepoCommand;    
})(Command || (Command = {}));
var CommandLineProcessor = (function () {
    function CommandLineProcessor(cfg) {
        this.cfg = cfg;
        this.commands = [];
        this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(cfg));
        this.commands.push(new Command.SearchCommand(cfg));
        this.commands.push(new Command.InstallCommand(cfg));
        this.commands.push(new Command.UpdateCommand(this.cfg));
        this.commands.push(new Command.CreateLocalConfigCommand());
        this.commands.push(new Command.InfoCommand(cfg));
        this.commands.push(new Command.RepoCommand(cfg));
    }
    CommandLineProcessor.prototype.printUsage = function () {
        System.Console.out.autoFlush = false;
        System.Console.writeLine('Syntax: tsd [command] [args...]');
        System.Console.writeLine('');
        System.Console.writeLine('The following TSD commands are included:');
        System.Console.writeLine('');
        System.Console.writeLine("  Command           Description");
        System.Console.writeLine("  ----------------  ---------------------------------------------------------");
        for(var i = 0; i < this.commands.length; i++) {
            System.Console.writeLine(this.commands[i].toString());
        }
        System.Console.writeLine('');
        System.Console.out.flush();
    };
    CommandLineProcessor.prototype.execute = function (args) {
        System.Console.writeLine('');
        var accepted = false;
        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if(command instanceof Command.HelpCommand) {
                    this.printUsage();
                } else {
                    command.exec(args, function () {
                    });
                }
            }
        }
        if(!accepted) {
            this.printUsage();
        }
    };
    return CommandLineProcessor;
})();
require('colors');
var Main = (function () {
    function Main() { }
    Main.prototype.run = function (args) {
        try  {
            var cfg = new Config();
            cfg.load();
            var cp = new CommandLineProcessor(cfg);
            cp.execute(args);
        } catch (e) {
            System.Console.writeLine(e.message);
            System.Console.writeLine("");
        }
    };
    return Main;
})();
var ApiLogger = (function (_super) {
    __extends(ApiLogger, _super);
    function ApiLogger(proxy) {
        _super.call(this);
        this.proxy = proxy;
    }
    ApiLogger.prototype.write = function (value) {
        if(value) {
            this.proxy.logger.log(value);
        }
    };
    ApiLogger.prototype.writeLine = function (value) {
        if(value) {
            this.proxy.logger.log(value);
        }
    };
    ApiLogger.prototype.flush = function () {
    };
    ApiLogger.prototype.flushAsync = function (callback) {
    };
    ApiLogger.prototype.dispose = function () {
    };
    return ApiLogger;
})(System.IO.StreamWriter);
var EventManager = function () {
    this.initialize();
};
EventManager.prototype = {
    initialize: function () {
        this.listeners = {
        };
    },
    addListener: function (event, fn) {
        if(!this.listeners[event]) {
            this.listeners[event] = [];
        }
        if(fn instanceof Function) {
            this.listeners[event].push(fn);
        }
        return this;
    },
    dispatchEvent: function (event, params) {
        if(this.listeners[event]) {
            for(var index = 0, l = this.listeners[event].length; index < l; index++) {
                this.listeners[event][index].call(exports, params);
            }
        }
    },
    removeListener: function (event, fn) {
        if(this.listeners[event]) {
            for(var i = 0, l = this.listners[event].length; i < l; i++) {
                if(this.listners[event][i] === fn) {
                    this.listners[event].slice(i, 1);
                    break;
                }
            }
        }
    }
};
(exports).Main = Main;
(exports).System = System;
(exports).EventManager = EventManager;
(exports).ApiLogger = ApiLogger;
(exports).Config = Config;
(exports).Command = Command;
(exports).DataSourceFactory = DataSource.DataSourceFactory;
