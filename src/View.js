import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Canvas } from './Canvas.js'
import { Form, Navbar, Nav, ButtonGroup, ToggleButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSquare, BsCircle, BsSlash } from 'react-icons/bs';

export class View extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'none'
        };
        this.canvasRef = React.createRef();
    }

    setSquare() {
        this.setState({type: 'square'});
        this.canvasRef.setType('square');
    }

    setCircle() {
        this.setState({type: 'circle'});
        // this.canvasRef.setType('circle');
    }

    setLine() {
        this.setState({type: 'line'});
        // this.canvasRef.setType('line');
    }

    render() {
        return (
            <>
                {/* <Form.Row>
                    <Navbar bg="dark" variant="dark" style={{ width: '100%', height: '60px' }}>
                        <Navbar.Brand>TutorPad</Navbar.Brand>
                        <Nav>
                            <ButtonGroup toggle>
                                <ToggleButton variant='light' type='radio' onClick={e => this.setSquare()}>{<BsSquare />}</ToggleButton>
                                <ToggleButton variant='light' type='radio' onClick={e => this.setCircle()}>{<BsCircle />}</ToggleButton>
                                <ToggleButton variant='light' type='radio' onClick={e => this.setLine()}>{<BsSlash />}</ToggleButton>
                            </ButtonGroup>
                        </Nav>
                    </Navbar>
                </Form.Row> */}

                <Form.Row>
                    <div className="App">
                        <Canvas width={2000} height={2000} ref={this.canvasRef}/>
                    </div>
                </Form.Row>
            </>
        );
    }
}