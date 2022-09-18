import React, {useState} from "react";
import PropTypes from "prop-types";
import {Badge, Button, Card, Col, FloatingLabel, Form, Stack} from "react-bootstrap";
import {microAlgosToString, truncateAddress} from "../../utils/conversions";
import Identicon from "../utils/Identicon";

const Poll = ({address, poll, vote, deletePoll}) => {
    const {name, image, description, option1, option2, otpion3, appId, owner} =
        poll;

    const [count1, setCount1] = useState(0)
    const [count2, setCount2] = useState(0)
    const [count3, setCount3] = useState(0)

    return (
        <Col key={appId}>
            <Card className="h-100">
                <Card.Header>
                    <Stack direction="horizontal" gap={2}>
                        <span className="font-monospace text-secondary">{truncateAddress(owner)}</span>
                        <Identicon size={28} address={owner}/>
                        {/* <Badge bg="secondary" className="ms-auto">
                            {sold} Sold
                        </Badge> */}
                    </Stack>
                </Card.Header>
                <div className="ratio ratio-4x3">
                    <img src={image} alt={name} style={{objectFit: "cover"}}/>
                </div>
                <Card.Body className="d-flex flex-column text-center">
                    <Card.Title>{name}</Card.Title>
                    <Card.Text className="flex-grow-1">{description}</Card.Text>
                    <Form className="d-flex align-content-stretch flex-row gap-2">
                        {/* <FloatingLabel
                            controlId="inputCount"
                            label="Count"
                            className="w-25"
                        >
                            <Form.Control
                                type="number"
                                value={count}
                                min="1"
                                max="10"
                                onChange={(e) => {
                                    setCount(Number(e.target.value));
                                }}
                            />
                        </FloatingLabel> */}
                        {/* <Button
                            variant="outline-dark"
                            onClick={() => vote(poll, option)}
                            className="w-75 py-3"
                        > */}
                            {/* Buy for {microAlgosToString(price) * count} ALGO */}
                        {/* </Button> */}
                        {poll.owner === address &&
                            <Button
                                variant="outline-danger"
                                onClick={() => deletePoll(poll)}
                                className="btn"
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        }
                    </Form>
                </Card.Body>
            </Card>
        </Col>
    );
};

Poll.propTypes = {
    address: PropTypes.string.isRequired,
    poll: PropTypes.instanceOf(Object).isRequired,
    vote: PropTypes.func.isRequired,
    deletePoll: PropTypes.func.isRequired
};

export default Poll;