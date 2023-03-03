// JavaScript 計算兩日期時間天數、取得兩時間差異
// http://www.eion.com.tw/Blogger/?Pid=1182
const DateDiff = function (date1, date2) {
    // date1 和 date2 是 2016-06-18 格式
    let strDate, oDate1, oDate2, result
    strDate = date1.split('/')
    oDate1 = new Date(strDate[1] + '/' + strDate[2] + '/' + strDate[0])
    strDate = date2.split('/')
    oDate2 = new Date(strDate[1] + '/' + strDate[2] + '/' + strDate[0])
    result = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24) // 把相差的毫秒數轉換為天數
    return result
}
function calculateFetchRowIndex() {
    const Today = new Date()
    const todayFormatted = `${Today.getFullYear()}/${Today.getMonth() + 1}/${Today.getDate()}`
    const startFetchRowIndex = 1 + DateDiff('2023/2/23', todayFormatted) // 計算相差之天數
    return startFetchRowIndex
}

// Date.getDay()取得日期中的星期幾
// https://www.victsao.com/blog/81-javascript/188-javascript-date-getday
function calculateDay(dateStr) {
    const date = new Date(dateStr)
    const day = date.getDay() // 輸出 0~6
    const table = {
        0: '日',
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
    }
    return table[day]
}

export { calculateFetchRowIndex, calculateDay }
