import * as users from './users';
import * as saves from './saves';
import * as certs from './certs';
import * as local from "hono/cookie";
import {Hono} from 'hono'
import {serveStatic} from 'hono/cloudflare-workers' // @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'


// 绑定数据 ###############################################################################
export type Bindings = {
    DB: D1Database, MAIL_KEYS: string, MAIL_SEND: string,
    DCV_AGENT: string, DCV_EMAIL: string, DCV_TOKEN: string, DCV_ZONES: string
}
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


// 申请证书 ###############################################################################
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
        let uuid = await users.newNonce(16)
        await saves.insertDB(c.env.DB, "Apply", {
            uuid: uuid,
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
        return c.json({"flags": 0, "texts": "证书申请成功", "order": uuid}, 200);
    } catch (error) {
        return c.json({"flags": 3, "texts": "请求数据无效: " + error}, 400);
    }
})

// 获取订单 ###############################################################################
app.use('/order/', async (c) => {
    if (c.req.method !== 'GET') return c.json({"flags": 1, "texts": "请求方式无效"}, 400);
    if (!await users.userAuth(c)) return c.json({"flags": 2, "texts": "用户尚未登录"}, 401);
    let order_uuid: string = <string>c.req.query('id'); // 邮件明文索引用户
    let user_email: string | undefined = local.getCookie(c, 'mail')
    if (!order_uuid) return c.json({"flags": 5, "texts": "订单ID不存在"}, 401);
    if (!user_email) return c.json({"flags": 4, "texts": "用户尚未登录"}, 401);
    // 读取数据
    try {
        let order_data: Record<string, any> = await saves.selectDB(
            c.env.DB, "Apply", {uuid: {value: order_uuid}, mail: {value: user_email}});
        if (order_data.length < 1) return c.json({"flags": 6, "texts": "请求订单不存在"}, 400);
        let order_save: any = order_data[0];
        // delete order_save.keys;
        return c.json({"flags": 0, "texts": "获取证书成功", "order": order_save}, 200);
    } catch (error) {
        return c.json({"flags": 3, "texts": "请求数据无效: " + error}, 400);
    }
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
    await certs.Processing(c.env);
    return c.json({})
})

app.fire()
// 定时任务 ############################################################################################################
export default {
    async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
        return app.fetch(request, env, ctx);
    },
    async scheduled(controller: ScheduledController, env: Bindings, ctx: ExecutionContext) {
        if (!controller) console.log(controller, ctx)
        console.log('Cron job is going to process');
        try {
            await certs.Processing(env);
        } catch (error) {
            console.error('Error when process cron jobs', error);
        }
    },
};
