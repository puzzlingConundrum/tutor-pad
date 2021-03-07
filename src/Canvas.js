import React from 'react';
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
import { Line } from './objects/Line.js';
import { BoundingBox } from './objects/BoundingBox.js';
import { TextBox } from './objects/TextBox.js';
import { Form, Navbar, Nav, ButtonGroup, ToggleButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BsSquare,
    BsCircle,
    BsSlash,
    BsCursor,
    BsSquareFill,
    BsCircleFill,
    BsSlashSquareFill,
    BsCursorFill,
    BsCursorText
} from 'react-icons/bs';

export class Canvas extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            drawing: false,
            resizeX: false,
            resizeY: false,
            moving: null,
            selected: null,
            obj: [],
            initMousePos: [], // 0: x, 1: y
            finalMousePos: [], // 0: x, 1: y
            //text: 'select',
            // setText: ''  
        };
        this.canvasRef = React.createRef();
        this.offset = 60;
        this.mouseDistance = [];
        this.mouseRange = 20;

        //this.textToShow = this.textToShow.bind(this);
   // this.onKeyPressed = this.onKeyPressed.bind(this);
    }

    setType(type) {
        this.setState({ type: { type } });
    }

    isInside(x, y, shape) {
        return (x >= shape.initX-this.mouseRange && x <= shape.finalX+this.mouseRange && y - this.offset >= shape.initY-this.mouseRange && y - this.offset <= shape.finalY+this.mouseRange);
    }

    isOnLeftSide(x, y, shape) {
        return (x >= shape.initX-this.mouseRange && x <= shape.initX+this.mouseRange && y - this.offset >= shape.initY && y - this.offset <= shape.finalY);
    }

    isOnRightSide(x, y, shape) {
        return (x >= shape.finalX-this.mouseRange && x <= shape.finalX+this.mouseRange && y - this.offset >= shape.initY && y - this.offset <= shape.finalY);
    }

    isOnTopSide(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y - this.offset >= shape.initY-this.mouseRange && y - this.offset <= shape.initY+this.mouseRange);
    }

    isOnBottomSide(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y - this.offset >= shape.finalY-this.mouseRange && y - this.offset <= shape.finalY+this.mouseRange);
    }

    getComponentWithMaxZValue(mouseX, mouseY) {
        let max = 0;
        let maxShape;
        for (let o of this.state.obj) {
            if (o.getZ() >= max && this.isInside(mouseX, mouseY, o)) {
                max = o.getZ();
                maxShape = o;
            }
        }
        return maxShape;
    }

    mouseDown(e) {
        let context = this.canvasRef.current.getContext('2d');

        if (this.state.type === 'select') {
            let selectedShape = this.getComponentWithMaxZValue(e.pageX, e.pageY);
            if (selectedShape) {
                this.setState({ initMousePos: [e.pageX, e.pageY], moving: selectedShape, selected: selectedShape });
                this.mouseDistance = [e.pageX - selectedShape.initX, e.pageY - selectedShape.initY];
            }
            if (selectedShape && !selectedShape.focus) {
                for (let o = 0; o < this.state.obj.length; o++) {
                    if (this.state.obj[o].getType() === 'bounding box') {
                        this.state.obj[o] = null;
                    } else {
                        this.state.obj[o].focus = false;
                    }
                    this.state.obj = this.state.obj.filter(s => s);
                }
                context.clearRect(0, 0, this.props.width, this.props.height);
                for (let o of this.state.obj) {
                    o.draw(context);
                }
                selectedShape.focus = true;
                this.setState({ initMousePos: [e.pageX, e.pageY], moving: selectedShape });
                this.setState({obj: [...this.state.obj, new BoundingBox(selectedShape)]});
                ((new BoundingBox(selectedShape)).draw(context))
            } else if (!selectedShape) {
                for (let o = 0; o < this.state.obj.length; o++) {
                    if (this.state.obj[o].getType() === 'bounding box') {
                        this.state.obj[o] = null;
                    } else {
                        this.state.obj[o].focus = false;
                    }
                    this.state.obj = this.state.obj.filter(s => s);
                }
                this.setState({ selected: null, resizeX: false, resizeY: false });
                context.clearRect(0, 0, this.props.width, this.props.height);
                for (let o of this.state.obj) {
                    o.draw(context);
                }
            }

            if (this.state.selected) {
                if (this.isOnLeftSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({resizeX: true, resizeY: false});
                } else if (this.isOnRightSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({resizeX: true, resizeY: false});
                } else if (this.isOnTopSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({resizeX: false, resizeY: true});
                } else if (this.isOnBottomSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({resizeX: false, resizeY: true});
                }
            }
        } else {
            this.setState({ drawing: true, initMousePos: [e.pageX, e.pageY - this.offset], finalMousePos: [], selected: null });
        }
    }

    move(e) {
        document.body.style.cursor = 'default';
        if (this.state.selected) {
            if (this.isOnLeftSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ew-resize';
            } else if (this.isOnRightSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ew-resize';               
            } else if (this.isOnTopSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ns-resize';
            } else if (this.isOnBottomSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ns-resize';                
            } else {
                document.body.style.cursor = 'default';
            }
        } else {
            document.body.style.cursor = 'default';
        }
        if (this.state.drawing) {
            this.setState({ finalMousePos: [e.pageX, e.pageY - this.offset] });
        }
        let temp;
        if (this.state.resizeX && this.state.selected) {
            temp = this.state.selected;
            if (this.isOnLeftSide(e.pageX, e.pageY, this.state.selected)) {
                temp.initX = e.pageX;
            } else if (this.isOnRightSide(e.pageX, e.pageY, this.state.selected)) {
                temp.finalX = e.pageX;
            }
        } else if (this.state.resizeY && this.state.selected) {
            temp = this.state.selected;
            if (this.isOnTopSide(e.pageX, e.pageY, this.state.selected)) {
                temp.initY = e.pageY-this.offset;
            } else if (this.isOnBottomSide(e.pageX, e.pageY, this.state.selected)) {
                temp.finalY = e.pageY-this.offset;
            }
        } else if (this.state.moving) {
            temp = this.state.moving;
            let distX = this.state.moving.finalX - this.state.moving.initX;
            let distY = this.state.moving.finalY - this.state.moving.initY;
            temp.initX = e.pageX - this.mouseDistance[0];
            temp.initY = e.pageY - this.mouseDistance[1];
            temp.finalX = temp.initX + distX;
            temp.finalY = temp.initY + distY;
        }
        this.setState({
            moving: temp
        });

        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        context.clearRect(0, 0, this.props.width, this.props.height);

        for (let o of this.state.obj) {
            o.draw(context);
        }
    }

    mouseUp(e) {
        let [initX, initY] = this.state.initMousePos;
        let [finalX, finalY] = this.state.finalMousePos;
        let newObject;
        this.setState({ moving: null, resizeX: false, resizeY: false });

        // check currently selected type
        switch (this.state.type) {
            case 'square':
                newObject = new Rectangle(initX, initY, finalX, finalY)
                break;
            case 'circle':
                newObject = new Circle(initX, initY, finalX, finalY);
                break;
            case 'line':
                newObject = new Line(initX, initY, finalX, finalY);
                break;
            case 'text box':
                newObject = new TextBox( initX, initY, finalX, finalY);
                break; 
            default:
                newObject = null;
        }
        if (newObject) {
            this.setState({ drawing: false, obj: [...this.state.obj, newObject] });
        }
    }
 

    keyPressed(e) {
        alert('a key is pressed');
        let context = this.canvasRef.current.getContext('2d');
        context.addEventListener('keydown', function (event) {
                alert('a key is pressed');
        }); 
    }


    componentDidUpdate() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        context.clearRect(0, 0, this.props.width, this.props.height);

        for (let o of this.state.obj) {
            o.draw(context);
        }

        let initX = this.state.initMousePos[0];
        let initY = this.state.initMousePos[1];
        let finalX = this.state.finalMousePos[0];
        let finalY = this.state.finalMousePos[1];

        switch (this.state.type) {
            case 'square':
                (new Rectangle(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                break;
            case 'circle':
                (new Circle(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                break;
            case 'line':
                (new Line(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                break;
            case 'text box':
                (new TextBox(context,  initX, initY, finalX, finalY)).preview(context, "some text", initX, initY, finalX, finalY); 
                break; 
            default:
                break;
        }
    }

    // Button onClick
    setCursor() {
        this.setState({ type: 'select', initMousePos: [], finalMousePos: [] });
    }

    setSquare() {
        this.setState({ type: 'square', initMousePos: [], finalMousePos: [] });
    }

    setCircle() {
        this.setState({ type: 'circle', initMousePos: [], finalMousePos: [] });
    }

    setLine() {
        this.setState({ type: 'line', initMousePos: [], finalMousePos: [] });
    }

    setTextBox() {
        this.setState({ type: 'text box', initMousePos: [], finalMousePos: [] });
    }
   
    render() {
        return (
            <>
                <Form.Row>
                    <Navbar bg="dark" variant="dark" style={{ width: '100%', height: '60px' }}>
                        <Navbar.Brand>TutorPad</Navbar.Brand>
                        <Nav>
                            <ButtonGroup toggle>
                                <ToggleButton variant='link' type='radio' onClick={e => this.setCursor()}>
                                    {((this.state.type === 'select') && <BsCursorFill />) || <BsCursor />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setSquare()}>
                                    {((this.state.type === 'square') && <BsSquareFill />) || <BsSquare />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setCircle()}>
                                    {((this.state.type === 'circle') && <BsCircleFill />) || <BsCircle />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setLine()}>
                                    {((this.state.type === 'line') && <BsSlashSquareFill />) || <BsSlash />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setTextBox()}>
                                    {<BsCursorText />}
                                </ToggleButton>

                            </ButtonGroup>
                        </Nav>
                    </Navbar>
                </Form.Row>

                <Form.Row>
                    <div>
                        <canvas
                            ref={this.canvasRef}
                            width={this.props.width}
                            height={this.props.height}
                            onMouseDown={e => this.mouseDown(e)}
                            onMouseMove={e => this.move(e)}
                            onMouseUp={e => this.mouseUp(e)} 
                            onKeyDown={e => this.keyPressed(e)}
 
                        ></canvas>
                    </div>
                </Form.Row>

                <div style = {{position: "fixed", bottom : 8, padding:10}}>
                    <button onClick = {() => {}}> Undo </button>
                    <button onClick = {() => {}}> Redo </button>
                </div>

                <div style = {{position: "fixed", bottom : 50, padding:10}}>
                    <input 
                        type="text"
                        value=""
                        onChange = {(e) => {
                            console.log(e.target.value);
                        }}
                    />
                </div>

                <div onKeyDown={this.keyPressed}></div>
            </>
        );
    }

    
}