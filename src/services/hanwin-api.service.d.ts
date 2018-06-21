import { IHttpCommonResponse } from './../models/http-common-response.model';
import { HanwinBaseRequest } from '../apis/hanwin-base-request.api';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
export declare class HanwinApiService {
    private http;
    private _token;
    token: string;
    private _tokenPath;
    tokenPath: String;
    private _baseUrl;
    baseUrl: string;
    constructor(http: Http);
    getSignature(timestamp: string, nonce: string): string;
    getToken(paramsString: string): import("../../../../../../../../Users/psy/Desktop/Develop/Hanwintech/hanwin-apikit/node_modules/rxjs/Observable").Observable<any>;
    sendApi(request: HanwinBaseRequest): import("../../../../../../../../Users/psy/Desktop/Develop/Hanwintech/hanwin-apikit/node_modules/rxjs/Observable").Observable<IHttpCommonResponse<any>>;
    newGuid(): string;
}
