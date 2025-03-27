const {quotations,Dailyhq} = require("./request/goldPrice");

function getPrice(){
    return new Promise((resolve, reject) => {
        Promise.all([ quotations(),Dailyhq() ]).then((arr)=> {
            // 最新日期
            let newDateStr = arr[0].delaystr.match(/\d+/g).slice(0,3).join("-");
            // 最新时间
            let newTimeStr = arr[0].delaystr.match(/\d{2}:\d{2}/)[0];
            // 用于比较同一天的两个时间早晚
            let toMinutes = (time) => {
                const [hours, mins] = time.split(":").map(Number);
                return hours * 60 + mins;
            };
            // 整合时间数组和价格数组，并保留过滤有效部分数据
            let newPriceArr=arr[0].times
                .map((item,index)=>({time:item,price:arr[0].data[index]}))
                .filter((item,index)=> index<=239 || toMinutes(item.time) <= toMinutes(newTimeStr))

            // 历史数据
            let formatHistoryData=arr[1].time.map(item=>({
                date:item[0],
                open:item[1],
                close:item[2],
                lowest:item[3],
                highest:item[4]
            }))

            if(!arr[0] || !arr[1]){
                reject('数据获取失败')
            }else{
                // 实时数据接口返回，历史数据接口返回，最新日期，最新时间，最新有效数据数组，对象格式的历史数据
                resolve([arr[0],arr[1],newDateStr,newTimeStr,newPriceArr,formatHistoryData])
            }
        })
    })
}

// 主函数 - 改为基于Promise的实现
function analyzeGoldPrice(event, context, callback) {

    getPrice().then(([ realtimeData, historyData,newDateStr,newTimeStr,newPriceArr,formatHistoryData ]) => {
            // 计算实时数据的最大值，最小值，和最新值
        let result={newDateStr,newTimeStr}
        result=newPriceArr.reduce((accumulator ,item,index)=>{
            accumulator.newDateMaxPriceStr = (!accumulator.newDateMaxPriceStr || accumulator.newDateMaxPriceStr < item.price) ? item.price : accumulator.newDateMaxPriceStr
            accumulator.newDateMinPriceStr = (!accumulator.newDateMinPriceStr || accumulator.newDateMinPriceStr > item.price) ? item.price : accumulator.newDateMinPriceStr
            accumulator.newPriceStr=item.price
            return accumulator
        },result)

        // 计算最新值与前一个交易日收盘价格的差价
        let historyLength =formatHistoryData.length
        if(formatHistoryData[historyLength-1].date === newDateStr)
        {
            result.PriceChange_1=(result.newPriceStr-formatHistoryData[historyLength-2].close).toFixed(2)
            result.PriceChange_2=(formatHistoryData[historyLength-2].close-formatHistoryData[historyLength-3].close).toFixed(2)
            result.PriceChange_3=(formatHistoryData[historyLength-3].close-formatHistoryData[historyLength-4].close).toFixed(2)
            result.PriceChange_4=(formatHistoryData[historyLength-4].close-formatHistoryData[historyLength-5].close).toFixed(2)
            result.PriceChange_5=(formatHistoryData[historyLength-5].close-formatHistoryData[historyLength-6].close).toFixed(2)
        }else{
            result.PriceChange_1=(result.newPriceStr-formatHistoryData[historyLength-1].close).toFixed(2)
            result.PriceChange_2=(formatHistoryData[historyLength-1].close-formatHistoryData[historyLength-2].close).toFixed(2)
            result.PriceChange_3=(formatHistoryData[historyLength-2].close-formatHistoryData[historyLength-3].close).toFixed(2)
            result.PriceChange_4=(formatHistoryData[historyLength-3].close-formatHistoryData[historyLength-4].close).toFixed(2)
            result.PriceChange_5=(formatHistoryData[historyLength-4].close-formatHistoryData[historyLength-5].close).toFixed(2)
        }

        // console.log(result)

        callback(null, result);
        })
}

// 导出主函数
exports.handler = analyzeGoldPrice;
