import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import AddPoll from "./AddPoll";
import Poll from "./Poll";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {createPollAction, deletePollAction, getPollsAction,} from "../../utils/voting";
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

    if (loading) {
	    return <Loader/>;
	}
	return (
	    <>
	        <div className="d-flex justify-content-between align-items-center mb-4">
	            <h1 className="fs-4 fw-bold mb-0">Street Food</h1>
	            <AddPoll createPoll={createPoll}/>
	        </div>
	        <Row xs={1} sm={2} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
	            <>
	                {polls.map((poll, index) => (
	                    <Poll
	                        address={address}
	                        poll={poll}
	                        deletePoll={deletePoll}
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