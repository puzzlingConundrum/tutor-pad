import React from 'react'
import '../App.css'
import { Form, Navbar, Nav, ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap';
import { BiEraser, BiPause, BiPlay, BiVideoRecording, BiDownload, BiSave, BiUpload, BiText, BiKey } from 'react-icons/bi'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsX } from 'react-icons/bs';

export default class ReplayButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playing: false
        }
    }
    
    render() {
        return (
            <ButtonGroup toggle className={'replay-button' && this.state.playing ? 'replay-button-on' : ''}>
                <ToggleButton title={this.props.date} className={'replay-toggle-button'} variant='link' type='radio' onDoubleClick={""} onChange={() => {this.props.replaySelect(this.props.num-1);}}>
                    <p className={'replay-button-icons'}>{this.props.date}</p>
                </ToggleButton>
                <ToggleButton title="Get uuid key" className={'replay-toggle-button'} variant='link' type='radio' onChange={() => this.props.saveSelect(this.props.num-1)}>
                    <BiKey size={25} className={'replay-button-icons'}/>
                </ToggleButton>
                <ToggleButton title="Remove" className={'replay-toggle-button'} variant='link' type='radio' onChange={() => this.props.removeSelect(this.props.num-1)}>
                    <BsX size={25} className={'replay-button-icons'}/>
                </ToggleButton>
                {/*                 
                <ToggleButton title="Download replay" className={'replay-toggle-button'} variant='link' type='radio' onChange={() => this.props.downloadSelect(this.props.num-1)}>
                    <BiDownload size={20} className={'replay-button-icons'}/>
                </ToggleButton>
                  */}
            </ButtonGroup>
        )
    }
}
