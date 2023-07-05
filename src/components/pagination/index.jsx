import React from 'react';
import "./style.css"
import next from "../../asserts/images/right1.svg"
import previous from "../../asserts/images/left1.png"
import last from "../../asserts/images/right-double-arrow.svg"
import first from "../../asserts/images/double-left-arrow.png"
function Pagination({
  productsPerPage,
  totalProducts,
  currentPage,
  paginate,
  handlePreviousClick,
  handleNextClick,
  handleFirstClick,
  handleLastClick,
}) {
  const pageNumbers = Math.ceil(totalProducts / productsPerPage);
  const maxVisibleButtons = 4;

  const getVisibleButtons = () => {
    const visibleButtons = [];
    let startPage;
    let endPage;

    if (pageNumbers <= maxVisibleButtons) {
      startPage = 1;
      endPage = pageNumbers;
    } else {
      const middleButtonOffset = Math.floor(maxVisibleButtons / 2);
      if (currentPage <= middleButtonOffset + 1) {
        startPage = 1;
        endPage = maxVisibleButtons;
      } else if (currentPage >= pageNumbers - middleButtonOffset) {
        startPage = pageNumbers - maxVisibleButtons + 1;
        endPage = pageNumbers;
      } else {
        startPage = currentPage - middleButtonOffset;
        endPage = currentPage + middleButtonOffset;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      visibleButtons.push(i);
    }

    return visibleButtons;
  };

  return (
    <div className="pagination">
      <button onClick={handleFirstClick} disabled={currentPage === 1} className='pagination-buttons'>
      <img src={first} className='pagination-icons'/> 
      </button>
      <button onClick={handlePreviousClick} disabled={currentPage === 1} className='pagination-buttons'>
      <img src={previous} className='pagination-icons'/> 
      </button>
      {getVisibleButtons().map((number) => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={currentPage === number ? 'active' : ''}
        >
          {number}
        </button>
      ))}
      <button
        onClick={handleNextClick}
        disabled={currentPage === pageNumbers}
        className='pagination-buttons'
      >
      <img src={next} className='pagination-icons'/>  
      </button>
      <button
        onClick={handleLastClick}
        disabled={currentPage === pageNumbers}
        className='pagination-buttons'
      >
       <img src={last} className='pagination-icons'/> 
      </button>
    </div>
  );
}

export default Pagination;
