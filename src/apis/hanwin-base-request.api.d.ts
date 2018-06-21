import { URLSearchParams } from '@angular/http';
export declare class HanwinBaseRequest {
    method: string;
    url: string;
    private _params;
    params: any;
    searchParams: URLSearchParams;
    body: any;
    constructor();
}
