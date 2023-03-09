import { useState, useEffect, Fragment } from 'react'
import styled, { css } from 'styled-components'

// 專案 components
import ModalContainer from './ModalContainer.jsx'
import PageTitleWrapper from './miniComponents/PageTitleWrapper.jsx'
import { Button1 } from './miniComponents/Buttons.jsx'

// 專案 helpers
import { calculateDay } from '../utils/helpers.js'

// 讀寫 google sheet 的 API，使用 app script
import { getData, startFetchRowIndex } from '../utils/api'

// material-ui 的 components
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuIcon from '@mui/icons-material/Menu'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

// 左側欄位的寬度(單位px)
const drawerWidth = 330

// 網站平台連結清單
const drawGroupData = [
    {
        title: '富威電力官網',
        url: 'https://platform.fwp.com.tw/',
        icon: <ExitToAppIcon />,
    },
    {
        title: '正航簽核系統',
        url: 'https://bpm.fwp.com.tw/Login.aspx',
        icon: <ExitToAppIcon />,
    },
    {
        title: '綠電交易平台',
        url: 'https://platform.fwp.com.tw/Foxwell/',
        icon: <ExitToAppIcon />,
    },
    {
        title: '森崴能源一等一',
        url: 'http://bpm.shinfox.com.tw/UOF/Login.aspx',
        icon: <ExitToAppIcon />,
    },
    {
        title: '森崴能源員工入口平台',
        url: 'http://hr.shinfox.com.tw:8085/Portal/Login.aspx',
        icon: <ExitToAppIcon />,
    },
    {
        title: '台電電能轉直供服務平台',
        url: 'https://powerwheeling.taipower.com.tw/powerwheeling/DataSearch',
        icon: <ExitToAppIcon />,
    },
]

const Link = styled.a`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 100%auto;
    text-decoration: none;

    div span {
        text-decoration: none;
        color: rgba(0, 0, 0, 0.87);
    }
`

const DrawGroup = (
    <div>
        <Toolbar>網站平台連結</Toolbar>
        <Divider />
        <List>
            {drawGroupData.length > 0 &&
                drawGroupData.map((element, index) => (
                    <ListItem key={element.title} disablePadding>
                        <ListItemButton>
                            <Link href={element.url} target="_blank">
                                <ListItemIcon>{element.icon}</ListItemIcon>
                                <ListItemText primary={element.title} />
                            </Link>
                        </ListItemButton>
                    </ListItem>
                ))}
        </List>
    </div>
)

const TableDiv = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-gap: 15px 10px;
    padding: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    overflow-x: scroll;
`

const TableCellDiv = styled.div`
    width: 100%;
    min-width: 200px;
    font-size: 20px;
    border: 1px solid transparent;
    /* padding: 0 2px; */

    ${({ flexColumn }) =>
        flexColumn &&
        css`
            position: relative;
            display: flex;
            flex-direction: column;

            /* 適合只顯示每則預約(event)的起訖時間的版面高度 */
            height: 175px;
            /* 適合顯示每則預約(event)的完整資訊的版面高度 */
            /* height: 100%;
            min-height: 150px;
            max-height: 300px; */
           
            border: 1px solid #dddddd;
            font-size: 16px;
            cursor: pointer;
            overflow-y: hidden;
            :hover {
                border: 1px solid #999999;
            }

            :after {
                position: absolute;
                top: 0;
                display: block;
                content: '';
                width: 100%;
                height: 100%;
                background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8));
            }
        `}
`

const TableCellSectionDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 5px;
    border-bottom: 1px solid #dddddd;
    /* margin: 2px 0; */

    ${({ isDate }) =>
        isDate &&
        css`
            font-size: 18px;
            background-color: #f6f6f6;
        `}
`

const IsUpdatingModal = styled.div`
    position: fixed;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    z-index: ${({ isUpdating }) => (isUpdating ? '9999' : '-999')};
    background-color: ${({ isUpdating }) => (isUpdating ? '#FFFFFF' : '#FFFFFF')};
    opacity: ${({ isUpdating }) => (isUpdating ? '0.8' : '0')};

    div {
        font-size: 2rem;
        font-weight: 700;
    }
`

const IsLoadingModal = styled(IsUpdatingModal)`
    z-index: ${({ isLoading }) => (isLoading ? '9999' : '-999')};
    background-color: ${({ isLoading }) => (isLoading ? '#FFFFFF' : '#FFFFFF')};
    opacity: ${({ isLoading }) => (isLoading ? '0.8' : '0')};
`

const IsShowModal = styled(IsUpdatingModal)`
    z-index: ${({ isShowingModal }) => (isShowingModal ? '1200' : '-999')};
    background-color: ${({ isShowingModal }) => (isShowingModal ? '#FFFFFF' : '#FFFFFF')};
    opacity: ${({ isShowingModal }) => (isShowingModal ? '0.8' : '0')};
`

const RoomButtonsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const RoomButton = styled(Button1)`
    margin-right: 5px;
    border-radius: 5px;

    ${({ active }) =>
        active &&
        css`
            background-color: #dc3545;
            color: #ffffff;
        `}
`

const dummyRooms = [601, 602]

export default function ResponsiveDrawer() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showRoom, setShowRoom] = useState(dummyRooms[0])
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [data, setData] = useState({
        majorDimension: '', // "ROWS"
        range: '', // "'工作表1'!A1:L936"
        values: [],
    })
    const [show, setShowModal] = useState(null)

    useEffect(() => {
        async function handleGetDate() {
            try {
                // 撈資料時，先給個 modal 擋著，不要給使用者操作。免得網速比較慢的時候，還沒拉回最新資料就進行操作了。
                setIsLoading(true)
                const result = await getData()
                const values = formatCalendarData(result.data.values)
                setData({
                    majorDimension: result.data.majorDimension, // "ROWS"
                    range: result.data.range, // "'工作表1'!A1:L936"
                    values: values,
                })
                setIsLoading(false)
            } catch (error) {
                console.log(error)
            }
        }

        // 點擊 Modal 以外的畫面，會關閉 Modal
        const closeModal = (event) => {
            let obj = event.target
            while (obj) {
                if (obj.classList.contains('openModal') || obj.classList.contains('ModalContainer')) {
                    return
                }
                obj = obj.offsetParent
            }
            setShowModal(null)
        }

        // 只有在初始化時 isUpdating === false時；以及向後端更新資訊時，isUpdating 變為 true，並等到更新完成後再變回 false 時，會執行。
        if (!isUpdating) {
            handleGetDate()
            window.addEventListener('click', closeModal, false)
        }

        return () => {
            window.removeEventListener('click', closeModal, false)
        }
    }, [isUpdating])

    function formatCalendarData(rawValues) {
        // 重構行事曆資料結構
        const values = [] // 預期結果 [['2023/02/23', {02/23第1件事}, {02/23第2件事}...], ['2023/02/24', {02/24第1件事}, {02/24第2件事}...]]
        for (let rowIndex = 0; rowIndex < rawValues.length; rowIndex++) {
            const tempRow = [] // 預期結果 [{02/23第1件事}, {02/23第2件事}...]
            // 產生 [{02/23第1件事}, {02/23第2件事}...]，並依照 startTime 由早到晚排序
            for (let eventIndex = 1; eventIndex < rawValues[rowIndex].length; eventIndex++) {
                const rawString = rawValues[rowIndex][eventIndex]
                const eventInfoArray = rawString.split('\n')
                const evenInfoObject = {
                    startTime: eventInfoArray[0],
                    endTime: eventInfoArray[1],
                    user: eventInfoArray[2],
                    purpose: eventInfoArray[3],
                    tel: eventInfoArray[4],
                    room: eventInfoArray[5],
                    existed: eventInfoArray[6],
                    excelRowIndex: eventInfoArray[7],
                    excelColumnAlphabet: eventInfoArray[8],
                }
                tempRow.push(evenInfoObject)
            }
            // 依照 startTime 來排序該日的 events
            tempRow.sort(function (a, b) {
                if (a.startTime > b.startTime) {
                    return 1 // 正數時，後面的數放在前面
                } else {
                    return -1 // 負數時，前面的數放在前面
                }
            })

            // 組合該日日期與該日的 events，第一項是日期，之後是 events，預期結果 ['2023/02/23', {02/23第1件事}, {02/23第2件事}...]
            values.push([rawValues[rowIndex][0], ...tempRow])
        }

        return values
    }

    function handleShowModal(value) {
        setShowModal(value)
    }

    // RWD 開啟或收合左側欄位
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* 標題欄位 */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        富威電力內部入口網站
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* 左側欄位：網站平台連結清單 */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                {/* RWD 手機版 */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {DrawGroup}
                </Drawer>
                {/* RWD 桌電版 */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {DrawGroup}
                </Drawer>
            </Box>

            {/* 右側內容區塊：會議室預約時段表格 */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />

                <PageTitleWrapper>
                    <h1>會議室登記</h1>
                </PageTitleWrapper>

                <RoomButtonsWrapper>
                    {dummyRooms.length > 0 &&
                        dummyRooms.map((room, index) => (
                            <RoomButton key={index} active={room === showRoom} onClick={() => setShowRoom(room)}>
                                {room}
                            </RoomButton>
                        ))}
                </RoomButtonsWrapper>
                <br />

                {data.values.length > 0 && (
                    <TableDiv>
                        {data.values.map((eachDay, index) => (
                            <Fragment key={index}>
                                <TableCellDiv className="openModal" flexColumn={true} onClick={() => handleShowModal(index)}>
                                    {eachDay.length > 0 &&
                                        eachDay.map((event, index) => {
                                            if (index === 0) {
                                                return (
                                                    <TableCellSectionDiv className="openModal" key={index} isDate={true}>
                                                        <div className="openModal">
                                                            {event} {`(${calculateDay(event)})`}
                                                        </div>
                                                    </TableCellSectionDiv>
                                                )
                                            } else if (index > 0 && Number(event.room) === showRoom && event.existed.trim() === 'true') {
                                                return (
                                                    <TableCellSectionDiv className="openModal" key={index}>
                                                        <div className="openModal">{`● ${event.startTime} - ${event.endTime}`}</div>
                                                        {/* <div className="openModal">{event.startTime ? `開始時段：${event.startTime}` : ''}</div>
                                                        <div className="openModal">{event.startTime ? `結束時段：${event.endTime}` : ''}</div>
                                                        <div className="openModal">{event.startTime ? `申請者：${event.user}` : ''}</div>
                                                        <div className="openModal">{event.startTime ? `用途：${event.purpose}` : ''}</div>
                                                        <div className="openModal">{event.tel ? `聯絡電話：${event.tel}` : `聯絡電話：`}</div>
                                                        <div className="openModal">{event.startTime ? `會議室：${event.room}` : ''}</div> */}
                                                        {/* <div className="openModal">{event.startTime ? `已預約：${event.existed}` : ''}</div> */}
                                                    </TableCellSectionDiv>
                                                )
                                            }
                                        })}
                                </TableCellDiv>
                                <ModalContainer className="ModalContainer" eachDay={eachDay} index={index} date={eachDay[0]} isShow={index === show} setShowModal={setShowModal} showRoom={showRoom} excelRowIndex={startFetchRowIndex + index} setIsUpdating={setIsUpdating}></ModalContainer>
                            </Fragment>
                        ))}
                    </TableDiv>
                )}
            </Box>

            {/* 向後端送出 post 更新資訊，打開全銀幕 modal 讓使用者無法做操作 */}
            <IsUpdatingModal isUpdating={isUpdating}>
                <div>更新中</div>
            </IsUpdatingModal>

            {/* useEffect()撈資料時，先給個 modal 擋著，不要給使用者操作。免得網速比較慢的時候，還沒拉回最新資料就進行操作了。 */}
            <IsLoadingModal isLoading={isLoading}>
                <div>讀取資料中</div>
            </IsLoadingModal>

            {/* 開啟 ModalContainer 時，打開全銀幕 IsShowModal，讓視覺集中在 ModalContainer 上面，也避免去點擊到左側欄位 */}
            <IsShowModal isShowingModal={show !== null ? true : false}></IsShowModal>
        </Box>
    )
}
