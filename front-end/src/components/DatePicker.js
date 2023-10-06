import React from "react";
import Datepicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class DatePicker extends React.Component {
    constructor() {
        super()
        this.state = {
            date: null
        }
    }

    selectDate = (date) => {
        this.setState({ date });

        // Call the callback function with the selected date
        if (this.props.onDateChange) {
            this.props.onDateChange(date);
        }
    }

    render() {
        const {
            id, // Add id prop
            placeholderText,
            peekNextMonth,
            showMonthDropdown,
            showYearDropdown,
            dropdownMode,
            wrapperClassName,
            minDate,
            maxDate,
            labelText
        } = this.props;

        return (
            <div className="col-md-6">
                <div className="input-group">
                    <span className="input-group-text" id="basic-addon1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                        </svg>
                    </span>
                    <Datepicker
                        id={id} // Add id to the DatePicker component
                        selected={this.state.date}
                        dateFormat="MM-dd-yyyy"
                        onChange={this.selectDate}
                        placeholderText={placeholderText}
                        peekNextMonth={peekNextMonth}
                        showMonthDropdown={showMonthDropdown}
                        showYearDropdown={showYearDropdown}
                        dropdownMode={dropdownMode}
                        maxDate={maxDate}
                        minDate={minDate}
                        className={wrapperClassName} />
                </div>
                <label className="form-label" htmlFor={id}>{labelText}</label> {/* Associate label with input using htmlFor */}
            </div>
        )
    }
}

export default DatePicker;
