import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import AddPoll from "./AddPoll";
import Poll from "./Poll";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {createPollAction, deletePollAction, getPollsAction, voteAction, optInAction, declareWinnerAction, isOptedInAction} from "../../utils/voting";
import PropTypes from "prop-types";
import {Row} from "react-bootstrap";

const Polls = ({address, fetchBalance}) => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const getPolls = async () => {
        setLoading(true);
        getPollsAction()
            .then(polls => {
                if (polls) {
                    console.log("Pollllllls: ", polls)
                    setPolls(polls);
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(_ => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getPolls();
    }, []);

    const createPoll = async (data) => {
	    setLoading(true);
	    createPollAction(address, data)
	        .then(() => {
	            toast(<NotificationSuccess text="Poll added successfully."/>);
	            getPolls();
	            fetchBalance(address);
	        })
	        .catch(error => {
	            console.log(error);
	            toast(<NotificationError text="Failed to create a poll."/>);
	            setLoading(false);
	        })
	};

    const deletePoll = async (poll) => {
        setLoading(true);
        deletePollAction(address, poll.appId)
            .then(() => {
                toast(<NotificationSuccess text="Poll deleted successfully"/>);
                getPolls();
                fetchBalance(address);
            })
            .catch(error => {
                console.log(error)
                toast(<NotificationError text="Failed to delete poll."/>);
                setLoading(false);
            })
    };

    const vote = async (poll, option) => {
        setLoading(true);
        voteAction(address, poll, option)
        .then(() => {
            toast(<NotificationSuccess text="Voted successfully"/>);
            getPolls();
            fetchBalance(address);
        })
        .catch(error => {
            console.log(error)
            toast(<NotificationError text="Failed to vote."/>);
            setLoading(false);
        })
    }

    const optIn = async (address, poll) => {
        setLoading(true);
        optInAction(address, poll)
        .then(() => {
            toast(<NotificationSuccess text="Opted in successfully"/>);
            getPolls();
            fetchBalance(address);
        })
        .catch(error => {
            console.log(error)
            toast(<NotificationError text="Failed to optIn."/>);
            setLoading(false);
        })
    }

    const declareWinner = async (address, poll) => {
        setLoading(true);
        declareWinnerAction(address, poll)
        .then(() => {
            toast(<NotificationSuccess text="Successfully ended action"/>);
            getPolls();
            fetchBalance(address);
        })
        .catch(error => {
            console.log(error)
            toast(<NotificationError text="Failed to declare a winner."/>);
            setLoading(false);
        })
    }

    const isOptedIn = (address, appId) => {
        // e.preventDefault();
        // setLoading(true);
        isOptedInAction(address, appId)
        .then((res) => {
            return res
        })
        .catch(error => {
            console.log(error)
            return error
        })
    }

    if (loading) {
	    return <Loader/>;
	}
	return (
	    <>
	        <div className="d-flex justify-content-between align-items-center mb-4">
	            <h1 className="fs-4 fw-bold mb-0">Algo voting</h1>
	            <AddPoll createPoll={createPoll}/>
                {/* <button onClick={(e) => isOptedIn(e, address, 112529866)}>Is opted in?</button> */}
	        </div>
	        <Row xs={1} sm={2} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
	            <>
	                {polls.map((poll, index) => (
	                    <Poll
	                        address={address}
	                        poll={poll}
                            vote={vote}
                            optIn={optIn}
                            declareWinner={declareWinner}
	                        deletePoll={deletePoll}
                            isOptedIn={isOptedIn}
	                        key={index}
	                    />
	                ))}
	            </>
	        </Row>
	    </>
	);
};

Polls.propTypes = {
    address: PropTypes.string.isRequired,
    fetchBalance: PropTypes.func.isRequired
};

export default Polls;