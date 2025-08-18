import {serveStatic} from 'hono/cloudflare-workers' // @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'
import * as index from './index'

index.app.use("*", serveStatic({manifest: manifest, root: "./"}));
// export default index.app
index.app.fire()

// 定时任务 ############################################################################################################
export default {
    async fetch(request: Request, env: index.Bindings, ctx: ExecutionContext) {
        return index.app.fetch(request, env, ctx);
    },
    async scheduled(controller: ScheduledController, env: index.Bindings, ctx: ExecutionContext) {
        console.log('Cron job processed');
        try {
            console.log(controller, ctx)

        } catch (error) {
            console.error('Error processing cron job:', error);
        }
    },
};