import React from 'react';

const TableRow = ({ data }) => {
  return (
    <tr>
      {data.map((item) => (
        <td key={item}>{item}</td>
      ))}
    </tr>
  );
};

export default TableRow;
