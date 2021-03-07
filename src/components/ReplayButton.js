import React from 'react'
import '../App.css'
import { Form, Navbar, Nav, ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap';
import { BiEraser, BiPause, BiPlay, BiVideoRecording, BiDownload, BiSave } from 'react-icons/bi'
import 'bootstrap/dist/css/bootstrap.min.css';

export default class ReplayButton extends React.Component {
    constructor(props) {
        super(props)
    }
    
    render() {
        return (
            <ButtonGroup toggle className='replay-button'>
                <ToggleButton variant='link' type='radio' onChange={() => this.props.replaySelect(this.props.num-1)}>
                    <p class='replay-button-items'>{"Replay #" + this.props.num}</p>
                </ToggleButton>
                <ToggleButton variant='link' type='radio' onChange={() => this.props.saveSelect(this.props.num-1)}>
                    <BiSave class='replay-button-items'/>
                </ToggleButton>
                <ToggleButton variant='link' type='radio' onChange={() => this.props.downloadSelect(this.props.num-1)}>
                    <BiDownload class='replay-button-items'/>
                </ToggleButton>
            </ButtonGroup>
        )
    }
}
