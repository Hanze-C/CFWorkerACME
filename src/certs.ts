import * as acme from 'acme-client';
import * as saves from './saves'
import * as query from "./query";
import {Bindings} from './index'
import {Authorization, Client} from "acme-client";
import {Challenge} from "acme-client/types/rfc8555";
import {hmacSHA2} from "./users";


const ssl: Record<string, any> = {
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
            env.DB, "Users", {mail: {value: order_mail}}))[0]; // 按不同阶段分配程序处理 ====
        if (order_info['flag'] == 0) await newApply(env, order_user, order_info);// 执行创建订单操作
        if (order_info['flag'] == 1) await dnsAuthy(env, order_user, order_info);// 自动执行域名代理
        if (order_info['flag'] == 3) await dnsCheck(env, order_user, order_info);// 自动执行域名验证
        if (order_info['flag'] == 4) await getCerts(env, order_user, order_info);// 自动执行获取证书
    } // ===========================================================================================
}

// 新增证书订单 =====================================================================================
export async function newApply(env: Bindings, order_user: any, order_info: any) {
    // 获取申请域名信息 =============================================================================
    let client_data: any = await getStart(env, order_user, order_info); // 获取域名证书的申请操作接口
    let domain_list: any = await getNames(order_info, true) // 获取当前申请域名的详细信息和类型
    let orders_data: any = JSON.stringify(await client_data.createOrder({identifiers: domain_list}));
    // 写入订单详细数据 =============================================================================
    await saves.updateDB(env.DB, "Apply", {data: orders_data}, {uuid: order_info['uuid']})
    await saves.updateDB(env.DB, "Apply", {flag: 1}, {uuid: order_info['uuid']}) // 更改状态码
    // ==============================================================================================
}

// 自动验证代理 =====================================================================================
export async function dnsAuthy(env: Bindings, order_user: any, order_info: any) {
    let domain_list: any = order_info['list'];
    let orders_text: any = JSON.parse(order_info['data'])
    let client_data: any = await getStart(env, order_user, order_info);
    let orders_data: any = await client_data.getOrder(orders_text); // 获取授权信息
    // console.log(domain_list, orders_data);
    let author_save: Record<string, any> = {};
    let author_list: Authorization[] = await client_data.getAuthorizations(orders_data); // 获取授权
    // 执行验证部分 ================================================================================
    for (const author_data of author_list) {
        // console.log(author_data);
        // 待验证信息 =====================================
        const author_info: any = author_data['identifier'];
        const author_name: string = author_info['value'];
        const author_type: string = author_info['type'];
        const challenge: Challenge | undefined = author_data.challenges.find(c => c.type === "dns-01");
        if (challenge == undefined) continue
        const keyAuthorization = await client_data.getChallengeKeyAuthorization(challenge);
        console.log(author_name, author_type, challenge['token']);
        author_save[author_name] = challenge['token']
    }
    let domain_save: any[] = []
    for (let domain_item of JSON.parse(domain_list)) {
        let domain_name = domain_item.name;
        if (author_save[domain_name] == undefined) continue;
        domain_item['auth'] = author_save[domain_name];
        if (domain_item['type'] == "dns-auto") {
            let domain_auto = await hmacSHA2(domain_name, order_user['mail'])
            domain_item['auto'] = domain_auto.substring(0, 16) + "." + env.DCV_AGENT
            console.log(domain_item['auto'])
            try {
                const response = await fetch(
                    `https://api.cloudflare.com/client/v4/zones/${env.DCV_ZONES}/dns_records`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Email': env.DCV_EMAIL,
                            'X-Auth-Key': env.DCV_TOKEN,
                        },
                        body: JSON.stringify({
                            comment: 'DCV-Agent#' + Date.now() + '@' + domain_name,
                            content: domain_item['auth'],
                            name: domain_item['auto'] + env.DCV_AGENT,
                            ttl: 60,
                            type: 'TXT'
                        })
                    }
                );
                const data = await response.json();
                console.log('Success:', data);
            } catch (error) {
                console.error('Error:', error);
            }
        }
        domain_save.push(domain_item);
    }
    await saves.updateDB(env.DB, "Apply", {list: JSON.stringify(domain_save)}, {uuid: order_info['uuid']})
    console.log(domain_save);
    await saves.updateDB(env.DB, "Apply", {flag: 2}, {uuid: order_info['uuid']})
}

// 执行域名验证 ====================================================================================
export async function dnsCheck(env: Bindings, order_user: any, order_info: any) {
    let domain_list: any = order_info['list'];
    let orders_text: any = JSON.parse(order_info['data'])
    let client_data: any = await getStart(env, order_user, order_info);
    let orders_data = await client_data.getOrder(orders_text); // 获取授权信息
    let domain_save: any[] = []
    for (let domain_item of JSON.parse(domain_list)) {
        let domain_name = domain_item.name;
        let author_text = domain_item.auth;
        let domain_type = "TXT"
        if (domain_item.type == "dns-auto") {
            domain_type = "CNAME"
            author_text = domain_item.auto
        }
        await query.queryDNS("_acme-challenge." + domain_name, domain_type).then((records) => {
            console.log('Records for', domain_name, ':');
            records.forEach((record) => {
                console.log(record);
            });
        });
    }

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


// 完成证书申请 #######################################################################################################
export async function getCerts(env: Bindings, order_user: any, order_info: any) {
    let domainsListCSR: any = await getNames(order_info, false);
    let privateKeyText = null // 私钥创建过程 ===================================================================
    if (order_info['type'] == "rsa2048") privateKeyText = await acme.crypto.createPrivateRsaKey(2048);
    if (order_info['type'] == "eccp256") privateKeyText = await acme.crypto.createPrivateEcdsaKey('P-256');
    if (order_info['type'] == "eccp384") privateKeyText = await acme.crypto.createPrivateEcdsaKey('P-384');
    let [privateKeyBuff, certificateCSR] = await acme.crypto.createCsr({ // 创建证书请求 ==============================
        altNames: domainsListCSR, commonName: domainsListCSR[0], country: order_info['C'], state: order_info['S'],
        locality: order_info['ST'], organization: order_info['O'], organizationUnit: order_info['OU'],
    }, privateKeyText);
    await saves.updateDB(env.DB, "Apply", {keys: privateKeyBuff.toString()}, {uuid: order_info['uuid']})
    await saves.updateDB(env.DB, "Apply", {csrs: certificateCSR.toString()}, {uuid: order_info['uuid']})
}

// 获取域名信息 ####################################################################################
async function getNames(order_info: any, full: boolean = false) {
    // 处理域名信息 ================================================================================
    let domain_save: string[] | Record<string, any> = [];
    let domain_data = JSON.parse(order_info['list']);
    for (const uid in domain_data) {
        const domain_now = domain_data[uid];
        console.log("domain_now: ", domain_now);
        const author_now = domain_now['type'].split("-")[0]
        if (domain_now['wildcard']) { // 先处理通配符的情况 ===================================
            if (full) domain_save.push({type: author_now, value: "*." + domain_now['name']});
            else domain_save.push("*." + domain_now['name']);
        } // 如果不是通配符，或者通配符勾选了根域名的情况，也要添加域名本身 ===================
        if (!domain_now['wild'] || domain_now['root']) {
            if (full) domain_save.push({type: author_now, value: domain_now['name']});
            else domain_save.push(domain_now['name']);
        }
    }
    return domain_save;
}

// 获取操作接口 ####################################################################################
async function getStart(env: Bindings, order_user: any, order_info: any) {
    let client_data: Client = new acme.Client({
        directoryUrl: ssl[order_info['sign']],
        accountKey: order_user['keys'],
    });
    try { // 获取账户信息 ================================
        client_data.getAccountUrl();
    } catch (e) { // 尝试创建账户 ========================
        await client_data.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:' + order_user['mail']],
        });
    }
    return client_data;
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
