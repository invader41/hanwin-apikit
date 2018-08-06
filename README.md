# hanwin-apikit

同时支持微信小程序和一般浏览器的 Restful Http Client。

## 安装

```
npm install hanwin-apikit
```

或者直接引用 src 文件夹中的文件

## 基本用法

基础客户端（client.js）构造函数：

```js
let apiClient = new HanwinApiClient({
    mode: 'browser', //默认browser，小程序'mp'
    baseUrl: 'http://xxx', //host
    onBusinessError: model => {
        //业务错误handler
    },
    onUnauthorized: response => {
        //401验证错误handler
    },
    assignDigest: () => {
        //用于加密的http header 验证实现 Sample
        var timestamp = (Math.round(new Date().getTime() / 1000) + 28800).toString();
        var nonce = newGuid();
        var signature = hex_md5("" + timestamp + nonce).toUpperCase();
        return {
            timestamp,
            nonce,
            signature
        }
    },
    isTokenExp = function (token) {
        //判断token是否过期，注意token为null或者解析错误时，返回false
        return false;
    },
    onTokenExp = (request) => {
        //token过期时的处理函数，requset:过期前的最后一个请求
        this.token = null;
        // 重试获取token并继续上一个请求,返回值为Promise
        return new Promise();
    }
});
```

Api 配置文件构造函数：

```js
export class ApiProvider {
  //token以及POST方法
  static token(username, password) {
    let headers = {
      "content-type": "application/x-www-form-urlencoded"
    };

    let data = new URLSearchParams();
    data.set("grant_type", "password");
    data.set("username", username);
    data.set("password", password);

    return new HanwinApiRequest("/api/Token")
      .post()
      .data(data)
      .headers(headers)
      .verifyModel(false);
  }

  //get方法
  static getUserInfo() {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.set("id", "1");
    return new HanwinApiRequest("/api/app/user/get_user_info").search(
      urlSearchParams
    );
  }
}
```

请求 api：

```js
let doLogin = function() {
  this.apiClient
    .request(ApiProvider.token(this.username, this.password))
    .then(model => {
      console.log(model);
      this.apiClient.token = model.access_token;
    })
    .catch(error => {
      console.log(error);
    });
};
let getUserInfo = function() {
  this.apiClient
    .request(ApiProvider.getUserInfo())
    .then(model => {
      alert(model.data.name);
    })
    .catch(error => {
      console.log(error);
    });
};
```

## 集成 OAuth&JWT 验证的客户端

集成 OAuth&JWT 验证的客户端（client-oauth.js）构造函数：

```js
let oauthApiClient = new HanwinOAuthApiClient({
  mode: "browser", //默认browser，小程序'mp'
  baseUrl: "http://xxx", //host
  tokenUrl: "/api/Token", //token获取地址
  credentialsProvider: () => {
    //提供缓存的token凭证（用户名密码）,小程序使用wx.getStorageSync()
    return {
      grant_type: "password",
      username: sessionStorage.getItem("hanwinUsername"),
      password: sessionStorage.getItem("hanwinPassword")
    };
  },
  onBusinessError: model => {
    //业务错误handler
  },
  onUnauthorized: response => {
    //401验证错误handler
  },
  assignDigest: () => {
    //用于加密的http header 验证实现 Sample
    var timestamp = (
      Math.round(new Date().getTime() / 1000) + 28800
    ).toString();
    var nonce = newGuid();
    var signature = hex_md5("" + timestamp + nonce).toUpperCase();
    return {
      timestamp,
      nonce,
      signature
    };
  }
});
```

使用：

```js
let doLoginWithOAuth = function() {
  //单页面应用用sessionStorage/localStorage，小程序使用wx.getStorageSync(), 其他自行存储凭据
  sessionStorage.setItem("hanwinUsername", this.username);
  sessionStorage.setItem("hanwinPassword", this.password);
  this.oauthApiClient.requestToken().then(() => {});
};
let getUserInfoWithOAuth = function() {
  this.oauthApiClient
    .request(ApiProvider.getUserInfo())
    .then(model => {
      alert(model.data.name);
    })
    .catch(error => {
      console.log(error);
    });
};
```
