import {Hono} from 'hono'
import setup from './setup'
import users from './fetch'
import {serveStatic} from 'hono/cloudflare-workers' // @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'
// import 'mdui/mdui.css';
// import 'mdui';

type Bindings = {
    DB: D1Database
}
const app = new Hono<{ Bindings: Bindings }>()
// app.use("*", serveStatic({manifest: manifest, root: "./"}));
// 创建表路由（初始化用）
app.get('/setup',  (c) => setup(c));
app.get('/users',  (c) => users(c));
app.get('/', (c) => {
    return c.text('Hello Hono!')
})

export default app
