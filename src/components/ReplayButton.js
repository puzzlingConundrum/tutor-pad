import React from 'react'
import '../App.css'
import { Form, Navbar, Nav, ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap';
import { BiEraser, BiPause, BiPlay, BiVideoRecording, BiDownload, BiSave } from 'react-icons/bi'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ReplayButton(props) {

    
    return (
        <ButtonGroup toggle className='replay-button'>
            <ToggleButton variant='link' type='radio' onChange={props.replaySelect}>
                <p class='replay-button-items'>{props.num}</p>
            </ToggleButton>
            <ToggleButton variant='link' type='radio'>
                <BiSave class='replay-button-items'/>
            </ToggleButton>
            <ToggleButton variant='link' type='radio'>
                <BiDownload class='replay-button-items'/>
            </ToggleButton>
        </ButtonGroup>
    )
}
