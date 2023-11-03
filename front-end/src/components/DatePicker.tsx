import React, { Component } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  id: string,
  placeholderText: string,
  peekNextMonth: boolean,
  showMonthDropdown: boolean,
  showYearDropdown: boolean,
  dropdownMode: "select" | "scroll",
  wrapperClassName: string,
  minDate?: Date,
  maxDate?: Date,
  labelText: string,
  dateFormat?: string,
  onDateChange?: Function,
  selected?: Date | null,
}

interface DatePickerState {
  date: Date | null;
}

class CustomDatePicker extends Component<DatePickerProps, DatePickerState> {
  //latest 
  constructor(props: DatePickerProps) {
    super(props);
    this.state = {
      date: null,
    };
  }

  selectDate = (date: Date | null) => {
    this.setState({ date });

    // Call the callback function with the selected date
    if (this.props.onDateChange) {
      this.props.onDateChange(date);
    }
  }

  render() {
    const {
      id,
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
            <DatePicker
              id={id}
              selected={this.state.date}
              dateFormat={dateFormat}
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
    );
  }
}

export default CustomDatePicker;
