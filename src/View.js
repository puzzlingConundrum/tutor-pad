import React from 'react';
import './index.css';
import { Canvas } from './Canvas.js'
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    setText() {
        this.setState({type: 'text box'});
    }

    render() {
        return (
            <>
                <Form.Row>
                    <div className="App">
                        <Canvas width={window.innerWidth} height={window.innerHeight} ref={this.canvasRef}/>
                    </div>
                </Form.Row>
            </>
        );
    }
}