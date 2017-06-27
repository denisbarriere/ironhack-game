/* Javascript file defining each level */

/*
 * COLORS
 */
const availableColor = [
  'blue',
  'grey',
  'red'
];

/*
 * LEVELS
 */

/* LEVEL 1 */
const level1Params = { 
  number: 1,
  width: 5,
  height : 7,
  initState : [{ row: 3, column: 2, color: 'blue', current: true }],
  nextColorsQueue : ['blue', 'blue', 'grey','red','red'],
  success : 15
}