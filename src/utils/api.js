import axios from 'axios'

import { calculateFetchRowIndex } from './helpers'

const spreadsheetId = '1eUvRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const tab_name = '工作表1' // 工作表1
const APIkey = 'AIzaSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
// 計算當日日期在後端 excel 的 row index，以及未來近 14 天的 row index
const startFetchRowIndex = calculateFetchRowIndex()
const endFetchRowIndex = startFetchRowIndex + 13
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
        const url = 'https://script.google.com/macros/s/AKfycxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec'
        const parameter = {
            postInfo: data.postInfo,
            columnAlphabet: data.columnAlphabet,
            rowIndex: data.rowIndex,
            sheetUrl: 'https://docs.google.com/spreadsheets/d/1eUvRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/edit#gid=0',
            sheetTag: '工作表1',
        }

        const result = await axios.get(url, { params: parameter })
        return result
        // $.get(url, parameter).then((response) => {
        //     console.log('response', response)
        // })
    } catch (error) {
        console.log(error)
    }
}

export { getData, postData }

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
