// 计算 BASE-SHA256 ============================================
async function sha256(data_text) {
    return CryptoJS.SHA256(data_text).toString(CryptoJS.enc.Hex);
}

// 生成 HMAC-SHA256 ============================================
async function mac256(data_text, keys_text) {
    let temp_data = CryptoJS.HmacSHA256(data_text, keys_text)
    return temp_data.toString(CryptoJS.enc.Hex);
}

// 生成 Bcrypt-H256 =============================================
async function bcrypt(data_text) {
    const salt_nums = 10;
    const salt_data = await bcrypt.genSalt(salt_nums);
    return await bcrypt.hash(data_text, salt_data);
}

// 加密 AES-256-CBC =============================================
async function aes256(data_text, keys_text) {
    const keys_word = CryptoJS.enc.Hex.parse(keys_text);
    const data_word = CryptoJS.enc.Hex.parse(data_text);
    const save_word = CryptoJS.AES.encrypt(
        data_word, keys_word,
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    const save_text = save_word.toString(CryptoJS.format.Hex);
    // 返回组合后的字符串 ==============
    return save_text;
}

// 加密 XOR KEY 256 =============================================
async function xor256(data_text, keys_text) {
    const max_len = Math.max(data_text.length, keys_text.length);
    data_text = data_text.padEnd(max_len, '0');
    keys_text = keys_text.padEnd(max_len, '0');
    let save_text = '';
    for (let i = 0; i < max_len; i += 2) {
        let data_word = parseInt(data_text.substr(i, 2), 16);
        let keys_word = parseInt(keys_text.substr(i, 2), 16);
        let save_word = data_word ^ keys_word;
        save_text += save_word.toString(16).padStart(2, '0');
    }
}