import React from 'react';
import TableRow from './TableRow';
import TableHeadItem from './TableHead';
import styles from './Table.module.scss';

export const Table = ({ theadData, tbodyData }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {theadData.map((h) => (
            <TableHeadItem key={h} item={h} />
          ))}
        </tr>
      </thead>
      <tbody>
        {tbodyData.map((item) => (
          <TableRow key={item.id} data={item.items} />
        ))}
      </tbody>
    </table>
  );
};
