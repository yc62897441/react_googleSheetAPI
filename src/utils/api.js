import axios from 'axios'
import { sheetUrl, spreadsheetId, tab_name, APIkey, AppScriptURL } from '../conf/index'
import { calculateFetchRowIndex } from './helpers'

// 計算當日日期在後端 excel 的 row index，以及未來近 14 天的 row index
// const startFetchRowIndex = calculateFetchRowIndex()
// const endFetchRowIndex = startFetchRowIndex + 13

// 計算當周起始日之日期在後端 excel 的 row index，以及未來近 28 天的 row index 
// 每周的起始日(星期日)在後端 excel 的 row index 為 4、11、18...，所以要求出當周的起始日的 row index，先把 Math.floor((當日的 row index - 4) / 7) 求出第幾周(0、1、2...)，之後再把結果(0、1、2...) * 7 + 4 求出該周的起始日的 row index
const startFetchRowIndex = Math.floor((calculateFetchRowIndex() - 4) / 7) * 7 + 4
const endFetchRowIndex = startFetchRowIndex + 27
const fetchRowRange = `!${startFetchRowIndex}:${endFetchRowIndex}`

// 選取資料表範圍說明 「Google Sheets API Overview」→「Cell」→「A1 notation」或「R1C1 notation」
// https://developers.google.com/sheets/api/guides/concepts#cell
async function getData() {
    try {
        const result = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tab_name}${fetchRowRange}?key=${APIkey}`)
        return result
    } catch (error) {
        console.log(error)
    }
}

async function postData(data) {
    try {
        const parameter = {
            type: data.type,
            postInfo: data.postInfo,
            columnAlphabet: data.columnAlphabet,
            rowIndex: data.rowIndex,
            sheetUrl: sheetUrl,
            sheetTag: tab_name,
        }

        const result = await axios.get(AppScriptURL, { params: parameter })
        return result
        // $.get(url, parameter).then((response) => {
        //     console.log('response', response)
        // })
    } catch (error) {
        console.log(error)
    }
}

export { getData, postData, startFetchRowIndex }

// 寫給純前端，讓 Google Sheets 當你的後端完成寫入功能
// https://medium.com/unalai/%E5%AF%AB%E7%B5%A6%E7%B4%94%E5%89%8D%E7%AB%AF-%E8%AE%93-google-sheets-%E7%95%B6%E4%BD%A0%E7%9A%84%E5%BE%8C%E7%AB%AF%E5%AE%8C%E6%88%90%E5%AF%AB%E5%85%A5%E5%8A%9F%E8%83%BD-715799e5e013

// Google 試算表 ( 原理 )
// https://tutorials.webduino.io/zh-tw/docs/socket/useful/google-sheet-1.html

// app script test - write
// https://script.google.com/home/projects/1kRFvglVnwBzVwHPXMpXizgKIMKHHUP142OU0Fs0amJ5DYfaVnfrFPxB9/edit

// Google API 1/4: 使用 Google API Python Client 存取 Google 服務
// https://pythonviz.com/google-cloud/google-api-python-client-access-google-services/

// Google API 2/4: Python 存取 Google Sheets？讀寫 pandas df
// https://pythonviz.com/google-cloud/google-sheets-api-read-write-pandas-dataframe/
