import * as users from './users';
import * as saves from './saves';
import * as certs from './certs';
import * as local from "hono/cookie";
import {Context, Hono} from 'hono'
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
        let domain_list = upload_json['domains'];
        let domain_save = []
        for (let domain in domain_list) {
            // console.log(domain,domain_list[domain]);
            domain_list[domain]["flag"] = 0;
            domain_list[domain]["text"] = "";
            domain_save.push(domain_list[domain]);
        }
        // console.log(domain_save);
        await saves.insertDB(c, "Apply", {
            uuid: await users.newNonce(16),
            mail: local.getCookie(c, 'mail'),
            sign: upload_json['globals']['ca'],
            type: upload_json['globals']['encryption'],
            auto: upload_json['globals']['auto_renew'],
            flag: 0,
            time: Date.now(),
            main: JSON.stringify(upload_json['subject']),
            list: JSON.stringify(domain_save),
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

// 退出登录 ###############################################################################
app.get('/tests/', async (c) => {
    await certs.Processing(c);
    return c.json({})
})

app.fire()
// 定时任务 ############################################################################################################
export default {
    async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
        return app.fetch(request, env, ctx);
    },
    async scheduled(controller: ScheduledController, env: Bindings, ctx: ExecutionContext) {
        console.log('Cron job is going to process');
        try {
            await certs.Processing(null, env);
        } catch (error) {
            console.error('Error when process cron jobs', error);
        }
    },
};
