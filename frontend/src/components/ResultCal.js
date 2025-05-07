import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './ResultCal.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const formatTime = (timeStr) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
};

const formatSecondsToTime = (totalSeconds) => {
    const sign = totalSeconds < 0 ? '-' : '';
    const absSeconds = Math.abs(totalSeconds);
    const h = String(Math.floor(absSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((absSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(absSeconds % 60).padStart(2, '0');
    return `${sign}${h}:${m}:${s}`;
};

const getPenalty = (start, finish, ideal) => {
    if (!start || !finish || !ideal) return '';
    const timeTaken = formatTime(finish) - formatTime(start);
    const idealTime = formatTime(ideal);
    return timeTaken - idealTime;
};

const getPenaltyNote = (penalty) => {
    if (penalty === '') return '';
    if (penalty < 0) return 'Early Arrival';
    if (penalty > 0) return 'Late Arrival';
    return 'On Time';
};

function ResultCal() {
    const [participantInputMode, setParticipantInputMode] = useState(() => localStorage.getItem('participantInputMode') || 'number');
    const [numParticipants, setNumParticipants] = useState(() => {
        const storedNumParticipants = localStorage.getItem('numParticipants');
        return storedNumParticipants ? parseInt(storedNumParticipants, 10) : 0;
    });
    const [numTCs, setNumTCs] = useState(() => {
        const storedNumTCs = localStorage.getItem('numTCs');
        return storedNumTCs ? parseInt(storedNumTCs, 10) : 0;
    });
    const [idealTimes, setIdealTimes] = useState(() => JSON.parse(localStorage.getItem('idealTimes') || '[]'));
    const [participants, setParticipants] = useState(() => JSON.parse(localStorage.getItem('participants') || '[]'));
    const [isGenerated, setIsGenerated] = useState(() => localStorage.getItem('isGenerated') === 'true' || false);
    const [eventName, setEventName] = useState(() => localStorage.getItem('eventName') || '');
    const [availableEvents, setAvailableEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [errorFetchingEvents, setErrorFetchingEvents] = useState(null);
    const [hasCleared, setHasCleared] = useState(false);
    const API_URL_EVENTS = "http://localhost:5000/api/events";
    const API_URL_PARTICIPANTS_BY_EVENT_NAME = "http://localhost:5000/api/participants/event/name";
    const navigate = useNavigate();

    useEffect(() => {
        if (!hasCleared) {
            fetchEvents();
        }
    }, [hasCleared]);

    useEffect(() => {
        localStorage.setItem('participantInputMode', participantInputMode);
        localStorage.setItem('numParticipants', numParticipants.toString());
        localStorage.setItem('numTCs', numTCs.toString());
        localStorage.setItem('idealTimes', JSON.stringify(idealTimes));
        localStorage.setItem('participants', JSON.stringify(participants));
        localStorage.setItem('isGenerated', isGenerated.toString());
        localStorage.setItem('eventName', eventName);
    }, [participantInputMode, numParticipants, numTCs, idealTimes, participants, isGenerated, eventName]);

    const handleIdealTimeChange = (index, value) => {
        const updated = [...idealTimes];
        updated[index] = value;
        setIdealTimes(updated);
    };

    const generateTable = async () => {
        if (participantInputMode === 'number') {
            const newParticipants = Array.from({ length: numParticipants }, (_, i) => ({
                id: i + 1,
                driver: `ID${String(i + 1).padStart(3, '0')}`,
                coDriver: `ICD${String(i + 1).padStart(3, '0')}`,
                startTime: '',
                endTime: '',
                tc: Array.from({ length: numTCs }, (_, j) => ({
                    start: '',
                    finish: '',
                    ideal: idealTimes[j] || '',
                })),
            }));
            setParticipants(newParticipants);
            setIsGenerated(true);
        } else if (participantInputMode === 'event' && eventName) {
            try {
                const response = await axios.get(`${API_URL_PARTICIPANTS_BY_EVENT_NAME}/${eventName}`);
                const fetchedParticipants = response.data.map((participant, index) => ({
                    id: participant.id || index + 1,
                    driver: participant.name || '',
                    coDriver: participant.coDriver || `ICD${String(participant.id || index + 1).padStart(3, '0')}`,
                    startTime: '',
                    endTime: '',
                    tc: Array.from({ length: numTCs }, (_, j) => ({
                        start: '',
                        finish: '',
                        ideal: idealTimes[j] || '',
                    })),
                }));
                setParticipants(fetchedParticipants);
                setIsGenerated(true);
            } catch (error) {
                console.error("Error fetching participants by event name:", error);
            }
        }
    };

    const handleChange = (i, field, value) => {
        const updated = [...participants];
        updated[i][field] = value;
        setParticipants(updated);
    };

    const handleTCChange = (i, j, field, value) => {
        const updated = [...participants];
        updated[i].tc[j][field] = value;
        setParticipants(updated);
    };

    const getTotalPenalty = (tcData) => {
        return tcData.reduce((sum, tc) => {
            const penalty = getPenalty(tc.start, tc.finish, tc.ideal);
            return sum + (isNaN(penalty) ? 0 : penalty);
        }, 0);
    };

    const sortedResults = [...participants].map(p => ({
        ...p,
        totalPenalty: getTotalPenalty(p.tc)
    })).sort((a, b) => a.totalPenalty - b.totalPenalty);

    const exportToCSV = () => {
        const participantSheet = participants.map(p => ({
            ID: p.id,
            Driver: p.driver,
            'Co-Driver': p.coDriver,
            'Start Time': p.startTime,
            'End Time': p.endTime
        }));

        const timeControlSheet = participants.map(p => {
            const row = { ID: p.id };
            p.tc.forEach((tc, j) => {
                const penalty = getPenalty(tc.start, tc.finish, tc.ideal);
                row[`TC${j + 1} Start`] = tc.start;
                row[`TC${j + 1} Finish`] = tc.finish;
                row[`TC${j + 1} Ideal`] = tc.ideal;
                row[`TC${j + 1} Penalty`] = formatSecondsToTime(penalty);
                row[`TC${j + 1} Penalty Note`] = getPenaltyNote(penalty);
            });
            return row;
        });

        const overallResultsSheet = sortedResults.map(p => ({
            ID: p.id,
            Driver: p.driver,
            'Co-Driver': p.coDriver,
            'Total Penalty': formatSecondsToTime(p.totalPenalty)
        }));

        const wb = XLSX.utils.book_new();

        const ws1 = XLSX.utils.json_to_sheet(participantSheet);
        const ws2 = XLSX.utils.json_to_sheet(timeControlSheet);
        const ws3 = XLSX.utils.json_to_sheet(overallResultsSheet);

        XLSX.utils.book_append_sheet(wb, ws1, 'Participant Details');
        XLSX.utils.book_append_sheet(wb, ws2, 'Time Controls');
        XLSX.utils.book_append_sheet(wb, ws3, 'Overall Results');

        XLSX.writeFile(wb, 'Rally_Results.xlsx');
    };

    const handleAddToWinners = () => {
        if (sortedResults.length > 0) {
            const topThree = sortedResults.slice(0, 3).map(p => ({
                driver: p.driver,
                penalty: formatSecondsToTime(p.totalPenalty),
            }));

            navigate('/winners/add', { state: { potentialWinners: topThree, eventName: eventName || 'Generated Event' } });
        } else {
            alert("No participants to record as winners yet.");
        }
    };

    const fetchEvents = async () => {
        setLoadingEvents(true);
        setErrorFetchingEvents(null);
        try {
            const response = await axios.get(API_URL_EVENTS);
            setAvailableEvents(response.data.map(event => event.name));
            setLoadingEvents(false);
        } catch (error) {
            console.error("Error fetching events:", error);
            setErrorFetchingEvents("Failed to load events.");
            setLoadingEvents(false);
        }
    };

    const handleClearData = () => {
        localStorage.removeItem('participantInputMode');
        localStorage.removeItem('numParticipants');
        localStorage.removeItem('numTCs');
        localStorage.removeItem('idealTimes');
        localStorage.removeItem('participants');
        localStorage.removeItem('isGenerated');
        localStorage.removeItem('eventName');
        setParticipantInputMode('number');
        setNumParticipants(0);
        setNumTCs(0);
        setIdealTimes([]);
        setParticipants([]);
        setIsGenerated(false);
        setEventName('');
        setHasCleared(true);
    };

    return (
        <div className="container">
            <h1 className="heading">Rally Time Control System</h1>

            {!isGenerated && (
                <div className="form-section">
                    <label>Choose Participant Input Mode:</label>
                    <select value={participantInputMode} onChange={(e) => setParticipantInputMode(e.target.value)}>
                        <option value="number">Enter Number of Participants</option>
                        <option value="event">Fetch by Event Name</option>
                    </select>

                    {participantInputMode === 'number' && (
                        <>
                            <label>Enter Number of Participants:</label>
                            <input
                                type="text"
                                min="0"
                                value={numParticipants}
                                onChange={(e) => setNumParticipants(Number(e.target.value))}
                            />
                        </>
                    )}

                    {participantInputMode === 'event' && (
                        <>
                            <label>Select Event:</label>
                            {loadingEvents ? (
                                <p>Loading events...</p>
                            ) : errorFetchingEvents ? (
                                <p className="error">{errorFetchingEvents}</p>
                            ) : (
                                <select value={eventName} onChange={(e) => setEventName(e.target.value)}>
                                    <option value="">Select an Event</option>
                                    {availableEvents.map(event => (
                                        <option key={event} value={event}>{event}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}

                    <label>Enter Number of TCs:</label>
                    <input
                        type="text"
                        min="0"
                        value={numTCs}
                        onChange={(e) => {
                            const count = Number(e.target.value);
                            setNumTCs(count);
                            setIdealTimes(Array(count).fill(''));
                        }}
                    />

                    {idealTimes.map((val, index) => (
                        <div key={index}>
                            <label>Enter Ideal Time for TC{index + 1}:</label>
                            <input
                                type="time"
                                step="1"
                                value={val}
                                onChange={(e) => handleIdealTimeChange(index, e.target.value)}
                            />
                        </div>
                    ))}

                    <button onClick={generateTable} disabled={participantInputMode === 'event' && !eventName}>
                        Generate Table
                    </button>
                    {participantInputMode === 'event' && !eventName && (
                        <p className="warning">Please select an event to generate the table.</p>
                    )}
                </div>
            )}

            {isGenerated && (
                <>
                    <div className="table-section">
                        <h2>Participant Details</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Driver</th>
                                    <th>Co-Driver</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.id}</td>
                                        <td><input value={p.driver} onChange={e => handleChange(i, 'driver', e.target.value)} /></td>
                                        <td><input value={p.coDriver} onChange={e => handleChange(i, 'coDriver', e.target.value)} /></td>
                                        <td><input type="time" step="1" value={p.startTime} onChange={e => handleChange(i, 'startTime', e.target.value)} /></td>
                                        <td><input type="time" step="1" value={p.endTime} onChange={e => handleChange(i, 'endTime', e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-section">
                        <h2>Time Controls</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    {[...Array(numTCs)].map((_, j) => (
                                        <React.Fragment key={j}>
                                            <th>TC{j + 1} Start</th>
                                            <th>TC{j + 1} Finish</th>
                                            <th>TC{j + 1} Ideal</th>
                                            <th>Penalty</th>
                                            <th>Penalty Note</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.id}</td>
                                        {p.tc.map((tc, j) => {
                                            const penalty = getPenalty(tc.start, tc.finish, tc.ideal);
                                            return (
                                                <React.Fragment key={j}>
                                                    <td><input type="time" step="1" value={tc.start} onChange={e => handleTCChange(i, j, 'start', e.target.value)} /></td>
                                                    <td><input type="time" step="1" value={tc.finish} onChange={e => handleTCChange(i, j, 'finish', e.target.value)} /></td>
                                                    <td><input type="time" step="1" value={tc.ideal} onChange={e => handleTCChange(i, j, 'ideal', e.target.value)} /></td>
                                                    <td>{penalty !== '' ? formatSecondsToTime(penalty) : ''}</td>
                                                    <td>{getPenaltyNote(penalty)}</td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-section">
                        <h2>Overall Results</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>ID</th>
                                    <th>Driver</th>
                                    <th>Co-Driver</th>
                                    <th>Total Penalty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedResults.map((p, i) => (
                                    <tr key={i} className={i === 0 ? 'winner' : ''}>
                                        <td>{i + 1}</td>
                                        <td>{p.id}</td>
                                        <td>{p.driver}</td>
                                        <td>{p.coDriver}</td>
                                        <td>{formatSecondsToTime(p.totalPenalty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="export-button" onClick={exportToCSV}>Export to CSV</button>
                        <button className="export-button" onClick={handleAddToWinners} disabled={sortedResults.length === 0}>
                            Add to Winners Record
                        </button>
                        {sortedResults.length === 0 && <p className="warning">No results to record as winners.</p>}
                    </div>
                </>
            )}
            <button className="clear-button" onClick={handleClearData}>
                Clear All Data
            </button>
        </div>
    );
}

export default ResultCal;