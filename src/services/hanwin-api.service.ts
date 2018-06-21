import { IHttpCommonResponse } from './../models/http-common-response.model';
import { HanwinBaseRequest } from '../apis/hanwin-base-request.api';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestMethod, Request } from '@angular/http';
import { Md5 } from "ts-md5/dist/md5";
import 'rxjs/add/operator/map';
/**
 * ApiService
 */
@Injectable()
export class HanwinApiService {

    private _token: string;
    public get token(): string {
        if (!this._token) {
            this._token = localStorage.getItem('token') ? localStorage.getItem('token') as string: '';
        }
        return this._token;
    }
    public set token(v: string) {
        localStorage.setItem('token', v);
        this._token = v;
    }

    private _tokenPath: String;
    public get tokenPath(): String {
        if (!this._tokenPath) {
            this._tokenPath = '/api/Login/Token';
        }
        return this._tokenPath;
    }
    public set tokenPath(value) {
        this._tokenPath = value;
    }

    private _baseUrl: string;
    public get baseUrl(): string {
        if (!this._baseUrl) {
            this._baseUrl = localStorage.getItem('baseUrl') ? localStorage.getItem('baseUrl') as string : '';
        }
        return this._baseUrl;
    }
    public set baseUrl(v: string) {
        localStorage.setItem('baseUrl', v);
        this._baseUrl = v;
    }

    constructor(private http: Http) {

    }


    getSignature(timestamp: string, nonce: string): string {
       return Md5.hashStr(nonce + timestamp + nonce).toString().toUpperCase();
    }

    getToken(paramsString: string) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        let options = {
            method: RequestMethod.Post,
            url: this.baseUrl + this.tokenPath,
            headers: headers,
            body: paramsString//body: "grant_type=password" + "&username=" + account + "&password=" + password + "&code=" + code
        };
        return this.http.request(new Request(options))
            .map(res => res.json());
    }

    sendApi(request: HanwinBaseRequest ) {
        let headers = new Headers();
        headers.append('Authorization', 'bearer ' + this.token);
        if (request.method == 'POST') {
            headers.append('Content-Type', 'application/json');
        }
        var timestamp = (Math.round(new Date().getTime()/1000)+28800).toString();
        var nonce = this.newGuid();
        var signature = this.getSignature(timestamp, nonce)
        headers.append('timestamp', timestamp);
        headers.append('nonce', nonce);
        headers.append('signature', signature);
        let options = {
            method: request.method,
            url: this.baseUrl + request.url,
            headers: headers,
            body: JSON.stringify(request.body),
            params: request.searchParams
        };
        return this.http.request(new Request(options))
            .map(res => <IHttpCommonResponse<any>>res.json());

    }

    newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}