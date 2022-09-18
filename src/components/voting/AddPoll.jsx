import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import {Button, FloatingLabel, Form, Modal} from "react-bootstrap";
import {stringToMicroAlgos} from "../../utils/conversions";

const AddPoll = ({createPoll}) => {
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [description, setDescription] = useState("");
    const [option1, setOption1] = useState("");
    const [option2, setOption2] = useState("");
    const [option3, setOption3] = useState("");


    const isFormFilled = useCallback(() => {
        return name && image && description && option1 && option2 && option3
    }, [name, image, description, option1, option2, option3]);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button
                onClick={handleShow}
                variant="dark"
                className="rounded-pill px-0"
                style={{width: "38px"}}
            >
                <i className="bi bi-plus"></i>
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Poll</Modal.Title>
                </Modal.Header>
                <Form>
                    <Modal.Body>
                        <FloatingLabel
                            controlId="inputName"
                            label="Product name"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                placeholder="Enter name of product"
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputUrl"
                            label="Image URL"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Image URL"
                                value={image}
                                onChange={(e) => {
                                    setImage(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputDescription"
                            label="Description"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder="description"
                                style={{ height: "80px" }}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputDescription"
                            label="Option1"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder="option1"
                                style={{ height: "80px" }}
                                onChange={(e) => {
                                    setOption1(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputDescription"
                            label="Option2"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder="option2"
                                style={{ height: "80px" }}
                                onChange={(e) => {
                                    setOption2(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputDescription"
                            label="Option2"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder="option2"
                                style={{ height: "80px" }}
                                onChange={(e) => {
                                    setOption3(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                    </Modal.Body>
                </Form>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        variant="dark"
                        disabled={!isFormFilled()}
                        onClick={() => {
                            createPoll({
                                name,
                                image,
                                description,
                                option1,
                                option2,
                                option3,
                            });
                            handleClose();
                        }}
                    >
                        Save poll
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

AddPoll.propTypes = {
    createPoll: PropTypes.func.isRequired,
};

export default AddPoll;