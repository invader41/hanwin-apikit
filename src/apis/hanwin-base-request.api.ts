import { URLSearchParams } from '@angular/http';
/**
 * BaseRequest
 */
export class HanwinBaseRequest {
    method: string;
    url: string;
    private _params: any;
    public get params(): any {
        return this._params;
    }
    public set params(value: any) {
        this._params = value;
        this.searchParams = new URLSearchParams();
        Object.keys(this.params).forEach(key => {
            this.searchParams.append(key, this.params[key]);
        })
    }
    searchParams: URLSearchParams = new URLSearchParams();
    body: any;
    constructor() {
    }
}