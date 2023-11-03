import React, { Component, ReactElement } from "react";

interface DropdownProps {
  selectedOption: number | string; // string for the 'ALL' option
  onSelectedOption: (option: number) => void;
}

interface DropdownState {
  isOpen: boolean;
}

class Dropdown extends Component<DropdownProps, DropdownState> {
  //latest version
  state: DropdownState = {
    isOpen: false,
  };

  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

handleOptionClick = (option: number | string) => {
    if (option === 'All') {
        option = 0;
    }
    this.props.onSelectedOption(Number(option)); // Convert option to number and call the callback function with the selected option
    this.toggleOpen(); // Close the dropdown after selecting an option
};

  render(): ReactElement {
    const { selectedOption } = this.props; // Get the selectedOption from props
    const menuClass = `dropdown-menu${this.state.isOpen ? " show" : ""}`;

    return (
      <div className="dropdown" onClick={this.toggleOpen}>
        <button
          className="btn btn-outline-primary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
        >
          Show {selectedOption === 0 ? "All" : selectedOption}
        </button>
        <div className={menuClass} aria-labelledby="dropdownMenuButton">
          <a
            className={`dropdown-item${selectedOption === 'All' ? " active" : ""}`}
            href="#nogo"
            onClick={() => this.handleOptionClick('All')}
          >
            All
          </a>
          <a
            className={`dropdown-item${selectedOption === 10 ? " active" : ""}`}
            href="#nogo"
            onClick={() => this.handleOptionClick(10)}
          >
            10
          </a>
          <a
            className={`dropdown-item${selectedOption === 25 ? " active" : ""}`}
            href="#nogo"
            onClick={() => this.handleOptionClick(25)}
          >
            25
          </a>
          <a
            className={`dropdown-item${selectedOption === 50 ? " active" : ""}`}
            href="#nogo"
            onClick={() => this.handleOptionClick(50)}
          >
            50
          </a>
        </div>
      </div>
    );
  }
}

export default Dropdown;
