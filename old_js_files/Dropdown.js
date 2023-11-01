import React from "react";

class Dropdown extends React.Component {
  state = {
    isOpen: false,
  };

  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  handleOptionClick = (option) => {
    if(option === 'All') {
      option = 0;
    }
    this.props.onSelectedOption(option); // Call the callback function with the selected option
    this.toggleOpen(); // Close the dropdown after selecting an option
  };

  render() {
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
          {/*A 0 represents getting a customer's complete bill payment history*/}
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
