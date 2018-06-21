"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("@angular/http");
var HanwinBaseRequest = (function () {
    function HanwinBaseRequest() {
        this.searchParams = new http_1.URLSearchParams();
    }
    Object.defineProperty(HanwinBaseRequest.prototype, "params", {
        get: function () {
            return this._params;
        },
        set: function (value) {
            var _this = this;
            this._params = value;
            this.searchParams = new http_1.URLSearchParams();
            Object.keys(this.params).forEach(function (key) {
                _this.searchParams.append(key, _this.params[key]);
            });
        },
        enumerable: true,
        configurable: true
    });
    return HanwinBaseRequest;
}());
exports.HanwinBaseRequest = HanwinBaseRequest;
//# sourceMappingURL=hanwin-base-request.api.js.map