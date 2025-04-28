 function addDomainRow() {
    const domainContainer = document.getElementById('domain-container');
    if (domainNum < domainMax) {
        const newDomainRow = document.createElement('div');
        newDomainRow.className = 'domain-row d-flex align-items-center mb-3';
        newDomainRow.innerHTML = `
                <div class="domain-setting">
                    <div class="d-flex align-items-center flex-grow-1">
                        <label class="nowrap me-2">证书域名：</label>
                        <input type="text" name="domains[${domainNum}][domain]"
                               class="form-control" style="min-width:180px"
                               placeholder="域名（如：example.com）" required>
                    </div>

                    <div class="d-flex align-items-center">
                        <label class="nowrap me-2">通配符</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="wildcard-${domainNum}" name="domains[${domainNum}][wildcard]">
                        </div>
                    </div>

                    <div class="d-flex align-items-center">
                        <label class="nowrap me-2">包含根</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="include_root-${domainNum}" name="domains[${domainNum}][include_root]">
                        </div>
                    </div>

                    <div class="d-flex align-items-center">
                        <label class="nowrap me-2">验证：</label>
                        <select name="domains[${domainNum}][verification]" class="form-select" style="min-width: 100px">
                            <option value="dns-self">TXT 手动验证（修改DNS的TXT记录）</option>
                            <option value="web-self">WEB 手动验证（手动HTTP文件验证）</option>
                            <option value="dns-auto">TXT 自动验证（需要DNS配置CNAME）</option>
<!--                            <option value="web-auto">WEB 手动验证（不支持通配符域名）</option>-->
<!--                            <option value="dns-ddns">TXT 自动验证（需要配置DDNS账号）</option>-->
                        </select>
                    </div>

                    <div class="d-flex align-items-center">
                        <button type="button" class="btn btn-danger delete-btn ms-auto" style="min-width: 50px">删除</button>
                    </div>
                </div>
            `;
        /*
                            <div class="d-flex align-items-center">
                                <label class="nowrap me-2">账号：</label>
                                <select name="domains[${domainCount}][verification]" class="form-select" style="min-width: 100px">
                                    <option value="账号1">账号1</option>
                                </select>
                            </div>
        * */
        domainContainer.appendChild(newDomainRow);
        domainNum++;

        // 为新删除按钮绑定事件
        newDomainRow.querySelector('.delete-btn').addEventListener('click', function () {
            this.closest('.domain-row').remove();
            domainNum--;
        });
    }
}