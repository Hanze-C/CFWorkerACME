import * as acme from 'acme-client';
import * as saves from './saves'
import * as query from "./query";
import {Bindings} from './index'
import {Authorization} from "acme-client";
import {Challenge} from "acme-client/types/rfc8555";


const ssl_provider: Record<string, any> = {
    "lets-encrypt": acme.directory.letsencrypt.staging,
    "google-trust": acme.directory.google.staging,
    "bypass-trust": acme.directory.buypass.staging,
    "zerossl-cert": acme.directory.zerossl.production
}

// 整体处理进程 ====================================================================================
export async function Processing(env: Bindings) {
    let order_list: any = await saves.selectDB(env.DB, "Apply", {flag: {value: 4, op: "!="}});
    for (const id in order_list) { // 获取信息 =====================================================
        let order_info = order_list[id]; // 获取当前订单详细情况
        let order_mail = order_info['mail']; // 当前订单用户邮箱
        let order_user: any = (await saves.selectDB( // 查询申请者信息
            env.DB, "Users", {mail: {value: order_mail}}))[0]; // 按不同阶段分配程序处理 ===========
        if (order_info['flag'] == 0) await newApply(env, order_user, order_info);// 执行创建订单操作
        if (order_info['flag'] == 1) await dnsAuthy(env, order_user, order_info);// 自动执行域名代理
        if (order_info['flag'] == 2) await dnsCheck(env, order_user, order_info);// 自动执行域名验证
        if (order_info['flag'] == 3) await getCerts(env, order_user, order_info);// 自动执行获取证书
    }
}

// 新增证书订单 =====================================================================================
export async function newApply(env: Bindings, order_user: any, order_info: any) {
    // 初始化域名信息 =================================
    let accountPrivate = order_user['keys'];
    let certificateCSR = "";
    let clientsMessage = new acme.Client({
        directoryUrl: ssl_provider[order_info['sign']],
        accountKey: accountPrivate,
    });
    // 处理域名信息 =================================================================================
    let domainsListCSR = [];
    let domainsListSSL = [];
    let domain_all = JSON.parse(order_info['list']);
    for (const uid in domain_all) {
        const domain_now = domain_all[uid];
        if (domain_now['wildcard']) {
            domainsListCSR.push("*." + domain_now['domain']);
            domainsListSSL.push({
                type: domain_now['verification']
                    .split("-")[0], value: "*." + domain_now['domain']
            });
        }
        if (!domain_now['wildcard'] || domain_now['include_root']) {
            domainsListCSR.push(domain_now['domain']);
            domainsListSSL.push({
                type: domain_now['verification']
                    .split("-")[0], value: domain_now['domain']
            });
        }
    }
    // console.log(domainsListCSR, domainsListSSL);
    let privateKeyBuff = null // 私钥创建过程 ===================================================================
    if (order_info['type'] == "rsa2048") privateKeyBuff = await acme.crypto.createPrivateRsaKey(2048);
    if (order_info['type'] == "eccp256") privateKeyBuff = await acme.crypto.createPrivateEcdsaKey('P-256');
    if (order_info['type'] == "eccp384") privateKeyBuff = await acme.crypto.createPrivateEcdsaKey('P-384');
    [privateKeyBuff, certificateCSR] = await acme.crypto.createCsr({ // 创建证书请求 ==================================
        altNames: domainsListCSR,
        commonName: domainsListCSR[0],
        country: order_info['C'],
        state: order_info['S'],
        locality: order_info['ST'],
        organization: order_info['O'],
        organizationUnit: order_info['OU'],
    }, privateKeyBuff);
    // 创建订单 =======================================================================================================
    try {
        clientsMessage.getAccountUrl();
    } catch (e) {
        await clientsMessage.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:' + order_user['mail']],
        });
    }
    const order_data = await clientsMessage.createOrder({identifiers: domainsListSSL});

    // console.log(order_data, authy_list[0], authy_list[0]['challenges']);
    await saves.updateDB(env.DB, "Apply", {data: JSON.stringify(order_data)}, {uuid: order_info['uuid']})
    await saves.updateDB(env.DB, "Apply", {keys: privateKeyBuff.toString()}, {uuid: order_info['uuid']})
    await saves.updateDB(env.DB, "Apply", {csrs: certificateCSR.toString()}, {uuid: order_info['uuid']})
    await saves.updateDB(env.DB, "Apply", {flag: 1}, {uuid: order_info['uuid']})
}

// 自动验证代理 ====================================================================================
export async function dnsAuthy(env: Bindings, order_user: any, order_info: any) {


    // try {
    //     const response = await fetch(
    //         `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records`,
    //         {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
    //                 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY
    //             },
    //             body: JSON.stringify({
    //                 comment: 'Domain verification record',
    //                 content: '198.51.100.4',
    //                 name: 'example.com',
    //                 proxied: true,
    //                 ttl: 3600,
    //                 type: 'A'
    //             })
    //         }
    //     );
    //
    //     const data = await response.json();
    //     console.log('Success:', data);
    // } catch (error) {
    //     console.error('Error:', error);
    // }
    // console.log(order_info);
    await saves.updateDB(env.DB, "Apply", {flag: 2}, {uuid: order_info['uuid']})
}

// 执行域名验证 ====================================================================================
export async function dnsCheck(env: Bindings, order_user: any, order_info: any) {
    let domain_list = order_info['list'];
    let orders_data = JSON.parse(order_info['data'])
    let client_data = new acme.Client({
        directoryUrl: ssl_provider[order_info['sign']],
        accountKey: order_user['keys'],
    });
    try {
        client_data.getAccountUrl();
    } catch (e) {
        await client_data.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:' + order_user['mail']],
        });
    }
    orders_data = await client_data.getOrder(orders_data); // 获取授权信息
    // console.log(orders_data);
    let author_list: Authorization[] = await client_data.getAuthorizations(orders_data); // 获取授权信息
    // console.log(author_list);
    for (const author_data of author_list) {
        console.log(author_data);
        // 待验证信息 =====================================
        const author_info: any = author_data['identifier'];
        const author_name: string = author_info['value'];
        const author_type: string = author_info['type'];
        const challenge: Challenge | undefined = author_data.challenges.find(c => c.type === "dns-01");
        if (challenge == undefined) {
            continue
        }
        const keyAuthorization = await client_data.getChallengeKeyAuthorization(challenge);
        console.log("keyAuthorization: ", challenge);
        const domain = '_acme-challenge.524229.xyz';
        await query.queryDNS(domain).then((records) => {
            console.log('TXT Records for', domain, ':');
            records.forEach((record) => {
                console.log(record);
            });
        });
        // try {
        //     const result = await client_data.completeChallenge(challenge);
        //     console.log('Challenge completed:', result);
        // }
        // catch (e) {
        //     console.error('Challenge Failed:', e);
        //     // const result = await client_data.deactivateAuthorization(challenge);
        //     // console.log('Deactivate Authorization:', result);
        // }
        // try {
        //     await client_data.waitForValidStatus(challenge);
        //     console.log('Challenge status is valid');
        // }
        // catch (e) {
        //     console.error(e);
        // }

        // const { challenges } = author_data;
        // const key = await client_data.getChallengeKeyAuthorization(author_data);
        // await client_data.verifyChallenge(author_data, author_data);
    }

    // // 完成验证
    // await client.completeChallenge(challenge);
    // // 等待验证状态变为有效
    // await client.waitForValidStatus(challenge);
    // // 验证验证是否通过
    // const isValid = (challenge.status === 'valid');
    // console.log(`Challenge is valid: ${isValid}`);
    // // 最终确认订单
    // await client.finalizeOrder(order, certificateRequest);
    // // 获取证书
    // const certificate = await client.getCertificate(order);
    // return { certificate, certificateKey };
}


// 完成证书申请 ====================================================================================
export async function getCerts(env: Bindings, order_user: any, order_info: any) {

}


let temp = [
    {
        "name": "example.com",
        "wild": true,
        "root": true,
        "type": "dns-self",
        "flag": 0,
        "text": "",
        "auth": "",
    }
]
