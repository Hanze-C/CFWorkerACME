function getOrders() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/order/?id=all', false); // 第三个参数设置为 false 表示同步请求
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.flags === 0) {
            console.log('证书订单获取成功:', response);
            let counts = [0, 0, 0, 0, 0, 0, 0, 0];
            for (const orders of response.order) {
                counts[orders.flag + 1] += 1

            }
            return {
                counts: counts,
                orders: response.order
            };
        } else {
            console.log('证书订单获取失败:', response.texts);
            // window.alert("证书订单获取失败: " + response.texts);
            window.location.href = "/login.html";
            return {};
        }
    } else {
        console.error('证书订单获取失败:', xhr.status);
        // window.alert("证书订单获取失败: " + xhr.status);
        window.location.href = "/login.html";
        return {};
    }
}

function setOrders(id, orders, name) {
    // let echarts = require('echarts');
    let chartDom = document.getElementById(id);
    let myChart = echarts.init(chartDom);
    let option;
    option = {
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                name: name,
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 10,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: orders,
            }
        ]
    };
    option && myChart.setOption(option);
}

function numOrders() {
    let orders = getOrders();
    let counts = orders.counts;
    setOrders("cert_wait", [
        {value: counts[1], name: '创建中'},
        {value: counts[2], name: '获取中'},
        {value: counts[3], name: '待提交'},
    ], "待验证");
    setOrders("cert_auth", [
        {value: counts[4], name: '验证中'},
        {value: counts[5], name: '签发中'},
    ], "验证中");
    setOrders("cert_done", [
        {value: counts[6], name: '已签发'},
        {value: counts[7], name: '已过期'},
    ], "已签发");
    setOrders("cert_fail", [
        {value: counts[0], name: '已失效'},
    ], "已失效");
    let msg_list = document.getElementById("msg_list");
    for (const order of orders.orders) {
        msg_list.innerHTML += `
        <tr>
            <td>${order.uuid}</td>
            <td>${(new Date(order.time)).toLocaleString()}</td>
            <td>${order.text}</td>
            <td><button class="details-btn" onclick="window.open('/order.html?id=${order.uuid}')">查看详情</button></td>
        </tr>
        `;
    }
}

function numApply() {
    let orders = getOrders();
    let msg_list = document.getElementById("msg_list");
    for (const order of orders.orders) {
        console.log(order);
        let t_main = JSON.parse(order['main']);
        let c_name = JSON.parse(order['list']).map(c => c.name).toString();
        if (c_name.length > 36) {
            c_name = c_name.substring(0, 33) + "...";
        }

        msg_list.innerHTML += `
        <tr>
            <td id="${order.uuid}">${order.uuid}</td>
            <td>${flag_map[order.flag]}</td>
            <td>${c_name}</td>
            <td>${sign_map[order.sign]}</td>
            <td>${type_map[order.type]}</td>
            <td>${new Date(order.time).toLocaleString().split(" ")[0]}</td>
            <td>${new Date(order.next).toLocaleString().split(" ")[0]}</td>
            <td>${order.text}</td>
            <td>
                <button class="btn btn-primary" onclick="window.open('/order.html?id=${order.uuid}')">查看详情</button>
                <button class="btn ${order.flag === 5 ? 'btn-info' : 'btn-secondary'}" 
                    ${order.flag === 5 ? 'btn-success' : "disabled"} onclick="setAuthy('ca_get',undefined,'${order.uuid}')">下载证书</button>
                <button class="btn ${order.flag === 5 ? 'btn-info' : 'btn-secondary'}" 
                    ${order.flag === 5 ? 'btn-success' : "disabled"} onclick="setAuthy('ca_key',undefined,'${order.uuid}')">下载密钥</button>
            </td>
        </tr>
        `;
    }
}