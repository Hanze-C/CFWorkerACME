// 页面载入函数 ######################################
function onLoad(name) {
    // 判断参数 ######################################
    // 修改密码 ======================================
    if (urlParams.has("changers")) { // 修改密码
        document.getElementById('code_view').remove();
        const emails = urlParams.get("emails");
        let em = document.getElementById('mail_text')
        em.value = emails;
        em.disabled = true;
        let pt = document.getElementById('pass_text')
        pt.placeholder = "新的密码";
        // 修改按钮 ==================================
        let bu = document.getElementById('main_text');
        bu.innerText = "修改密码";
        let ut = document.getElementById('apply_act')
        ut.innerHTML = "确认修改";
        // 删除按钮 ---------------------------------
        document.getElementById('login_act').remove();
        document.getElementById('apply_btn').remove();
        document.getElementById('login_btn').remove();
    } // 找回密码 ====================================
    else if (urlParams.has('password')) {
        let bu = document.getElementById('main_text');
        let ut = document.getElementById('apply_act')
        bu.innerText = "找回密码";
        ut.innerHTML = "重设密码";
        // 删除按钮 ---------------------------------
        document.getElementById('last_view').remove();
        document.getElementById('login_act').remove();
        document.getElementById('setup_btn').remove();
        document.getElementById('panel_btn').remove();
    } // 用户注册 ====================================
    else if (urlParams.has('register')) {
        document.getElementById('last_view').remove();
        let bu = document.getElementById('main_text');
        bu.innerText = "用户注册"
        // 删除按钮 ---------------------------------
        document.getElementById('login_act').remove();
        document.getElementById('apply_btn').remove();
        document.getElementById('panel_btn').remove();
    } // 普通登录 ===================================
    else {
        document.getElementById('code_view').remove();
        document.getElementById('next_view').remove();
        document.getElementById('last_view').remove();
        // 删除按钮 ---------------------------------
        document.getElementById('apply_act').remove();
        document.getElementById('panel_btn').remove();
        document.getElementById('login_btn').remove();
    }
}

async function onCode() {
    // 使用URLSearchParams解析查询字符串 ======================
    let mail_text = document.getElementById("mail_text").value;
    let url = "/nonce/?email=" + mail_text;
    if (urlParams.has('register')) url += "&authy=" + token
    if (urlParams.has("password")) url += "&authy=" + token
    if (urlParams.has('register')) url += "&setup=1"
    if (urlParams.has("password")) url += "&reset=1"
    // 检查邮箱 ===============================================
    if (!isValidEmail(mail_text)) return false;
    // 获取代码 ===============================================
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',}
        }); // 检查请求是否成功 -------------------------------
        turnstile.reset();
        token = "";
        const responseData = await response.json();
        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: responseData["nonce"],
                showConfirmButton: true,
                timer: 1000
            });
        } else {
            if (urlParams.has('register')) {
                startCountdown();
                let btn = document.getElementById("code")
                btn.className = "btn btn-secondary";
                Swal.fire({
                    icon: 'success',
                    title: responseData["nonce"],
                    showConfirmButton: true,
                    timer: 1000
                });
            } else
                nonce = responseData["nonce"];
            return responseData;
        }
        // 解析响应内容 =======================================
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '获取Nonce失败: ' + error,
            showConfirmButton: true,
            timer: 1000
        });
    }
}

function startCountdown() {
    let countdown = 300;
    document.getElementById("code").disabled = true;
    document.getElementById("code").innerText = countdown.toString();
    const timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(timer);
            document.getElementById("code").disabled = false;
            document.getElementById("code").innerText = "发送";
        }
    }, 1000);
}

// 提交表单函数 #######################################################
async function onPost(name) {
    // 获取内容 =======================================================
    let mail_text = document.getElementById("mail_text").value;
    let pass_text = document.getElementById("pass_text").value;
    // 检查内容 =======================================================
    if (!isValidEmail(mail_text)) return false;
    await onCode();
    let pass_hash = await sha256(pass_text); // 登录密码的SHA256
    let pass_hmac = await mac256(pass_hash, nonce);
    console.log(pass_hash, nonce, pass_hmac);
    // 发起请求 =======================================================
    let new_url = "/login/?email=" + mail_text + "&token=" + pass_hmac;
    // new_url += "&authy=" + token
    console.log("token:", token);
    try {
        const response = await fetch(new_url, {
            method: 'GET', headers: {'Content-Type': 'application/json'}
        }); // 检查请求是否成功 ---------------------------------------
        // 解析响应内容 ===============================================
        const responseData = await response.json();
        turnstile.reset();
        token = "";
        if (response.status === 200)
            window.location.href = "/panel.html";
        else Swal.fire({
            icon: 'error',
            title: responseData.nonce,
            showConfirmButton: true,
            timer: 1000
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '提交登录失败: ' + error,
            showConfirmButton: true,
            timer: 1000
        });
    }
}

// 提交表单函数 #######################################################
async function onAdds(name) {
    let mail_text = document.getElementById("mail_text").value;
    let pass_text = document.getElementById("pass_text").value;
    let next_text = document.getElementById("next_text").value;

    // 判断密码是否一致 =======================================
    if (!isValidEmail(mail_text)) return false;
    console.log(pass_text, next_text)
    if (next_text !== pass_text) {
        Swal.fire({
            icon: 'error',
            title: '两次密码不一致',
            showConfirmButton: true,
            timer: 1000
        });
        return false;
    }
    if (pass_text.length < 8) {
        Swal.fire({
            icon: 'error',
            title: '密码至少要8位',
            showConfirmButton: true,
            timer: 1000
        });
        return false;
    }
    // 加密内容 ================================================
    let pass_hash = await sha256(pass_text); // 登录密码的SHA256
    let pass_code;
    // 发起请求 ================================================
    let new_url = "/setup/" + "?email=" + mail_text;
    if (urlParams.has("changers")) {
        let pass_last = document.getElementById("last_text").value;
        pass_code = await sha256(pass_last); // 老密码
        new_url += "&token=" + pass_hash // 新密码
    } else {
        let code_text = document.getElementById("code_text").value;
        let code_hash = await sha256(code_text); // 验证代码的SHA256
        let mail_code = await mac256(mail_text, code_hash) // 邮件的
        pass_code = await aes256(pass_hash, code_hash) // 密码的
        new_url += "&codes=" + mail_code
    }
    new_url += "&crypt=" + pass_code
    window.location.href = new_url
}

function isValidEmail(email) {
    if (email.length <= 0) {
        Swal.fire({
            icon: 'error',
            title: '请填写邮箱地址',
            showConfirmButton: false,
            timer: 1000
        });
        return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = regex.test(email);
    if (!result) {
        Swal.fire({
            icon: 'error',
            title: '请正确填写邮箱',
            showConfirmButton: false,
            timer: 1000
        });
        return false;
    }
    if (token.length <= 0) {
        Swal.fire({
            icon: 'error',
            title: '请先完成人机验证',
            showConfirmButton: false,
            timer: 1000
        });
        return false;
    }
    return result
}

function CaptchaSuccess(e) {
    token = e;
    document.getElementById("code").className = "btn btn-primary";
}

function CaptchaExpired(e) {
    document.getElementById("code").className = "btn btn-secondary";
    turnstile.reset();
}
