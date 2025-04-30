const strSearch = window.location.search;
const urlParams = new URLSearchParams(strSearch);
const sign_map = {
    "lets-encrypt": "Let's Encrypt Global",
    "google-trust": "Google Trust Service",
    "bypass-trust": "Bypass Trust Service",
}
const type_map = {
    "rsa2048": "RSA 2048",
    "eccp256": "ECC P256",
    "eccp384": "ECC P384",
}
const flag_map = {
    "0": "等待中",
    "1": "创建中",
    "2": "待验证",
    "3": "验证中",
    "4": "申请中",
    "5": "已完成",
    "-1": "已失效",
}
const hint_map = {
    "0": "blue",
    "1": "blue",
    "2": "orange",
    "3": "blue",
    "4": "blue",
    "5": "green",
    "-1": "red",
}
const auth_map = {
    "dns-self": "TXT 手动验证",
    "web-self": "WEB 手动验证",
    "dns-auto": "TXT 自动验证",
}
const auth_act = {
    "verify": "验证全部",
    "reload": "重新生成",
    "modify": "修改申请",
    "cancel": "撤销申请",
    "single": "单条验证",
    "ca_get": "下载证书",
    "ca_key": "下载密钥",
    "re_new": "续期证书",
    "rm_key": "删除密钥",
    "ca_del": "吊销证书",
}

// 提交域名状态 ####################################################################################################
function setAuthy(on_actions, element = undefined) {
    const xhr = new XMLHttpRequest();
    const order_uuid = urlParams.get('id');
    let url = '/order/?id=' + order_uuid + "&op=" + on_actions;
    if (element !== undefined) url += `&cd=${element.dataset.domain}`;
    xhr.open('GET', url, false); // 第三个参数设置为 false 表示同步请求
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.flags === 0) {
            if (on_actions === "ca_get")
                saveFile(response.order, order_uuid + '.crt');
            else if (on_actions === "ca_key")
                saveFile(response.order, order_uuid + '.pem');
            else if (on_actions === "cancel")
                window.location.href = '/apply.html';
            else{
                Swal.fire({
                    position: 'top',
                    icon: 'success',
                    title: `订单${auth_act[on_actions]}提交成功`,
                    showConfirmButton: false,
                    timer: 1000
                });
                location.reload();
            }
        } else {
            console.log('证书订单操作失败:', response.texts);
            window.alert("证书订单操作失败: " + response.texts);
            return {};
        }
    } else {
        console.error('证书订单操作失败:', xhr.status);
        window.alert("证书订单操作失败: " + xhr.status);
        return {};
    }
}