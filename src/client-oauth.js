import {
    URLSearchParams
} from "./url-search-params-polyfill.js";
import {
    HanwinApiRequest,
    HanwinApiClient
} from "./client.js";

/**
 * 集成了Token获取，token过期重试的ApiClient子类
 * config额外参数：{
 *   tokenUrl: token获取地址
 *   credentialsProvider: 提供重试时需要的用户名密码等信息的function
 * }
 * @export
 * @class HanwinOAuthApiClient
 * @extends {HanwinApiClient}
 */
export class HanwinOAuthApiClient extends HanwinApiClient {
    constructor(config) {
        super(config);

        this.tokenUrl = config.tokenUrl;
        this.credentialsProvider = config.credentialsProvider;

        this.isTokenExp = function (token) {
            try {
                //2591990
                return new JWTToken(token).isExpired(10);
            } catch (error) {
                return false;
            }
        }

        this.onTokenExp = (request) => {
            this.token = null;
            return this.requestToken().then(token => {
                return this.request(request)
            })
        }
    }

    requestToken() {
        let credentials = this.credentialsProvider();

        let headers = {
            'content-type': 'application/x-www-form-urlencoded'
        }

        let data = new URLSearchParams();
        for (var key in credentials) {
            data.append(key, credentials[key]);
        }

        let tokenRequest = new HanwinApiRequest(this.tokenUrl).post().data(data).headers(headers).verifyModel(false);

        return this.request(tokenRequest).then(model => {
            if (model.hasOwnProperty('access_token')) {
                this.token = model.access_token;
                return model;
            } else {
                throw new Error("token Error");
            }
        });
    }
}

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