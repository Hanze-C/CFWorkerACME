import * as acme from 'acme-client';
import * as saves from './saves'
import {Context} from "hono";
import {Bindings} from "hono/types";
import {env} from "cloudflare:workers";

export async function Processing(env: Bindings) {
    let order_list = await saves.selectDB(env.DB, "Apply", {flag: {value: 4, op: "!="}});
    // console.log(order_list);
    for (const id in order_list) {
        let order_info = order_list[id];
        let order_uuid = order_info['uuid'];
        let order_mail = order_info['mail'];
        let order_user = (await saves.selectDB(env.DB, "Users", {mail: {value: order_mail}}))[0];
        if (order_info['flag'] == 0) await newApply(env.DB,order_user, order_info) // 执行创建订单
        if (order_info['flag'] == 1) return;
        if (order_info['flag'] == 2) return;
        if (order_info['flag'] == 3) return;
    }
}

export async function newApply(env,order_user: any, order_info: any) {
    let accountPrivate = order_user['keys'];
    let certificateCSR = "";
    let clientsMessage = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.staging,
        accountKey: accountPrivate,
    });
    // 处理域名信息 ===================================================================================================
    let domainsListCSR = [];
    let domainsListSSL = [];
    let domain_all = JSON.parse(order_info['list']);
    for (const uid in domain_all) {
        const domain_now = domain_all[uid];
        if (domain_now['wildcard']) {
            domainsListCSR.push("*." + domain_now['domain']);
            domainsListSSL.push({type: domain_now['verification'].split("-")[0], value: "*." + domain_now['domain']});
        }
        if (!domain_now['wildcard'] || domain_now['include_root']) {
            domainsListCSR.push(domain_now['domain']);
            domainsListSSL.push({type: domain_now['verification'].split("-")[0], value: domain_now['domain']});
        }
    }
    console.log(domainsListCSR, domainsListSSL);
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
        const accountUrl = clientsMessage.getAccountUrl();
    } catch (e) {
        const account = await clientsMessage.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:' + order_user['mail']],
        });
    }
    const order_data = await clientsMessage.createOrder({identifiers: domainsListSSL});
    const authy_list = await clientsMessage.getAuthorizations(order_data); // 获取授权信息
    console.log(order_data, authy_list[0], authy_list[0]['challenges']);
    await saves.updateDB(env.DB,"Apply",)
}


/*
acme.directory.buypass.staging;
acme.directory.buypass.production;

acme.directory.google.staging;
acme.directory.google.production;

acme.directory.letsencrypt.staging;
acme.directory.letsencrypt.production;

acme.directory.zerossl.production;
*/
