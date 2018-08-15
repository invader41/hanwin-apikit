import {
    HanwinApiClient,
    HanwinApiRequest,
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
        let headers = {
            'content-type': 'application/x-www-form-urlencoded'
        }

        let data = new URLSearchParams();
        data.append('grant_type', 'app_login');
        data.append('username', username);
        data.append('password', password);

        return new HanwinApiRequest('/api/Token').post().data(data).headers(headers).verifyModel(false);
    }

    static getUserInfo() {
        return new HanwinApiRequest('/api/app/user/get_user_info');
    }
}

let newGuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let apiClient = new HanwinApiClient({
    baseUrl: '',
    onBusinessError: model => {
        alert("这是一个业务错误！json:" + model)
    },
    onUnauthorized: response => {
        console.log(response);
        alert("账号验证出错");
    },
    commonHeader: () => {
        //指纹身份验证实现
        var timestamp = (Math.round(new Date().getTime() / 1000) + 28800).toString();
        var nonce = newGuid();
        var signature = hex_md5("sipmch2017" + timestamp + nonce).toUpperCase();
        return {
            timestamp,
            nonce,
            signature
        }
    }
});


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
                })
                .catch(error => {
                    console.log(error);
                })
        },
        getUserInfo: function () {
            this.apiClient.request(ApiProvider.getUserInfo()).then(model => {
                    alert(model.data.name);
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }
})