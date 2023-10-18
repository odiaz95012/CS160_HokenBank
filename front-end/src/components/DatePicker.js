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
            labelText,
            dateFormat
        } = this.props;

        return (
            <div className="col-md-6 col-lg-10">
                <div className="d-flex">
                    <i className="bi bi-calendar-event me-1 mt-1" style={{ width: '25px' }}></i>
                    <div className="input-group">
                        <Datepicker
                            id={id}
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
                            className={wrapperClassName}
                        />
                    </div>
                </div>
                <div className="d-flex justify-content-start ms-4 ps-2">
                    <label className="form-label" htmlFor={id}>
                        {labelText}
                    </label>
                </div>
            </div>

        )
    }
}

export default DatePicker;
