const {post,invokeHttpRequest} = require("./index.js");

// 接口来源：上海黄金交易所

// 获取黄金当日价格
exports.quotations=async (params = {})=>{
    return await post('https://www.sge.com.cn/graph/quotations', params)
}

// 获取黄金历史价格
exports.Dailyhq=async (params = { instid: 'Au99.99' })=>{
    return await post('https://www.sge.com.cn/graph/Dailyhq', params,'application/x-www-form-urlencoded')
}
