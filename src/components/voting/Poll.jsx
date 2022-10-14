import React, {useState} from "react";
import PropTypes from "prop-types";
import {Badge, Button, Card, Col, FloatingLabel, Form, Stack} from "react-bootstrap";
import {microAlgosToString, truncateAddress} from "../../utils/conversions";
import Identicon from "../utils/Identicon";
import {isOptedInAction} from "../../utils/voting";

const Poll = ({address, poll, vote, optIn, declareWinner, deletePoll, isOptedIn}) => {
    const {id, image, description, option1, option2, option3, count1, count2, count3, voting_start, voting_end, winner, owner, appId} =
        poll;

    const [selectedOption, setSelectedOption] = useState("")
    const [optedVar, setOptedVar] = useState("")

    const handleChange = (e) => {
        setSelectedOption(e.target.value)
    }

    const RenderOptInButton = () => {
        isOptedInAction(address, appId).then(
            opted => {
                setOptedVar(opted)
            }
        )

        let res
        // let opted = false
        if(!optedVar){
            res = <Button onClick={() => optIn(address, poll)}>
                OptIn
            </Button>
        }else{
            res = <Button disabled>
                Opted in
            </Button>
        }
        return res
    }

    const RenderVoteButton = () => {
        let res
        // let opted = false
        if(!optedVar){
            res = <Button disabled>
                    Vote
                </Button>
        }else{
            res = <Button
                    onClick={() => vote(poll, selectedOption)}
                >
                    Vote
                </Button>
        }
        return res
    }

    const RenderTime = () => {
        let startTime = new Date(voting_start * 1000)
        let endTime = new Date(voting_end * 1000)

        return (
            <div>
                <div>
                    Voting start: {startTime.toLocaleTimeString("default")} h
                </div>
                <div>
                    Voting end: {endTime.toLocaleTimeString("default")} h
                </div>
            </div>
        )
    }

    return (
        <Col key={id}>
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
                    <img src={image} alt={id} style={{objectFit: "cover"}}/>
                </div>
                <Card.Body className="d-flex flex-column text-center">
                    <Card.Title>{id}</Card.Title>
                    <Card.Text className="flex-grow-1">{description}</Card.Text>
                    <Form className="d-flex align-content-stretch flex-column gap-2">
                        <div style={{fontWeight: "bold", fontStyle: "italic"}}>Select option for voting</div>
                        <div onChange={handleChange}>
                            <input type="radio" value={option1} /> {option1} ({count1})
                            <input type="radio" value={option2} /> {option2} ({count2})
                            <input type="radio" value={option3} /> {option3} ({count3})
                        </div>
                        <div>
                            {RenderOptInButton()}
                        </div>
                        <div>
                            {RenderVoteButton()}
                        </div>
                        <div>
                            { address==owner &&
                                <Button onClick={() => declareWinner(address, poll)}>
                                    Declare winner
                                </Button>
                            }
                            Winner: {winner}
                        </div>
                        <div>
                            {RenderTime()}
                        </div>
                        <div>
                            {poll.owner === address &&
                                <div>
                                    Delete poll 
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => deletePoll(poll)}
                                        className="btn"
                                        style={{marginLeft: "10px"}}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                            }
                        </div>
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