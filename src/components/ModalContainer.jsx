import { useState } from 'react'
import styled, { css } from 'styled-components'

// 專案 components
import { Button1, Button1Fake } from './miniComponents/Buttons.jsx'
import PageTitleWrapper from './miniComponents/PageTitleWrapper.jsx'

// 專案 helpers
import { calculateDay } from '../utils/helpers.js'

// 讀寫 google sheet 的 API，使用 app script
import { postData } from '../utils/api.js'

// material-ui 的 components
import Divider from '@mui/material/Divider'
// 「確認送出」視窗(Dialog)
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const ModalContainerWrapper = styled.div`
    position: fixed;
    top: 5%;
    left: 50%;
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 90vh;
    overflow-y: scroll;
    padding: 20px 20px 20px 30px;
    /* https://getcssscan.com/css-box-shadow-examples #28 */
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
    background-color: #ffffff;
    z-index: ${({ isShow }) => (isShow ? '990' : '-1')};
    transform: ${({ isShow }) => (isShow ? 'translateX(-50%) scale(1, 1)' : 'translateX(-50%) scale(1, 0)')};
    transform-origin: top center;
    transition: all 0.2s;
    /* 配合 material-ui 所以數字很奇怪，需 <Dialog視窗 && >Box左側欄位 */
    z-index: 1201;

    @media (min-width: 576px) {
        padding: 20px 20px 20px 50px;
    }

    @media (min-width: 768px) {
        max-width: 800px;
        padding: 20px 25px 20px 80px;
    }

    @media (min-width: 992px) {
        max-width: 850px;
        padding: 20px 30px 20px 100px;
    }
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

const EditEventForm = styled(AddNewEventForm)`
    position: absolute;
    transform: scale(0, 0);
    z-index: -10;
    padding: 15px;
    border: 1px solid #dddddd;

    ${({ isShow }) =>
        isShow &&
        css`
            position: relative;
            transform: scale(1, 1);
            z-index: 9999;
            border: 1px solid #999999;
        `}
`

const ButtonsWrapper = styled.div`
    position: ${({ isShow }) => (isShow ? 'relative' : 'absolute')};
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    z-index: ${({ isShow }) => (isShow ? '1' : '-1')};
    opacity: ${({ isShow }) => (isShow ? '1' : '0')};
    button:nth-child(1) {
        margin-right: 10px;
    }
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
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 5px;
    border: 1px solid #dddddd;
    margin-bottom: 30px;
    color: ${({ color }) => (color ? color : '#000000')};
    ${({ isColorPale }) =>
        isColorPale &&
        css`
            > div {
                color: #999999;
            }
        `}
`

function ModalContainer({ eachDay, index, date, isShow, setShowModal, showRoom, excelRowIndex, setIsUpdating }) {
    const [isEditModalShow, setIsEditModalShow] = useState(-1)
    const [newEventInfo, setNewEventInfo] = useState({
        startTime: null,
        endTime: null,
        user: null,
        purpose: null,
        tel: '',
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
            const existed = type === 'post' ? true : type === 'delete' ? false : type === 'put' ? true : false
            setIsUpdating(true) // 進入更新中狀態，打開全銀幕 modal 讓使用者無法做操作
            const data = {
                type: type,
                postInfo: `${formData.startTime}\n${formData.endTime}\n${formData.user}\n${formData.purpose}\n${formData.tel}\n${showRoom}\n${existed}\n${formData.excelRowIndex}\n${formData.excelColumnAlphabet}`, // 開始時段：09:00\n結束時段：10:00\n申請者：張三\n用途：##會議\n聯絡電話：02-12345678
                columnAlphabet: formData.excelColumnAlphabet,
                rowIndex: formData.excelRowIndex,
            }
            const result = await postData(data)

            // 確認向後端操作結果
            if (result.status === 200) {
                // 200連線與伺服器都正常
                if (result.data.includes('成功')) {
                    window.alert('操作成功')
                } else {
                    // 使用者 post 新預約資訊時，確認 sheet 中該 row 的 cell 仍然是空白的才可以執行操作(避免兩位使用者在極短時間內先後，針對同一日(sheet 上同一 row) post 新預約資訊，此時兩個 post 都要寫入到同一個 cell，造成第二位使用者的資訊覆寫掉第一位)。
                    // 未成功操作，原因：有兩位使用者同時向後端相同 row 的新增(post)預約資料，第一位使用者可以成功寫入預約資料到空白的 cell 中，第二位發送資料時因為該 cell 已經有資料了，所以會失敗。此外，因為每次發送 post/put/delete 後，都會再 fetch 資料，所以此時 nextEmptyColumnAlphabet 已經被更新，所以第二位使用者只要再 submit 就沒問題了(除非登記同一個會議室 && 有重疊時段)。
                    window.alert('連線逾時，請再行嘗試')
                }
            } else {
                // 未成功操作
                window.alert('連線異常')
            }
            setIsUpdating(false) // 關閉更新中狀態，關閉全銀幕 modal
            setShowModal(null) // 關閉當前日期的 modal
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
    // originalTimePair 是用來處理「編輯」的情況。在確認輸入資訊是否與其他預約時段重疊時，不需要把該筆預約資料的原始開始時段、結束時段，納入比對項目中
    function checkTimeAvailable(startTime, endTime, originalTimePair) {
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

                // originalTimePair 是用來處理「編輯」的情況。在確認輸入資訊是否與其他預約時段重疊時，不需要把該筆預約資料的原始開始時段、結束時段，納入比對項目中
                if (originalTimePair) {
                    if (tempTimeBlock.startTime !== originalTimePair.startTime && tempTimeBlock.endTime !== originalTimePair.endTime) {
                        timeBlocks.push(tempTimeBlock)
                    }
                } else {
                    timeBlocks.push(tempTimeBlock)
                }
            }
        })

        // 開始比對，輸入之日期是否在已預約的時段區間中
        for (let i = 0; i < timeBlocks.length; i++) {
            if (timeBlocks[i].room.trim() === showRoom.toString() && timeBlocks[i].existed.trim() === 'true') {
                // startTime or endTime 處於已預約的時段區間中
                if (timeBlocks[i].startTime < startTime && startTime < timeBlocks[i].endTime) {
                    errorMessage = `該時段已有其他人預約(${timeBlocks[i].startTime}~${timeBlocks[i].endTime})，無法新增預約項目、復原刪除之預約項目`
                    break
                }
                if (timeBlocks[i].startTime < endTime && endTime < timeBlocks[i].endTime) {
                    errorMessage = `該時段已有其他人預約(${timeBlocks[i].startTime}~${timeBlocks[i].endTime})，無法新增預約項目、復原刪除之預約項目`
                    break
                }
                // startTime ~ endTime 涵蓋其他已預約的時段區間
                if (startTime <= timeBlocks[i].startTime && timeBlocks[i].endTime <= endTime) {
                    errorMessage = `該時段已有其他人預約(${timeBlocks[i].startTime}~${timeBlocks[i].endTime})，無法新增預約項目、復原刪除之預約項目`
                    break
                }
                // 排除 startTime === endTime 的情況
                if (startTime === endTime) {
                    errorMessage = `開始時段不可以等於結束時段，無法新增預約項目、復原刪除之預約項目`
                    break
                }
            }
        }
        return errorMessage
    }

    function checkFormData(formData, originalTimePair) {
        const errorMessages = []

        // 檢查開始時間是否晚於結束時間
        if (formData.startTime > formData.endTime) {
            errorMessages.push(`開始時間不可以晚於結束時間 ${formData.startTime} ${formData.endTime}`)
        }

        // 檢查開始時段 & 結束時段，比對是否有同時段已登記的資料
        let timeErrorMessage = checkTimeAvailable(formData.startTime, formData.endTime, originalTimePair)
        if (timeErrorMessage.length > 0) errorMessages.push(timeErrorMessage)

        // TODO:檢查其他欄位格式
        if (formData.user.trim() === '' || formData.user === null) {
            errorMessages.push('申請者不可為空白')
        }
        if (formData.purpose.trim() === '' || formData.purpose === null) {
            errorMessages.push('用途不可為空白')
        }
        // 可以接受不填電話
        // if (formData.tel.trim() === '' || formData.tel === null) {
        //     errorMessages.push('聯絡電話不可為空白')
        // }

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

    const [open, setOpen] = useState(false)
    const handleClickOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
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
                {/* 新增會議室登記的表格 */}
                <AddNewEventForm
                    onSubmit={(event) => {
                        event.preventDefault()
                        // 程式檢查使用者輸入資訊空值，時段是否與其他預約資料有重疊
                        const checkResult = checkFormData(
                            {
                                startTime: newEventInfo.startTime,
                                endTime: newEventInfo.endTime,
                                user: newEventInfo.user,
                                purpose: newEventInfo.purpose,
                                tel: newEventInfo.tel,
                            },
                            null
                        )
                        if (checkResult) {
                            // 跳出「確認送出」視窗，讓使用者再檢查一次資訊
                            handleClickOpen()
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
                        <input id={index + 'tel'} type="text" onChange={(e) => handleChange(e.target.value.trim(), 'tel')}></input>
                    </InputGroupWrapper>
                    <Button1 type="submit">確認送出</Button1>

                    {/* 「確認送出」視窗，讓使用者再檢查一次資訊 */}
                    <Dialog className="ModalContainer" open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">{'確認送出'}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                <div>開始時段：{newEventInfo.startTime}</div>
                                <div>結束時段：{newEventInfo.endTime}</div>
                                <div>申請者：{newEventInfo.user}</div>
                                <div>用途：{newEventInfo.purpose}</div>
                                <div>聯絡電話：{newEventInfo.tel}</div>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
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
                                    handleClose()
                                }}
                            >
                                送出
                            </Button>
                            <Button onClick={handleClose}>取消</Button>
                        </DialogActions>
                    </Dialog>
                </AddNewEventForm>

                {/* 分隔線 */}
                <Divider></Divider>

                {/* 已登記時段 */}
                <PageTitleWrapper>
                    <h2>已登記時段</h2>
                </PageTitleWrapper>
                <EventsWrapper>
                    {eachDay.length > 0 &&
                        eachDay.map((event, index) => {
                            if (event.startTime && Number(event.room) === showRoom && event.existed.trim() === 'true') {
                                return (
                                    <EventWrapper key={index} isColorPale={index === isEditModalShow}>
                                        <div>{event.startTime ? `開始時段：${event.startTime}` : ''}</div>
                                        <div>{event.startTime ? `結束時段：${event.endTime}` : ''}</div>
                                        <div>{event.startTime ? `申請者：${event.user}` : ''}</div>
                                        <div>{event.startTime ? `用途：${event.purpose}` : ''}</div>
                                        <div>{event.tel ? `聯絡電話：${event.tel}` : `聯絡電話：`}</div>
                                        <div>{event.startTime ? `會議室：${event.room}` : ''}</div>
                                        {/* <div>{event.startTime ? `是否預約：${event.existed}` : ''}</div> */}
                                        <ButtonsWrapper isShow={index !== isEditModalShow}>
                                            <Button1 onClick={() => setIsEditModalShow(index)}>編輯</Button1>
                                            <Button1 onClick={() => handlePostData(event, 'delete')}>刪除</Button1>
                                        </ButtonsWrapper>

                                        {/* 編輯預約資料的表格 */}
                                        <EditEventForm
                                            isShow={index === isEditModalShow}
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                // 程式檢查使用者輸入資訊空值，時段是否與其他預約資料有重疊
                                                const checkResult = checkFormData(
                                                    {
                                                        startTime: e.target[0].value,
                                                        endTime: e.target[1].value,
                                                        user: e.target[2].value,
                                                        purpose: e.target[3].value,
                                                        tel: e.target[4].value,
                                                    },
                                                    {
                                                        startTime: event.startTime.replace('：', ':'),
                                                        endTime: event.endTime.replace('：', ':'),
                                                    }
                                                )
                                                if (checkResult) {
                                                    handlePostData(
                                                        {
                                                            startTime: e.target[0].value,
                                                            endTime: e.target[1].value,
                                                            user: e.target[2].value,
                                                            purpose: e.target[3].value,
                                                            tel: e.target[4].value,
                                                            excelRowIndex: event.excelRowIndex,
                                                            excelColumnAlphabet: event.excelColumnAlphabet,
                                                        },
                                                        'put'
                                                    )
                                                    setIsEditModalShow(-1)
                                                }
                                            }}
                                        >
                                            <InputGroupWrapper>
                                                <label htmlFor={'edit' + index + 'startTime'}>開始時段</label>
                                                <input id={'edit' + index + 'startTime'} type="time" defaultValue={event.startTime.replace('：', ':')} required></input>
                                            </InputGroupWrapper>
                                            <InputGroupWrapper>
                                                <label htmlFor={'edit' + index + 'endTime'}>結束時段</label>
                                                <input id={'edit' + index + 'endTime'} type="time" defaultValue={event.endTime.replace('：', ':')} required></input>
                                            </InputGroupWrapper>
                                            <InputGroupWrapper>
                                                <label htmlFor={'edit' + index + 'user'}>申請者</label>
                                                <input id={'edit' + index + 'user'} type="text" defaultValue={event.user} required></input>
                                            </InputGroupWrapper>
                                            <InputGroupWrapper>
                                                <label htmlFor={'edit' + index + 'purpose'}>用途</label>
                                                <input id={'edit' + index + 'purpose'} type="text" defaultValue={event.purpose} required></input>
                                            </InputGroupWrapper>
                                            <InputGroupWrapper>
                                                <label htmlFor={'edit' + index + 'tel'}>聯絡電話</label>
                                                <input id={'edit' + index + 'tel'} type="text" defaultValue={event.tel}></input>
                                            </InputGroupWrapper>
                                            <ButtonsWrapper isShow={index === isEditModalShow}>
                                                <Button1 type="submit">確認送出編輯</Button1>
                                                <Button1Fake onClick={() => setIsEditModalShow(-1)}>取消編輯</Button1Fake>
                                            </ButtonsWrapper>
                                        </EditEventForm>
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
                                        <div>{event.tel ? `聯絡電話：${event.tel}` : `聯絡電話：`}</div>
                                        <div>{event.startTime ? `會議室：${event.room}` : ''}</div>
                                        {/* <div>{event.startTime ? `是否預約：${event.existed}` : ''}</div> */}
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
                                                handlePostData(event, 'put')
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
