// 申请证书
 function applyCert() {
    // 提取域名信息
    const domainList = [];
    const domainRows = document.querySelectorAll('.domain-row');
    domainRows.forEach((row, index) => {
        const domainInput = row.querySelector('input[name^="domains"][name$="[domain]"]');
        const wildcardInput = row.querySelector('input[name^="domains"][name$="[wildcard]"]');
        const includeRootInput = row.querySelector('input[name^="domains"][name$="[include_root]"]');
        const verificationSelect = row.querySelector('select[name^="domains"][name$="[verification]"]');
        domainList.push({
            domain: domainInput.value,
            wildcard: wildcardInput.checked,
            include_root: includeRootInput.checked,
            verification: verificationSelect.value,
        });
    });
    // 提取全局设置
    const caSelect = document.querySelector('select[name="ca"]');
    const autoRenewCheckbox = document.querySelector('input[name="auto_renew"]');
    const encryptionSelect = document.querySelector('select[name="encryption"]');
    // 提取主体设置
    const subjectCountry = document.querySelector('input[name="subject[country]"]').value;
    const subjectProvince = document.querySelector('input[name="subject[province]"]').value;
    const subjectCity = document.querySelector('input[name="subject[city]"]').value;
    const subjectOrganization = document.querySelector('input[name="subject[organization]"]').value;
    const subjectUnit = document.querySelector('input[name="subject[unit]"]').value;
    // 组装JSON数据
    const formData = {
        domains: domainList,
        globals: {
            ca: caSelect.value,
            auto_renew: autoRenewCheckbox.checked,
            encryption: encryptionSelect.value
        },
        subject: {
            C: subjectCountry,
            S: subjectProvince,
            ST: subjectCity,
            O: subjectOrganization,
            OU: subjectUnit
        }
    };

    // 转换为JSON字符串
    const formDataJSON = JSON.stringify(formData, null, 2);

    // 显示JSON数据（在实际应用中，您可能需要将其发送到服务器）
    console.log(formDataJSON);
    // 发起POST请求到/apply/

    fetch('/apply/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: formDataJSON,
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}