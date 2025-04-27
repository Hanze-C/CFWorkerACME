import * as users from './users';
import * as codes from './codes';
import * as saves from './saves';
import * as local from "hono/cookie";
import {Hono} from 'hono'
import {serveStatic} from 'hono/cloudflare-workers' // @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'


// 绑定数据 ###############################################################################
type Bindings = { DB: D1Database, MAIL_KEYS: String, MAIL_SEND: String }
const app = new Hono<{ Bindings: Bindings }>()
app.use("*", serveStatic({manifest: manifest, root: "./"}));

// 获取信息 ###############################################################################
app.get('/users', async (c) => {
    return c.json({})
});

// 获取种子 ###############################################################################
app.get('/nonce/', async (c) => {
    return c.json(await users.getNonce(c));
});

// 核查状态 ###############################################################################
app.get('/panel/', async (c) => {
    if (!await users.userAuth(c)) c.redirect("/login.html", 302);
    return c.redirect("/panel.html", 302);
})


// 核查状态 ###############################################################################
app.use('/apply/', async (c) => {
    if (c.req.method !== 'POST') return c.json({"flags": 1, "texts": "请求方式无效"}, 400);
    if (!await users.userAuth(c)) return c.json({"flags": 2, "texts": "用户尚未登录"}, 401);
    // 读取数据
    try {
        let upload_json = await c.req.json();
        console.log(upload_json);
        await saves.insertDB(c, "Apply", {
            uuid: await users.newNonce(16),
            mail: local.getCookie(c, 'mail'),
            sign: upload_json['globals']['ca'],
            type: upload_json['globals']['encryption'],
            auto: upload_json['globals']['auto_renew'],
            flag: 0,
            time: Date.now(),
            main: JSON.stringify(upload_json['subject']),
            list: JSON.stringify(upload_json['domains']),
            keys: "",
            cert: "",
        })
    } catch (error) {
        return c.json({"flags": 3, "texts": "请求数据无效: " + error}, 400);
    }
    return c.json({"flags": 0, "texts": "证书申请成功", "order": "000000"}, 200);
})


// 用户注册 ###############################################################################
app.get('/setup/', async (c) => {
    return users.userRegs(c);
})

// 用户登录 ###############################################################################
app.get('/login/', async (c) => {
    return users.userPost(c)
})

// 退出登录 ###############################################################################
app.get('/exits', async (c) => {
    return users.userExit(c)
})


export default app
