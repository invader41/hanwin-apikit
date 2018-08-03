/**
 * Api客户端
 * 配置项：
 * config:{
 *   baseUrl 服务器地址
 *   assignDigest 摘要/指纹验证方法
 *   onBusinessError 业务错误统一处理函数
 *   onUnauthorized 验证错误统一处理函数
 *   isTokenExp token是否过期函数
 *   onTokenExp token过期统一处理函数
 * }
 *
 * @export
 * @class HanwinApiClient
 */
export class HanwinApiClient {

    constructor(config) {
        this.tokenLocalStorageKey = 'hanwinToken';
        this.baseUrlLocalStorageKey = 'hanwinBaseUrl';
        if (typeof config === 'string') {
            this.baseUrl = config;
        };
        if (typeof config === 'object') {
            this.baseUrl = config.baseUrl;
            config.assignDigest ? this.assignDigest = config.assignDigest : false;
            config.onBusinessError ? this.onBusinessError = config.onBusinessError : false;
            config.onUnauthorized ? this.onUnauthorized = config.onUnauthorized : false;
            config.isTokenExp ? this.isTokenExp = config.isTokenExp : false;
            config.onTokenExp ? this.onTokenExp = config.onTokenExp : false;
        }
    }

    get token() {
        return localStorage.getItem(this.tokenLocalStorageKey) ? localStorage.getItem(this.tokenLocalStorageKey) : '';
    }
    set token(v) {
        localStorage.setItem(this.tokenLocalStorageKey, v);
    }

    get baseUrl() {
        return localStorage.getItem(this.baseUrlLocalStorageKey) ? localStorage.getItem(this.baseUrlLocalStorageKey) : '';
    }
    set baseUrl(v) {
        localStorage.setItem(this.baseUrlLocalStorageKey, v);
    }


    /**
     * 发送请求
     *
     * @param {*} hanwinApiRequest
     * @returns
     * @memberof HanwinApiClient
     */
    request(hanwinApiRequest) {
        if (!hanwinApiRequest instanceof HanwinApiRequest) {
            return new Promise((resolve, reject) => {
                reject("Not HanwinApiConfig");
            });
        }
        if (hanwinApiRequest.config.headers instanceof Headers) {
            hanwinApiRequest.config.headers.set("Authorization", "bearer " + this.token);
            //是否需要摘要认证信息
            if (this.hasOwnProperty("assignDigest") && typeof this.assignDigest === 'function') {
                let digestHeaders = this.assignDigest();
                for (var key in digestHeaders) {
                    hanwinApiRequest.config.headers.set(key, digestHeaders[key]);
                }
            }
        }
        let requestConfig = {
            method: hanwinApiRequest.config.method,
            headers: hanwinApiRequest.config.headers,
            body: hanwinApiRequest.config.body,
            mode: 'cors'
        };

        //token过期处理
        if (this.token && this.hasOwnProperty("isTokenExp") && typeof this.isTokenExp === 'function') {
            if (this.isTokenExp(this.token)) {
                if (this.hasOwnProperty("onTokenExp") && typeof this.onTokenExp === 'function') {
                    return this.onTokenExp(hanwinApiRequest);
                }
            }
        }

        let request = new Request(this.baseUrl + hanwinApiRequest.config.url, requestConfig);

        return fetch(request).then(response => {
                if (response.status === 401) {
                    //发生身份验证错误时的统一处理方法
                    if (this.hasOwnProperty("onUnauthorized") && typeof this.onUnauthorized === 'function') {
                        this.onUnauthorized(response);
                    }
                    throw new Error("Unauthorized");
                }
                if (response.headers.get("content-type").includes("application/json")) {
                    return response.json();
                } else {
                    throw new Error("Not Json");
                }
            })
            .then(model => {
                if (model.hasOwnProperty('success') && model.hasOwnProperty('data') && model.hasOwnProperty('reason')) {
                    if (!model['success']) {
                        //发生业务错误时的统一处理方法
                        if (this.hasOwnProperty("onBusinessError") && typeof this.onBusinessError === 'function') {
                            this.onBusinessError(model);
                        }
                    }
                    return model;
                } else {
                    if (hanwinApiRequest.config.verifyModel) {
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
 * @class HanwinApiRequest
 */
export class HanwinApiRequest {
    constructor(url) {
        this.config = {
            url: url,
            method: "GET",
            urlSearchParams: null,
            headers: new Headers(),
            body: null,
            verifyModel: false
        };
    }

    get() {
        this.config.method = "GET";
        return this;
    }

    post() {
        this.config.method = "POST";
        return this;
    }

    search(urlSearchParams) {
        if (urlSearchParams instanceof URLSearchParams && urlSearchParams.keys > 0) {
            this.config.url = this.config.url + '?' + urlSearchParams.toString()
        };
        return this;
    }

    headers(headers) {
        if (headers instanceof Headers) {
            this.config.headers = headers;
        }
        return this;
    }

    data(data) {
        this.config.body = data instanceof URLSearchParams ? data : JSON.stringify(data);
        return this;
    }

    verifyModel(verifyModel) {
        this.config.verifyModel = verifyModel;
        return this;
    }

}