

# SSL Helper - SSL Cert Apply Agent on CloudFlare Worker

# SSL证书助手 - 基于CF Worker 的SSL证书代理申请平台



## 项目介绍

SSL证书助手是一个免费、开源的全自动化SSL证书申请和下发平台，依托于Cloudflare运行，本平台通过自动化CNAME和DNS操作，全自动验证域名DNS申请SSL证书，并自动下发到服务器，本项目优势：

1. 不依赖服务器即可部署，支持私有化部署，依托于CloudFlare Worker，**完全免费**
2. 支持手动验证和自动化验证（DCV代理），**只需设置一次CNAME记录一直可以使用**
3. 支持`Let's Encrypt`、`ZeroSSL`、`Google Trust Service`、`SSL.com`等证书提供商

### 演示地址

- https://newssl.524228.xyz/

## 网页展示

<img src="img/QQ20250506-153642.png" alt="QQ20250506-153642" style="zoom:50%;" />

<img src="img/QQ20250506-153705.png" alt="QQ20250506-153705" style="zoom:67%;" />

## 使用方式

### 克隆代码

```shell
git clone https://github.com/PIKACHUIM/CFWorkerACME.git
```

### 修改配置

- #### 复制文件

```shell
cp wrangler.example.jsonc wrangler.jsonc
```

- #### 修改配置

  修改`wrangler.jsonc`

```json
{
  "vars": {
    "MAIL_KEYS": "",
    "MAIL_SEND": "noreply@example.com",
    "SIGN_AUTH": "",
    "DCV_AGENT": "",
    "DCV_EMAIL": "account@example.com",
    "DCV_TOKEN": "",
    "DCV_ZONES": "",
    "GTS_useIt": "",
    "GTS_keyMC": "",
    "GTS_keyID": "",
    "GTS_KeyTS": "",
    "SSL_useIt": "true",
    "SSL_keyMC": "",
    "SSL_keyID": "",
    "SSL_KeyTS": "",
    "ZRO_useIt": "true",
    "ZRO_keyMC": "",
    "ZRO_keyID": "",
    "ZRO_KeyTS": ""

  },
  "d1_databases": [
    {
      "binding": "DB_CF",
      "database_name": "***********",
      "database_id": "***************************"
    }
  ]
}

```

- #### 参数说明

| 名称      | 类型   | 说明                                                         | 示例/备注                                                    |
| --------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| MAIL_KEYS | string | Resend密钥：[API Keys · Resend](https://resend.com/api-keys) | re_wvRR+z5AqmL3rAXp8CQW0BWKX                                 |
| MAIL_SEND | string | Resend邮箱：[API Keys · Resend](https://resend.com/api-keys) | noreply@example.com                                          |
| SIGN_AUTH | string | Cookie/用户验证签名加密固定密钥                              | PCUG8dc9Yal4ufhe2SRn3NJRJ+flg/B42s1uaUNk8p0a0lG2hw34qP       |
| DCV_AGENT | string | CloudFlare DCV代理域名-域名根                                | dcv.example.com                                              |
| DCV_EMAIL | string | CloudFlare DCV代理域名API邮箱                                | user@example.com                                             |
| DCV_TOKEN | string | CloudFlare DCV代理域名APIKey                                 | NiYqP+IVOlCn63ED1W4JXvH+PyaAUNFyoWJ08F13xbbXvCqUb70，查看https://dash.cloudflare.com/profile/api-tokens |
| DCV_ZONES | string | CloudFlare DCV代理域名-区域ID                                | 10a7bab949e8245578235d18da54f1d3，查看https://dash.cloudflare.com/ |
| GTS_useIt | string | Google Trust Service 是否要开启                              | true，使用方式查看 https://cloud.google.com/certificate-manager/docs/public-ca-tutorial?hl=zh-cn |
| GTS_keyMC | string | Google Trust Service EAB-MAC                                 | I828b1O/O+S9Z4uE+v32dudUcUTlWc7iDF7rke+6LT6iwa39EihPS61UadY70xKF |
| GTS_keyID | string | Google Trust Service EAB账号ID                               | ede55645ca95b5ce89ceb8a8c047132c                             |
| GTS_KeyTS | string | Google Trust Service ACME密钥                                | -----BEGIN PRIVATE KEY----.....                              |
| SSL_useIt | string | SSL.com ACME 服务是否要开启                                  | true，获取：https://secure.ssl.com/account                   |
| SSL_keyMC | string | SSL.com ACME 服务 EAB-MAC                                    | I828b1O/O+S9Z4uE+v32dudUcUTlWc7iDF7rke+6LT6iwa39EihPS61UadY70xKF |
| SSL_keyID | string | SSL.com ACME 服务 EAB账号ID                                  | ede55645ca95b5ce89ceb8a8c047132c                             |
| SSL_KeyTS | string | SSL.com ACME 服务 ACME密钥                                   | -----BEGIN PRIVATE KEY----.....                              |
| ZRO_useIt | string | ZeroSSL ACME服务 是否要开启                                  | true，获取：[Developer - ZeroSSL](https://app.zerossl.com/developer) |
| ZRO_keyMC | string | ZeroSSL ACME服务  EAB-MAC                                    | I828b1O/O+S9Z4uE+v32dudUcUTlWc7iDF7rke+6LT6iwa39EihPS61UadY70xKF |
| ZRO_keyID | string | ZeroSSL ACME服务  EAB账号ID                                  | ede55645ca95b5ce89ceb8a8c047132c                             |
| ZRO_KeyTS | string | ZeroSSL ACME服务  ACME密钥                                   | -----BEGIN PRIVATE KEY----.....                              |



### 测试代码

```shell
npm install
npm run dev
```

### 部署云端


```shell
npm run deploy
```
