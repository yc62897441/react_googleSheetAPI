import styled, { css } from 'styled-components'

const PageTitleWrapper = styled.div`
    h1 {
        color: ${({ color }) => (color ? color : '#444444')};
        font-size: 30px;
        font-weight: 600;
        font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI Semibold', 'Segoe UI', 'Lucida Grande';
    }

    h2 {
        color: ${({ color }) => (color ? color : '#444444')};
        font-size: 20px;
        font-weight: 400;
        font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI Semibold', 'Segoe UI', 'Lucida Grande';
    }

    h3 {
        color: ${({ color }) => (color ? color : '#444444')};
        font-size: 18px;
        font-weight: 400;
        font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI Semibold', 'Segoe UI', 'Lucida Grande';
    }

    h4 {
        color: ${({ color }) => (color ? color : '#444444')};
        font-size: 16px;
        font-weight: 400;
        font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI Semibold', 'Segoe UI', 'Lucida Grande';
    }

    @media (min-width: 992px) {
        h1 {
            font-size: 45px;
        }
        h2 {
            font-size: 25px;
        }
        h3 {
            font-size: 22px;
        }
        h4 {
            font-size: 20px;
        }
    }
`

const PageTitleWrapper2 = styled(PageTitleWrapper)`
    margin: 30px;
    h2 {
        padding: 5px 10px;
        border-radius: 10px;
        cursor: pointer;

        :hover {
            color: #3ec1d5;
            transform: scale(1.05);
            transition: all 0.2s;
        }

        ${({ isActive }) =>
            isActive &&
            css`
                color: #3ec1d5;
            `}
    }
`

export { PageTitleWrapper2 }
export default PageTitleWrapper
