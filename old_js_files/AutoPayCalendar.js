import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';



function AutoPayCalendar() {
    const localizer = momentLocalizer(moment);

    const [events, setEvents] = useState([]); // Store autopay events here
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Function to handle event selection
    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    // Function to add an autopay event
    const addAutoPayEvent = (start, end) => {
        const newEvent = {
            title: 'AutoPay',
            start,
            end,
        };
        setEvents([...events, newEvent]);
    };

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                selectable={true}
                onSelectSlot={(slotInfo) => {
                    const start = slotInfo.start;
                    const end = slotInfo.end;
                    addAutoPayEvent(start, end);
                }}
            />
            {selectedEvent && (
                <div>
                    <h2>Selected AutoPay Event</h2>
                    <p>Title: {selectedEvent.title}</p>
                    <p>Start Date: {selectedEvent.start.toLocaleString()}</p>
                    <p>End Date: {selectedEvent.end.toLocaleString()}</p>
                </div>
            )}
        </div>
    );
}

export default AutoPayCalendar;
