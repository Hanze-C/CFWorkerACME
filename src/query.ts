// 域名记录 #######################
interface DnsResponse {
    Status: number; // 查询响应状态
    Answer: { // 返回的查询完整结果
        name: string; // 查询的域名
        type: string; // 查询的类型
        time: number; // 查询有效期
        data: string; // 查询的结果
    };
}

// 解析域名 ################################################################
export async function queryDNS( // =========================================
    domain: string,/* 待查询的域名 */ record: string = "TXT", // 查询类型TXT
    server: string = "https://dns.google/resolve"): Promise<DnsResponse[]> {
    // 查询参数设置 ========================================================
    const params = new URLSearchParams({name: domain, type: record}); // URL
    try { // 查询过程 ======================================================
        const response = await fetch(`${server}?${params}`);
        if (!response.ok) { // 如果查询失败了 ==============================
            console.error(`查询域名失败: ${response.status}`);
            return []; // 返回空数据保证不异常 =============================
        } // 解析查询数据 ==================================================
        const data: any = await response.json();
        const txtRecords = data.Answer.map( // 映射查询数据 ==========
            (record: any) => ({
                name: record.name, type: record.type,
                time: record.TTL, data: record.data,
            }));
        // console.log("txtRecords: ", txtRecords);
        return txtRecords || [];
    } catch (error) {
        console.error('解析数据失败:', error);
        return [];
    }
}
