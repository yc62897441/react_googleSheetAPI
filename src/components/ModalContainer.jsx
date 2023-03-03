import { useState } from 'react'
import styled from 'styled-components'

// 專案 components
import { Button1 } from './miniComponents/Buttons.jsx'
import PageTitleWrapper from './miniComponents/PageTitleWrapper.jsx'

// 專案 helpers
import { calculateDay } from '../utils/helpers.js'

// 讀寫 google sheet 的 API，使用 app script
import { postData } from '../utils/api.js'

// material-ui 的 components
import Divider from '@mui/material/Divider'

const ModalContainerWrapper = styled.div`
    position: fixed;
    top: 10%;
    left: 50%;
    display: flex;
    flex-direction: column;
    width: 50%;
    height: 80vh;
    overflow-y: scroll;
    padding: 20px;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    background-color: #ffffff;
    z-index: ${({ isShow }) => (isShow ? '9998' : '-9998')};
    transform: ${({ isShow }) => (isShow ? 'translateX(-50%) scale(1, 1)' : 'translateX(-50%) scale(1, 0)')};
    transform-origin: top center;
    transition: all 0.2s;
`

const ModalCloseWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    margin-bottom: 5px;
`

const ModalMainWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow-y: scroll;
`

const EventsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 0 10px 0 0;
`

const AddNewEventForm = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 5px;
    margin-bottom: 20px;
`

const InputGroupWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    margin: 0 0 10px;

    input {
        height: 40px;
        padding: 5px;
    }
`

const EventWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 5px;
    border: 1px solid #dddddd;
    margin-bottom: 15px;
    color: ${({ color }) => (color ? color : '#000000')};
`

function ModalContainer({ eachDay, index, date, isShow, setShowModal, showRoom, excelRowIndex, setIsUpdating }) {
    const [newEventInfo, setNewEventInfo] = useState({
        startTime: null,
        endTime: null,
        user: null,
        purpose: null,
        tel: null,
        room: null,
        existed: null,
        excelRowIndex: excelRowIndex,
    })

    // post新預約資訊時使用
    // 最後一筆資料後，下一格空白的欄位位置。從 state 移出，每次 handlePostData() 後，從 props 傳入 eachDay 來更新。
    const nextEmptyColumnAlphabet = numberToAlphabet(eachDay.length + 1)

    // 送出新增預約資訊、刪除預約資訊、復原刪除的預約資訊
    async function handlePostData(formData, type) {
        try {
            const existed = type === 'post' ? true : type === 'delete' ? false : type === 'restore' ? true : false
            setIsUpdating(true) // 進入更新中狀態，打開全銀幕 modal 讓使用者無法做操作
            const data = {
                postInfo: `${formData.startTime}\n${formData.endTime}\n${formData.user}\n${formData.purpose}\n${formData.tel}\n${showRoom}\n${existed}\n${formData.excelRowIndex}\n${formData.excelColumnAlphabet}`, // 開始時段：09:00\n結束時段：10:00\n申請者：張三\n用途：##會議\n聯絡電話：02-12345678
                columnAlphabet: formData.excelColumnAlphabet,
                rowIndex: formData.excelRowIndex,
            }
            const result = await postData(data)
            setIsUpdating(false) // 關閉更新中狀態，關閉全銀幕 modal
        } catch (error) {
            console.log(error)
        }
    }

    // 處理輸入表格資訊
    function handleChange(value, key) {
        // 檢查開始時間是否晚於結束時間
        const errorMessage = checkIfStartTimeLaterThanEndTime(value, key)
        if (errorMessage.length > 0) {
            window.alert(errorMessage)
        }

        // 檢查欲復原的預約時間，是否目前已經被預約了。依照目前變動的資料是表格的 startTime 或 endTime 來檢查。
        let timeErrorMessage = ''
        if (key === 'startTime') {
            timeErrorMessage = checkTimeAvailable(value, newEventInfo.endTime)
        }
        if (key === 'endTime') {
            timeErrorMessage = checkTimeAvailable(newEventInfo.startTime, value)
        }
        if (timeErrorMessage.length > 0) {
            window.alert(timeErrorMessage)
        }

        // 更新 state 資料
        const tempObj = {
            ...newEventInfo,
        }
        tempObj[key] = value
        setNewEventInfo(tempObj)
    }

    // 將欄位 index，換算出字母 0+1=A；1+1=B
    function numberToAlphabet(inputValue) {
        const alphabetsList = '0ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let value = inputValue
        let quotient = 0 // 商數
        let remainder = 0 // 餘數
        let answer = ''
        while (value > 0) {
            // 取餘數 1-->A, 2-->B, 0-->26-->Z
            remainder = value % 26 === 0 ? 26 : value % 26
            answer = alphabetsList[remainder] + answer
            // 去除餘數，再降冪
            quotient = Math.floor((value - remainder) / 26)
            value = quotient
        }
        return answer
    }

    // 檢查開始時間是否晚於結束時間
    function checkIfStartTimeLaterThanEndTime(value, key) {
        let errorMessage = ''
        if (key === 'startTime' && newEventInfo.endTime !== null) {
            if (value > newEventInfo.endTime) {
                errorMessage = `開始時間不可以晚於結束時間 ${value} ${newEventInfo.endTime}`
            }
        }
        if (key === 'endTime' && newEventInfo.startTime !== null) {
            if (value < newEventInfo.startTime) {
                errorMessage = `開始時間不可以晚於結束時間 ${newEventInfo.startTime} ${value}`
            }
        }
        return errorMessage
    }

    // 檢查欲復原的預約時間，是否目前已經被預約了
    function checkTimeAvailable(startTime, endTime) {
        const timeBlocks = []
        let errorMessage = ''

        // 建立已預約的 events 的時段區間
        eachDay.forEach((element, index) => {
            // eachDay 的第一筆是該日日期，所以從第二筆開始新增。
            if (index > 0) {
                const tempTimeBlock = {}
                tempTimeBlock.startTime = element.startTime.replace('：', ':')
                tempTimeBlock.endTime = element.endTime.replace('：', ':')
                tempTimeBlock.room = element.room
                tempTimeBlock.existed = element.existed
                timeBlocks.push(tempTimeBlock)
            }
        })

        // 開始比對，輸入之日期是否在已預約的時段區間中
        for (let i = 0; i < timeBlocks.length; i++) {
            if (timeBlocks[i].room.trim() === showRoom.toString() && timeBlocks[i].existed.trim() === 'true') {
                // startTime or endTime 處於已預約的時段區間中
                if (timeBlocks[i].startTime < startTime && startTime < timeBlocks[i].endTime) {
                    errorMessage = `該時段已有其他人預約(${timeBlocks[i].startTime}~${timeBlocks[i].endTime})，無法復原刪除之項目`
                    break
                }
                if (timeBlocks[i].startTime < endTime && endTime < timeBlocks[i].endTime) {
                    errorMessage = `該時段已有其他人預約(${timeBlocks[i].startTime}~${timeBlocks[i].endTime})，無法復原刪除之項目`
                    break
                }
                // startTime ~ endTime 涵蓋其他已預約的時段區間
                if (startTime < timeBlocks[i].startTime && timeBlocks[i].endTime < endTime) {
                    errorMessage = `該時段已有其他人預約(${timeBlocks[i].startTime}~${timeBlocks[i].endTime})，無法復原刪除之項目`
                    break
                }
            }
        }
        return errorMessage
    }

    function checkFormData(formData) {
        const errorMessages = []

        // 檢查開始時間是否晚於結束時間
        if (formData.startTime > formData.endTime) {
            errorMessages.push(`開始時間不可以晚於結束時間 ${formData.startTime} ${formData.endTime}`)
        }

        // 檢查開始時段 & 結束時段，比對是否有同時段已登記的資料
        let timeErrorMessage = checkTimeAvailable(formData.startTime, formData.endTime)
        if (timeErrorMessage.length > 0) errorMessages.push(timeErrorMessage)

        // TODO:檢查其他欄位格式
        if (formData.user.trim() === '' || formData.user === null) {
            errorMessages.push('申請者不可為空白')
        }
        if (formData.purpose.trim() === '' || formData.purpose === null) {
            errorMessages.push('用途不可為空白')
        }
        if (formData.tel.trim() === '' || formData.tel === null) {
            errorMessages.push('聯絡電話不可為空白')
        }

        // 如果有錯誤，跳出錯誤提示
        if (errorMessages.length > 0) {
            let errorMessagesString = ''
            errorMessages.forEach((message) => {
                errorMessagesString = errorMessagesString + `${message}\n\n`
            })
            window.alert(errorMessagesString)
            return false
        }
        return true
    }

    return (
        <ModalContainerWrapper className="ModalContainer" isShow={isShow}>
            <ModalCloseWrapper>
                <Button1 onClick={() => setShowModal(null)}>close</Button1>
            </ModalCloseWrapper>
            {/* 日期 + 會議室 */}
            <PageTitleWrapper>
                <h2>
                    會議室:{showRoom} &nbsp; {date} {`(${calculateDay(date)})`}
                </h2>
            </PageTitleWrapper>

            {/* 分隔線 */}
            <Divider></Divider>

            <ModalMainWrapper>
                {/* TODO:新增「確認送出」視窗，讓使用者再檢查一次資訊 */}
                {/* 新增會議室登記的表格 */}
                <AddNewEventForm
                    onSubmit={(event) => {
                        event.preventDefault()
                        const checkResult = checkFormData({
                            startTime: newEventInfo.startTime,
                            endTime: newEventInfo.endTime,
                            user: newEventInfo.user,
                            purpose: newEventInfo.purpose,
                            tel: newEventInfo.tel,
                        })
                        if (checkResult) {
                            handlePostData(
                                {
                                    startTime: newEventInfo.startTime,
                                    endTime: newEventInfo.endTime,
                                    user: newEventInfo.user,
                                    purpose: newEventInfo.purpose,
                                    tel: newEventInfo.tel,
                                    excelRowIndex: newEventInfo.excelRowIndex,
                                    excelColumnAlphabet: nextEmptyColumnAlphabet,
                                },
                                'post'
                            )
                        }
                    }}
                >
                    <PageTitleWrapper>
                        <h2>新增會議室登記</h2>
                    </PageTitleWrapper>
                    <InputGroupWrapper>
                        <label htmlFor={index + 'startTime'}>開始時段</label>
                        <input id={index + 'startTime'} type="time" onChange={(e) => handleChange(e.target.value, 'startTime')} required></input>
                    </InputGroupWrapper>
                    <InputGroupWrapper>
                        <label htmlFor={index + 'endTime'}>結束時段</label>
                        <input id={index + 'endTime'} type="time" onChange={(e) => handleChange(e.target.value, 'endTime')} required></input>
                    </InputGroupWrapper>
                    <InputGroupWrapper>
                        <label htmlFor={index + 'user'}>申請者</label>
                        <input id={index + 'user'} type="text" onChange={(e) => handleChange(e.target.value.trim(), 'user')} required></input>
                    </InputGroupWrapper>
                    <InputGroupWrapper>
                        <label htmlFor={index + 'purpose'}>用途</label>
                        <input id={index + 'purpose'} type="text" onChange={(e) => handleChange(e.target.value.trim(), 'purpose')} required></input>
                    </InputGroupWrapper>
                    <InputGroupWrapper>
                        <label htmlFor={index + 'tel'}>聯絡電話</label>
                        <input id={index + 'tel'} type="text" onChange={(e) => handleChange(e.target.value.trim(), 'tel')} required></input>
                    </InputGroupWrapper>
                    <Button1 type="submit">確認送出</Button1>
                </AddNewEventForm>

                {/* 分隔線 */}
                <Divider></Divider>

                {/* 已登記時段 */}
                <PageTitleWrapper>
                    <h2>已登記時段</h2>
                </PageTitleWrapper>
                {/* TODO:新增編輯功能 */}
                <EventsWrapper>
                    {eachDay.length > 0 &&
                        eachDay.map((event, index) => {
                            if (event.startTime && Number(event.room) === showRoom && event.existed.trim() === 'true') {
                                return (
                                    <EventWrapper key={index}>
                                        <div>{event.startTime ? `開始時段：${event.startTime}` : ''}</div>
                                        <div>{event.startTime ? `結束時段：${event.endTime}` : ''}</div>
                                        <div>{event.startTime ? `申請者：${event.user}` : ''}</div>
                                        <div>{event.startTime ? `用途：${event.purpose}` : ''}</div>
                                        <div>{event.startTime ? `聯絡電話：${event.tel}` : ''}</div>
                                        <div>{event.startTime ? `會議室：${event.room}` : ''}</div>
                                        <div>{event.startTime ? `是否預約：${event.existed}` : ''}</div>
                                        <Button1 onClick={() => handlePostData(event, 'delete')}>刪除</Button1>
                                    </EventWrapper>
                                )
                            } else {
                                return ''
                            }
                        })}
                </EventsWrapper>

                {/* 分隔線 */}
                <Divider></Divider>

                {/* 已刪除時段 */}
                <PageTitleWrapper>
                    <h2>已刪除時段</h2>
                </PageTitleWrapper>
                <EventsWrapper>
                    {eachDay.length > 0 &&
                        eachDay.map((event, index) => {
                            if (event.startTime && Number(event.room) === showRoom && event.existed.trim() === 'false') {
                                return (
                                    <EventWrapper key={index} color={'#999999'}>
                                        <div>{event.startTime ? `開始時段：${event.startTime}` : ''}</div>
                                        <div>{event.startTime ? `結束時段：${event.endTime}` : ''}</div>
                                        <div>{event.startTime ? `申請者：${event.user}` : ''}</div>
                                        <div>{event.startTime ? `用途：${event.purpose}` : ''}</div>
                                        <div>{event.startTime ? `聯絡電話：${event.tel}` : ''}</div>
                                        <div>{event.startTime ? `會議室：${event.room}` : ''}</div>
                                        <div>{event.startTime ? `是否預約：${event.existed}` : ''}</div>
                                        <Button1
                                            onClick={(e) => {
                                                e.preventDefault()
                                                // 檢查欲復原的預約時間，是否目前已經被預約了
                                                let errorMessage = ''
                                                errorMessage = checkTimeAvailable(event.startTime.replace('：', ':'), event.endTime.replace('：', ':'))
                                                if (errorMessage.length > 0) {
                                                    window.alert(errorMessage)
                                                    return
                                                }
                                                handlePostData(event, 'restore')
                                            }}
                                        >
                                            復原
                                        </Button1>
                                    </EventWrapper>
                                )
                            } else {
                                return ''
                            }
                        })}
                </EventsWrapper>
            </ModalMainWrapper>
        </ModalContainerWrapper>
    )
}

export default ModalContainer
