export const data = [
  ['x', 'Amount'],
  ['Mon', 0],
  ['Tues', 0],
  ['Wed', 0],
  ['Thurs', 0],
  ['Fri', 0],
  ['Sat', 0],
  ['Sun', 0],
];

export const options = {
  hAxis: {
    title: 'Day',
  },
  vAxis: {
    title: 'Amount',
  },
  series: {
    1: { curveType: 'function' },
  },
};
