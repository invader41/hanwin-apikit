/**
 * Api客户端
 *
 * @export
 * @class HanwinApiClient
 */
export class HanwinApiClient {

    constructor(baseUrl) {
        this.tokenLocalStorageKey = 'hanwinToken';
        this.baseUrlLocalStorageKey = 'hanwinBaseUrl';
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    get token() {
        if (!this._token) {
            this._token = localStorage.getItem(this.tokenLocalStorageKey) ? localStorage.getItem(this.tokenLocalStorageKey) : '';
        }
        return this._token;
    }
    set token(v) {
        localStorage.setItem(this.tokenLocalStorageKey, v);
        this._token = v;
    }

    get baseUrl() {
        if (!this._baseUrl) {
            this._baseUrl = localStorage.getItem(this.baseUrlLocalStorageKey) ? localStorage.getItem(this.baseUrlLocalStorageKey) : '';
        }
        return this._baseUrl;
    }
    set baseUrl(v) {
        localStorage.setItem(this.baseUrlLocalStorageKey, v);
        this._baseUrl = v;
    }
    /**
     * 构造要放在header里的额外验证信息
     *
     * @returns
     * @memberof HanwinApiClient
     */
    assignCredential() {
        return {}
    }
    /**
     * 发生业务错误时的统一处理方法
     *
     * @param {*} data
     * @memberof HanwinApiClient
     */
    onBusinessError(data) {
        console.log(data);
    }
    /**
     * 发生身份验证错误时的统一处理方法
     *
     * @param {*} response
     * @memberof HanwinApiClient
     */
    onUnauthorized(response) {
        console.log(response);
    }
    /**
     * 发送请求
     *
     * @param {*} hanwinApiConfig
     * @returns
     * @memberof HanwinApiClient
     */
    request(hanwinApiConfig) {
        if (!hanwinApiConfig instanceof HanwinApiConfig) {
            return null;
        }
        if (hanwinApiConfig.headers instanceof Headers) {
            hanwinApiConfig.headers.append("Authorization", "bearer " + this.token);
            let credentialHeaders = this.assignCredential();
            for (var key in credentialHeaders) {
                hanwinApiConfig.headers.append(key, credentialHeaders[key]);
            }
        }
        let requestConfig = {
            method: hanwinApiConfig.method,
            headers: hanwinApiConfig.headers,
            body: hanwinApiConfig.body,
            mode: 'cors'
        };
        let request = new Request(this.baseUrl + hanwinApiConfig.url, requestConfig);
        return fetch(request).then(response => {
            if (response.status === 401) {
                this.onUnauthorized(response);
                throw new Error("Unauthorized");
            }
            if (response.headers.get("content-type").includes("application/json")) {
                return response.json();
            } else {
                throw new Error("Not Json");
            }
        }).then(model => {
            if (model.hasOwnProperty('success') && model.hasOwnProperty('data') && model.hasOwnProperty('reason')) {
                if (!model['success']) {
                    this.onBusinessError(model);
                }
                return model;
            } else {
                if (requestConfig.verifyModel) {
                    throw new Error("Not Rest model");
                } else {
                    return model;
                }
            }
        });
    }
}
/**
 * 单个api配置类
 *
 * @export
 * @class HanwinApiConfig
 */
export class HanwinApiConfig {
    constructor(url, method = 'GET', urlSearchParams, data, headers, verifyModel = true) {
        this.url = url;
        if (urlSearchParams instanceof URLSearchParams && urlSearchParams.keys > 0) {
            this.url = url + '?' + urlSearchParams.toString()
        };
        if (headers instanceof Headers) {
            this.headers = headers;
        } else {
            this.headers = new Headers();
        }
        this.body = data instanceof URLSearchParams ? data : JSON.stringify(data);
        this.method = method;
        this.verifyModel = verifyModel;
    }
}