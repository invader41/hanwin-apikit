import {
    URLSearchParams
} from "./url-search-params-polyfill.js";
/**
 * Api客户端
 * 配置项：
 * config:{
 *   mode 模式默认“browser”，小程序“mp”
 *   baseUrl 服务器地址
 *   tokenScheme 默认bearer
 *   commonHeader 统一http header
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
        this.mode = "browser";
        this.tokenScheme = "bearer";
        if (typeof config === 'string') {
            this.baseUrl = config;
        };
        if (typeof config === 'object') {
            this.baseUrl = config.baseUrl;
            this.mode = config.mode ? config.mode : 'browser';
            this.tokenScheme = config.tokenScheme ? config.tokenScheme : 'bearer';
            config.commonHeader ? this.commonHeader = config.commonHeader : false;
            config.onBusinessError ? this.onBusinessError = config.onBusinessError : false;
            config.onUnauthorized ? this.onUnauthorized = config.onUnauthorized : false;
            config.isTokenExp ? this.isTokenExp = config.isTokenExp : false;
            config.onTokenExp ? this.onTokenExp = config.onTokenExp : false;
        }
    }

    get token() {
        if (typeof wx === 'object') {
            return wx.getStorageSync(this.tokenLocalStorageKey) ? wx.getStorageSync(this.tokenLocalStorageKey) : '';
        } else {
            return localStorage.getItem(this.tokenLocalStorageKey) ? localStorage.getItem(this.tokenLocalStorageKey) : '';
        }
    }
    set token(v) {
        if (typeof wx === 'object') {
            wx.setStorageSync(this.tokenLocalStorageKey, v);
        } else {
            localStorage.setItem(this.tokenLocalStorageKey, v);
        }
    }

    get baseUrl() {
        if (typeof wx === 'object') {
            return wx.getStorageSync(this.baseUrlLocalStorageKey) ? wx.getStorageSync(this.baseUrlLocalStorageKey) : '';
        } else {
            return localStorage.getItem(this.baseUrlLocalStorageKey) ? localStorage.getItem(this.baseUrlLocalStorageKey) : '';
        }
    }
    set baseUrl(v) {
        if (typeof wx === 'object') {
            wx.setStorageSync(this.baseUrlLocalStorageKey, v);
        } else {
            localStorage.setItem(this.baseUrlLocalStorageKey, v);
        }
    }

    /**
     * 发送请求
     *
     * @param {*} hanwinApiRequest
     * @param {string} [mode="browser"] browser:浏览器，mp:小程序
     * @returns
     * @memberof HanwinApiClient
     */
    request(hanwinApiRequest) {
        if (!hanwinApiRequest instanceof HanwinApiRequest) {
            return new Promise((resolve, reject) => {
                reject("Not HanwinApiConfig");
            });
        }

        hanwinApiRequest.config.headers["Authorization"] = this.tokenScheme + " " + this.token;
        //是否需要摘要认证信息
        if (this.hasOwnProperty("commonHeader") && typeof this.commonHeader === 'function') {
            let commonHeaders = this.commonHeader();
            for (var key in commonHeaders) {
                hanwinApiRequest.config.headers[key] = commonHeaders[key];
            }
        }

        //token过期处理
        if (this.token && this.hasOwnProperty("isTokenExp") && typeof this.isTokenExp === 'function') {
            if (this.isTokenExp(this.token)) {
                if (this.hasOwnProperty("onTokenExp") && typeof this.onTokenExp === 'function') {
                    return this.onTokenExp(hanwinApiRequest);
                }
            }
        }

        let request;
        switch (this.mode) {
            case "browser":
                request = this._browserRequest(hanwinApiRequest);
                break;
            case "mp":
                request = this._mpRequest(hanwinApiRequest);
                break;
            default:
                request = this._browserRequest(hanwinApiRequest);
                break;
        }

        return request.then(model => {
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

    _browserRequest(hanwinApiRequest) {
        let requestConfig = {
            method: hanwinApiRequest.config.method,
            headers: hanwinApiRequest.config.headers,
            body: hanwinApiRequest.config.body,
            mode: 'cors'
        };
        let request = new Request(this.baseUrl + hanwinApiRequest.config.url, requestConfig);
        return fetch(request).then(response => {
            if (response.status === 401) {
                //发生身份验证错误时的统一处理方法
                if (this.hasOwnProperty("onUnauthorized") && typeof this.onUnauthorized === 'function') {
                    this.onUnauthorized(response);
                }
                throw new Error("Unauthorized");
            }
            return response.json();
        });
    }

    _mpRequest(hanwinApiRequest) {
        let url = this.baseUrl + hanwinApiRequest.config.url;
        let data = hanwinApiRequest.config.body instanceof URLSearchParams ? hanwinApiRequest.config.body.toString() : hanwinApiRequest.config.body;
        let promise = new Promise((resolve, reject) => {
            wx.request({
                url: url,
                data: data,
                header: hanwinApiRequest.config.headers,
                method: hanwinApiRequest.config.method,
                success: function (res) {
                    resolve(res);
                },
                error: function (error) {
                    reject(error);
                }
            })
        });
        return promise.then(response => {
            if (response.statusCode === 401) {
                //发生身份验证错误时的统一处理方法
                if (this.hasOwnProperty("onUnauthorized") && typeof this.onUnauthorized === 'function') {
                    this.onUnauthorized(response);
                }
                throw new Error("Unauthorized");
            };
            return response.data;
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
            headers: {},
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
        this.config.headers = headers ? headers : {};
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

// /**
//  * 集成了Token获取，token过期重试的ApiClient子类
//  * config额外参数：{
//  *   tokenUrl: token获取地址
//  *   credentialsProvider: 提供重试时需要的用户名密码等信息的function
//  * }
//  * @export
//  * @class HanwinOAuthApiClient
//  * @extends {HanwinApiClient}
//  */
// export class HanwinOAuthApiClient extends HanwinApiClient {
//     constructor(config) {
//         super(config);

//         this.tokenUrl = config.tokenUrl;
//         this.credentialsProvider = config.credentialsProvider;

//         this.isTokenExp = function (token) {
//             try {
//                 //2591990
//                 return new JWTToken(token).isExpired(10);
//             } catch (error) {
//                 return false;
//             }
//         }

//         this.onTokenExp = (request) => {
//             this.token = null;
//             return this.requestToken().then(token => {
//                 return this.request(request)
//             })
//         }
//     }

//     requestToken(tokenRequest) {
//         let credentials = this.credentialsProvider();

//         let headers = {
//             'content-type': 'application/x-www-form-urlencoded'
//         }

//         let data = new URLSearchParams();
//         for (var key in credentials) {
//             data.append(key, credentials[key]);
//         }

//         let tokenRequest = new HanwinApiRequest(this.tokenUrl).post().data(data).headers(headers).verifyModel(false);

//         return this.request(tokenRequest).then(model => {
//             if (model.hasOwnProperty('access_token')) {
//                 this.token = model.access_token;
//                 return model;
//             } else {
//                 throw new Error("token Error");
//             }
//         });
//     }
// }

export class JWTToken {
    constructor(token) {
        this.token = token;
    }

    /**
     * 获取载荷信息
     */
    get payload() {
        const parts = (this.token || '').split('.');
        if (parts.length !== 3) throw new Error('JWT must have 3 parts');

        const decoded = urlBase64Decode(parts[1]);
        return JSON.parse(decoded);
    }

    /**
     * 检查Token是否过期，`payload` 必须包含 `exp` 时有效
     *
     * @param offsetSeconds 偏移量
     */
    isExpired(offsetSeconds = 0) {
        const decoded = this.payload;
        if (!decoded.hasOwnProperty('exp')) return null;

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);

        return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
    }
}

function urlBase64Decode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0:
            {
                break;
            }
        case 2:
            {
                output += '==';
                break;
            }
        case 3:
            {
                output += '=';
                break;
            }
        default:
            {
                throw new Error(
                    `'atob' failed: The string to be decoded is not correctly encoded.`,
                );
            }
    }
    return b64DecodeUnicode(output);
}

function b64decode(str) {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';

    str = String(str).replace(/=+$/, '');

    for (
        // initialize result and counters
        let bc = 0, bs, buffer, idx = 0;
        // get next character
        (buffer = str.charAt(idx++));
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer &&
        ((bs = bc % 4 ? bs * 64 + buffer : buffer),
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            bc++ % 4) ?
        (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))) :
        0
    ) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
    }
    return output;
}

// https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
function b64DecodeUnicode(str) {
    return decodeURIComponent(
        Array.prototype.map
        .call(b64decode(str), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
}