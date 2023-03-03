import styled from 'styled-components'

const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: column;
`

const ButtonBase = styled.button`
    width: 100px;
    height: 40px;
`

const Button1 = styled(ButtonBase)`
    border: 2px solid #dc3545;
    border-radius: 20px;
    background-color: #ffffff;
    color: #dc3545;
    cursor: pointer;

    :hover {
        background-color: #dc3545;
        color: #ffffff;
        transition-duration: 0.2s;
        transition-timing-function: ease-in;
    }
`

const Button2 = styled(ButtonBase)`
    position: relative;
    border: 2px solid #dc3545;
    background-color: #ffffff;
    border-radius: 5px;
    color: #dc3545;
    cursor: pointer;

    :before {
        position: absolute;
        top: 0px;
        left: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        content: 'Click me';
        width: 0%;
        height: 100%;
        background-color: #dc3545;
        border-radius: 0px;
        color: #ffffff;
        transition: 0.4s;
        overflow: hidden;
    }

    :hover:before {
        width: 100%;
    }
`

function Buttons() {
    return (
        <ButtonsWrapper>
            <Button1>Button1</Button1>
            <br />
            <Button2>Button2</Button2>
        </ButtonsWrapper>
    )
}

export default Buttons
export { Button1, Button2 }
