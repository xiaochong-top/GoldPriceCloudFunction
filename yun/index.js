const {post,invokeHttpRequest} = require("./request.js");


// 计算今天开盘到当前时间的最高价和最低价差价
function taday(times,priceData){
        
        const todayPrices = [];
        let morningStartIndex = -1;
        
        // 找到今天早上9点的索引位置
        for (let i = 0; i < times.length; i++) {
            if (times[i] === '09:00') {
                morningStartIndex = i;
                break;
            }
        }
        
        // 如果找不到9点，使用第一个索引
        if (morningStartIndex === -1) {
            morningStartIndex = 0;
        }
        
        // 从9点到当前时间收集价格
        for (let i = morningStartIndex; i < priceData.length; i++) {
            if (priceData[i] !== null && priceData[i] !== '') {
                todayPrices.push(parseFloat(priceData[i]));
            }
        }
        
        // 计算今日价格区间
        if (todayPrices.length > 0) {
            const todayHigh = Math.max(...todayPrices);
            const todayLow = Math.min(...todayPrices);
            const todayRange = todayHigh - todayLow;
            
            return `今日价格分析: 最高价 ${todayHigh}, 最低价 ${todayLow}, 价格差 ${todayRange.toFixed(1)}`;
        } else {
            return '';
            // resultMessages.push('今日价格分析: 今日无有效价格数据')
        }
}

// 计算当前价格相对于前一天收盘价的变化
function calculatePreviousDayChange(timeArray, currentPrice) {
    let resultMessage = '';
    let yesterdayClose = 0;
    
    // 使用最后一条记录作为前一交易日
    const previousTradingDayIndex = timeArray.length - 1;
    
    if (previousTradingDayIndex >= 0) {
        // 获取前一交易日数据
        const previousDate = timeArray[previousTradingDayIndex][0];
        const previousCloseStr = timeArray[previousTradingDayIndex][2];
        
        // 确保数据可以转换为数字
        if (/^\d+(\.\d+)?$/.test(previousCloseStr)) {
            const previousClose = parseFloat(previousCloseStr);
            
            if (previousClose > 0) {
                // 计算价格变化
                const priceChange = currentPrice - previousClose;
                const priceChangeFormatted = priceChange.toFixed(1);
                
                resultMessage = `今日价格变化: 前一交易日(${previousDate})收盘价 ${previousClose}, 变化 ${priceChangeFormatted}`;
                
                // 保存前一交易日收盘价用于后续计算
                yesterdayClose = previousClose;
            } else {
                resultMessage = '今日价格变化: 前一交易日收盘价为零，无法计算变化';
            }
        } else {
            resultMessage = '今日价格变化: 收盘价数据无法转换为数字，无法计算变化';
        }
    } else {
        resultMessage = '今日价格变化: 没有足够的历史数据用于计算价格变化';
    }
    
    return { message: resultMessage, yesterdayClose: yesterdayClose };
}

// 分析前三天收盘价格变化
function analyzeLast3DaysChanges(timeArray, currentPrice, yesterdayClose) {
    const previousTradingDayIndex = timeArray.length - 1;
    
    if (previousTradingDayIndex >= 2) {
        const last3DaysChanges = [];
        let validDataCount = 0;
        
        for (let i = 1; i <= 3; i++) {
            const dayIndex = previousTradingDayIndex - i + 1;
            const prevDayIndex = previousTradingDayIndex - i;
            
            if (dayIndex >= 0 && prevDayIndex >= 0) {
                const closePriceStr = timeArray[dayIndex][2];
                const prevClosePriceStr = timeArray[prevDayIndex][2];
                
                if (/^\d+(\.\d+)?$/.test(closePriceStr) && /^\d+(\.\d+)?$/.test(prevClosePriceStr)) {
                    const closePrice = parseFloat(closePriceStr);
                    const prevClosePrice = parseFloat(prevClosePriceStr);
                    
                    if (prevClosePrice > 0) {
                        // 使用绝对变化值
                        const change = closePrice - prevClosePrice;
                        const absChange = Math.abs(change);
                        last3DaysChanges.push(absChange);
                        validDataCount++;
                    }
                }
            }
        }
        
        if (validDataCount > 0) {
            // 计算平均变化值
            const avgChange3Days = last3DaysChanges.reduce((sum, val) => sum + val, 0) / last3DaysChanges.length;
            const maxChange3Days = Math.max(...last3DaysChanges);
            const avgChange3DaysStr = avgChange3Days.toFixed(1);
            const maxChange3DaysStr = maxChange3Days.toFixed(1);
            
            if (yesterdayClose > 0) {
                const todayChange = Math.abs(currentPrice - yesterdayClose);
                const todayChangeStr = todayChange.toFixed(1);
                
                const exceedsAvg = todayChange > avgChange3Days;
                const exceedsMax = todayChange > maxChange3Days;
                
                return `前三天收盘价变化: 平均变化值 ${avgChange3DaysStr}, 最大变化值 ${maxChange3DaysStr}\n今日变化值 ${todayChangeStr}: ${exceedsAvg ? '超过' : '未超过'}平均值, ${exceedsMax ? '超过' : '未超过'}最大值`;
            } else {
                return '前三天收盘价变化: 无法比较今日变化（前一天收盘价无效）';
            }
        } else {
            return '前三天收盘价变化: 前三天无有效数据进行比较';
        }
    } else {
        return '前三天收盘价变化: 没有足够的历史数据进行前三天比较';
    }
}

// 分析前五天收盘价格变化
function analyzeLast5DaysChanges(timeArray, currentPrice, yesterdayClose) {
    const previousTradingDayIndex = timeArray.length - 1;
    
    if (previousTradingDayIndex >= 4) {
        const last5DaysChanges = [];
        let validDataCount = 0;
        
        for (let i = 1; i <= 5; i++) {
            const dayIndex = previousTradingDayIndex - i + 1;
            const prevDayIndex = previousTradingDayIndex - i;
            
            if (dayIndex >= 0 && prevDayIndex >= 0) {
                const closePriceStr = timeArray[dayIndex][2];
                const prevClosePriceStr = timeArray[prevDayIndex][2];
                
                if (/^\d+(\.\d+)?$/.test(closePriceStr) && /^\d+(\.\d+)?$/.test(prevClosePriceStr)) {
                    const closePrice = parseFloat(closePriceStr);
                    const prevClosePrice = parseFloat(prevClosePriceStr);
                    
                    if (prevClosePrice > 0) {
                        // 使用绝对变化值
                        const change = closePrice - prevClosePrice;
                        const absChange = Math.abs(change);
                        last5DaysChanges.push(absChange);
                        validDataCount++;
                    }
                }
            }
        }
        
        if (validDataCount > 0) {
            // 计算平均变化值
            const avgChange5Days = last5DaysChanges.reduce((sum, val) => sum + val, 0) / last5DaysChanges.length;
            const maxChange5Days = Math.max(...last5DaysChanges);
            const avgChange5DaysStr = avgChange5Days.toFixed(1);
            const maxChange5DaysStr = maxChange5Days.toFixed(1);
            
            if (yesterdayClose > 0) {
                const todayChange = Math.abs(currentPrice - yesterdayClose);
                const todayChangeStr = todayChange.toFixed(1);
                
                const exceedsAvg = todayChange > avgChange5Days;
                const exceedsMax = todayChange > maxChange5Days;
                
                return `前五天收盘价变化: 平均变化值 ${avgChange5DaysStr}, 最大变化值 ${maxChange5DaysStr}\n今日变化值 ${todayChangeStr}: ${exceedsAvg ? '超过' : '未超过'}平均值, ${exceedsMax ? '超过' : '未超过'}最大值`;
            } else {
                return '前五天收盘价变化: 无法比较今日变化（前一天收盘价无效）';
            }
        } else {
            return '前五天收盘价变化: 前五天无有效数据进行比较';
        }
    } else {
        return '前五天收盘价变化: 没有足够的历史数据进行前五天比较';
    }
}

// 主函数 - 改为基于Promise的实现
function analyzeGoldPrice(event, context, callback) {
    // 获取实时价格数据
    return post('https://www.sge.com.cn/graph/quotations')
        .then(realtimeData => {
            // 获取历史日线数据
            return post(
                'https://www.sge.com.cn/graph/Dailyhq', 
                { instid: 'Au99.99' }, 
                'application/x-www-form-urlencoded'
            ).then(historyData => {
                // 返回数据对象以便后续处理
                return { realtimeData, historyData };
            });
        })
        .then(({ realtimeData, historyData }) => {
            // 处理数据前进行基本验证
            if (!realtimeData || !historyData) {
                throw new Error('无法获取数据，请检查网络连接或接口是否可用');
            }
            
            // 提取实时数据
            const times = realtimeData.times;
            const priceData = realtimeData.data;
            const delaystr = realtimeData.delaystr;
            
            // 从 delaystr 中提取当前日期
            let currentDate = '';
            try {
                const dateMatch = /(\d{4})年(\d{2})月(\d{2})日/.exec(delaystr);
                if (dateMatch) {
                    const [_, year, month, day] = dateMatch;
                    currentDate = `${year}-${month}-${day}`;
                } else {
                    // 如果无法解析，使用当前日期
                    currentDate = new Date().toISOString().split('T')[0];
                }
            } catch (error) {
                currentDate = new Date().toISOString().split('T')[0];
            }
            
            // 获取当前价格（最后一个有效价格）
            let currentPrice = null;
            for (let i = priceData.length - 1; i >= 0; i--) {
                if (priceData[i] !== null && priceData[i] !== '') {
                    currentPrice = parseFloat(priceData[i]);
                    break;
                }
            }
            
            if (currentPrice === null) {
                throw new Error('无法获取当前价格');
            }

            // 创建结果消息
            let resultMessages = [];

            // 计算今天开盘到当前时间的最高价和最低价差价
            resultMessages.push(taday(times,priceData));
            
            // 处理历史数据
            const timeArray = historyData.time;
            
            // 1. 计算当前价格相对于前一天收盘价的变化
            const previousDayResult = calculatePreviousDayChange(timeArray, currentPrice);
            resultMessages.push(previousDayResult.message);
            
            // 2. 分析前三天收盘价格变化
            resultMessages.push(analyzeLast3DaysChanges(timeArray, currentPrice, previousDayResult.yesterdayClose));
            
            // 3. 分析前五天收盘价格变化
            resultMessages.push(analyzeLast5DaysChanges(timeArray, currentPrice, previousDayResult.yesterdayClose));
            
            // 将所有信息合并为一个字符串
            const finalMessage = resultMessages.join('\n\n');
            
            // 如果有回调函数，调用回调
            if (callback) {
                callback(null, finalMessage);
            }
            
            // 返回最终消息，可用于短信发送
            return finalMessage;
        })
        .catch(error => {
            const errorMessage = `黄金价格分析失败: ${error.message}`;
            
            // 如果有回调函数，调用回调
            if (callback) {
                callback(errorMessage);
            }
            
            return errorMessage;
        });
}

// 导出主函数
exports.handler = analyzeGoldPrice;
