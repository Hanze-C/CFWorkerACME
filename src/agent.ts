import {Bindings} from "./index";

export async function dnsAdd(env: Bindings, domain_item: any, domain_name: string) {
    return dnsAPI(
        "POST", `https://api.cloudflare.com/client/v4/zones/${env.DCV_ZONES}/dns_records`,
        {
            'Content-Type': 'application/json',
            'X-Auth-Email': env.DCV_EMAIL,
            'X-Auth-Key': env.DCV_TOKEN,
        },
        JSON.stringify({
            comment: 'DCV-Agent#' + Date.now() + '@' + domain_name,
            content: domain_item['auth'],
            name: domain_item['auto'],
            ttl: 60,
            type: 'TXT'
        }))
}

export async function dnsDel(env: Bindings, domain_name: string, domain_type: string = "TXT") {
    let domain_uuid: string = await dnsUID(env, domain_name, domain_type);
    return await uidDel(env, domain_uuid);

}

export async function dnsUID(env: Bindings, domain_name: string, domain_type: string = "TXT") {
    let domain_list: Record<string, any> = await dnsAll(env);
    let domain_uuid = "";
    for (const domain_item of domain_list['result']) {
        // console.log(domain_item['name'], domain_name);
        if (domain_item['name'] === domain_name
            && domain_item.type == domain_type) {
            domain_uuid = domain_item['id'];
            break;
        }
    }
    return domain_uuid;
}

export async function dnsAll(env: Bindings) {
    return dnsAPI(
        "GET", `https://api.cloudflare.com/client/v4/zones/${env.DCV_ZONES}/dns_records`,
        {
            'X-Auth-Email': env.DCV_EMAIL,
            'X-Auth-Key': env.DCV_TOKEN,
        }, undefined)
}

export async function uidDel(env: Bindings, domain_uuid: string) {
    return dnsAPI(
        "DELETE", `https://api.cloudflare.com/client/v4/zones/${env.DCV_ZONES}/dns_records/${domain_uuid}`,
        {
            'X-Auth-Email': env.DCV_EMAIL,
            'X-Auth-Key': env.DCV_TOKEN,
        }, undefined)
}

export async function dnsAPI(method: string = "POST",
                             url: string,
                             header: Record<string, any>,
                             body: BodyInit | null | undefined) {
    try {
        console.log(method, url);
        const response = await fetch(url,
            {
                method: method,
                headers: header,
                body: body
            }
        );
        const data: Record<string, any> = await response.json();
        // console.log('Result:', data);
        return data;
    } catch (error) {
        console.error(error);
        return {};
    }
}
