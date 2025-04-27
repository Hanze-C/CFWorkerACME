-- noinspection SqlNoDataSourceInspectionForFile


CREATE TABLE Users
(
    mail TEXT NOT NULL PRIMARY KEY UNIQUE,
    -- 用户状态 0-未激活，1-正常，2-已禁用
    flag TEXT (1) DEFAULT (0) NOT NULL,
    -- 其他信息 --------------------------
    code TEXT (8), -- 邮箱验证码
    keys TEXT,     -- ACME账号的密钥
    pass TEXT,     -- 登录密码SHA256
    apis TEXT,     -- 证书下载鉴权码
    time INTEGER   -- 邮件验证时间
);


CREATE TABLE Apply
(
    uuid TEXT NOT NULL PRIMARY KEY UNIQUE, -- 申请ID，随机
    mail TEXT    NOT NULL, -- 申请者邮箱，用于索引申请用户
    sign INTEGER (1), -- 执行申请SSL证书的厂商路径完整名称
    type INTEGER (1), -- 证书类型，0-RSA/1-ECC256/2-ECC384
    auto INTEGER (1) NOT NULL DEFAULT (0), -- 是否自动续期
    flag INTEGER (1) NOT NULL DEFAULT (0), -- 证书申请状态
    time INTEGER NOT NULL DEFAULT (0), -- 证书开始申请时间
    main TEXT    NOT NULL, -- 申请证书的主体JSON数据存储位
    list TEXT    NOT NULL, -- 申请证书的域名列表和配置信息
    keys TEXT, -- 证书私钥文件 -- PEM格式 BASE64存储证书体
    cert TEXT  -- 证书签署文件 -- PEM格式 BASE64存储证书体
    -- Flag： 0-待处理 1-待验证 2-验证中 3-申请中 4-已成功
    -- Subject内容: { C: '', S: '', ST: '', O: '', E: '' }
    -- domains内容: [{
    --       domain: 'example.com',
    --       wildcard: false,
    --       include_root: false,
    --       verification: 'dns'
    --     }
    --   ],
);



CREATE TABLE Authy
(
    user INTEGER NOT NULL,
    type INTEGER NOT NULL,
    hash TEXT    NOT NULL,
    time TEXT    NOT NULL,
    name TEXT    NOT NULL,
    data TEXT    NOT NULL
);


-- CreateIndex
CREATE UNIQUE INDEX "Users_mail_key" ON "Users" ("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Authy_hash_key" ON "Authy" ("hash");
