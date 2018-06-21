"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var md5_1 = require("ts-md5/dist/md5");
require("rxjs/add/operator/map");
var HanwinApiService = (function () {
    function HanwinApiService(http) {
        this.http = http;
    }
    Object.defineProperty(HanwinApiService.prototype, "token", {
        get: function () {
            if (!this._token) {
                this._token = localStorage.getItem('token') ? localStorage.getItem('token') : '';
            }
            return this._token;
        },
        set: function (v) {
            localStorage.setItem('token', v);
            this._token = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HanwinApiService.prototype, "tokenPath", {
        get: function () {
            if (!this._tokenPath) {
                this._tokenPath = '/api/Login/Token';
            }
            return this._tokenPath;
        },
        set: function (value) {
            this._tokenPath = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HanwinApiService.prototype, "baseUrl", {
        get: function () {
            if (!this._baseUrl) {
                this._baseUrl = localStorage.getItem('baseUrl') ? localStorage.getItem('baseUrl') : '';
            }
            return this._baseUrl;
        },
        set: function (v) {
            localStorage.setItem('baseUrl', v);
            this._baseUrl = v;
        },
        enumerable: true,
        configurable: true
    });
    HanwinApiService.prototype.getSignature = function (timestamp, nonce) {
        return md5_1.Md5.hashStr(nonce + timestamp + nonce).toString().toUpperCase();
    };
    HanwinApiService.prototype.getToken = function (paramsString) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var options = {
            method: http_1.RequestMethod.Post,
            url: this.baseUrl + this.tokenPath,
            headers: headers,
            body: paramsString
        };
        return this.http.request(new http_1.Request(options))
            .map(function (res) { return res.json(); });
    };
    HanwinApiService.prototype.sendApi = function (request) {
        var headers = new http_1.Headers();
        headers.append('Authorization', 'bearer ' + this.token);
        if (request.method == 'POST') {
            headers.append('Content-Type', 'application/json');
        }
        var timestamp = (Math.round(new Date().getTime() / 1000) + 28800).toString();
        var nonce = this.newGuid();
        var signature = this.getSignature(timestamp, nonce);
        headers.append('timestamp', timestamp);
        headers.append('nonce', nonce);
        headers.append('signature', signature);
        var options = {
            method: request.method,
            url: this.baseUrl + request.url,
            headers: headers,
            body: JSON.stringify(request.body),
            params: request.searchParams
        };
        return this.http.request(new http_1.Request(options))
            .map(function (res) { return res.json(); });
    };
    HanwinApiService.prototype.newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    HanwinApiService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], HanwinApiService);
    return HanwinApiService;
}());
exports.HanwinApiService = HanwinApiService;
//# sourceMappingURL=hanwin-api.service.js.map