const axios = require('axios');

/**
 * 发送POST请求
 * @param {string} uri - 请求的URL
 * @param {Object} body - 请求体数据
 * @param {string} contentType - 请求头中的Content-Type
 * @returns {Promise<Object>} - 响应数据
 */
exports.post = async function post( uri, body = null, contentType = 'application/json') {
    try {
        const requestConfig = {
            method: 'POST',
            url: uri,
            headers: {
                'Content-Type': contentType
            }
        };

        // 根据请求类型处理参数
        if (body) {
                if (contentType === 'application/x-www-form-urlencoded') {
                    // 表单数据格式
                    const formData = new URLSearchParams(body).toString();
                    requestConfig.data = formData;
                } else {
                    // JSON格式
                    requestConfig.data = typeof body === 'string' ? body : body;
                }
        }

        const response = await axios(requestConfig);
        return response.data;
    } catch (error) {
        console.error(`请求失败: ${error.message}`);
        return null;
    }
}



// 发送HTTP请求的函数
exports.invokeHttpRequest = async function invokeHttpRequest(method, uri, body = null, contentType = 'application/json') {
    try {
        const requestConfig = {
            method: method,
            url: uri,
            headers: {
                'Content-Type': contentType
            }
        };

        // 根据请求类型处理参数
        if (body) {
            if (method === 'GET') {
                // 转换参数为查询字符串
                const queryParams = new URLSearchParams(body).toString();
                requestConfig.url = `${uri}?${queryParams}`;
            } else {
                if (contentType === 'application/x-www-form-urlencoded') {
                    // 表单数据格式
                    const formData = new URLSearchParams(body).toString();
                    requestConfig.data = formData;
                } else {
                    // JSON格式
                    requestConfig.data = typeof body === 'string' ? body : body;
                }
            }
        }

        const response = await axios(requestConfig);
        return response.data;
    } catch (error) {
        console.error(`请求失败: ${error.message}`);
        return null;
    }
}

