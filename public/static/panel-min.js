function getGravatar(email, size = 80) {
    const hash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

function getUserEmail() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/check/', false); // 第三个参数设置为 false 表示同步请求
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.flags === 0) {
            console.log('用户邮箱获取成功:', response);
            return response.texts;
        } else {
            console.log('用户邮箱获取失败:', response.texts);
            window.location.href = "/login.html";
            // window.alert("用户邮箱获取失败: " + response.texts);
            return {};
        }
    } else {
        console.error('用户邮箱获取失败:', xhr.status);
        window.location.href = "/login.html";
        // window.alert("用户邮箱获取失败: " + xhr.status);
        return {};
    }
}

function srtGravatar(id) {
    // 使用fetch获取另一个HTML页面的内容
    fetch('static/sides-bar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sides-bar').innerHTML = data;
            const email = getUserEmail();
            document.getElementById("avatarImage").src = getGravatar(email);
            document.getElementById("user-emails").innerText = email;
            setActive(id)
        });
    //

}

function setActive(id) {
    let element = document.getElementById(id);
    if (element) element.classList.add('active');
}