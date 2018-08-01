import {
    HanwinApiClient,
    HanwinApiConfig
} from "../index.js";
import {
    hex_md5
} from "./md5.js";

/**
 * api配置中心
 *
 * @export
 * @class ApiProvider
 */
export class ApiProvider {
    static token(username, password) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded')

        let data = new URLSearchParams();
        data.append('grant_type', 'app_login');
        data.append('username', username);
        data.append('password', password);

        return new HanwinApiConfig('/api/Token', "POST", null, data, headers, false);
    }

    static getUserInfo() {
        return new HanwinApiConfig('/api/app/user/get_user_info');
    }
}

let newGuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let apiClient = new HanwinApiClient('http://service.hanwintech.com:9002');

apiClient.onUnauthorized = response => {
    console.log(response);
    alert("账号验证出错");
}

apiClient.onBusinessError = model => {
    alert("这是一个业务错误！json:" + model)
}

/**
 * 指纹身份验证实现
 *
 * @returns
 */
apiClient.assignCredential = () => {
    var timestamp = (Math.round(new Date().getTime() / 1000) + 28800).toString();
    var nonce = newGuid();
    var signature = hex_md5("sipmch2017" + timestamp + nonce).toUpperCase();
    return {
        timestamp,
        nonce,
        signature
    }
}

var app = new Vue({
    el: '#app',
    data: {
        username: '',
        password: '',
        userInfo: {},
        apiClient: apiClient
    },
    methods: {
        doLogin: function () {
            this.apiClient.request(ApiProvider.token(this.username, this.password)).then(model => {
                console.log(model);
                this.apiClient.token = model.access_token;
            }).catch(error => {
                console.log(error);
            })
        },
        getUserInfo: function () {
            this.apiClient.request(ApiProvider.getUserInfo()).then(model => {
                alert(model.data.name);
            }).catch(error => {
                console.log(error);
            })
        }
    }
})