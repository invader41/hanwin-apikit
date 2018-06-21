"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var hanwin_api_service_1 = require("./services/hanwin-api.service");
var hanwin_base_request_api_1 = require("./apis/hanwin-base-request.api");
var HanwinApiKitModule = (function () {
    function HanwinApiKitModule() {
    }
    HanwinApiKitModule = __decorate([
        core_1.NgModule({
            declarations: [hanwin_base_request_api_1.HanwinBaseRequest],
            exports: [hanwin_base_request_api_1.HanwinBaseRequest],
            providers: [hanwin_api_service_1.HanwinApiService]
        })
    ], HanwinApiKitModule);
    return HanwinApiKitModule;
}());
exports.HanwinApiKitModule = HanwinApiKitModule;
//# sourceMappingURL=hanwin-api-kit.module.js.map