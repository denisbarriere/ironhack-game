/**
 * DEFINE: Each level properties
**/

/**
 * GLOBAL COLORS
**/
const availableColor = [
  'blue',
  'grey',
  'red'
];


/**
 * LEVEL PROPERTIES
**/

// LEVEL 1
const level1Properties = { 
  number: 1,
  width: 5,
  height : 7,
  initState : [{ row: 3, column: 2, color: 'blue', current: true }],
  nextColorsQueue : ['grey','blue','blue'],  
  // nextColorsQueue : ['grey','blue','grey','blue','grey','grey','blue','grey','blue','blue','grey','blue','blue','blue','grey','blue','grey','grey','grey','grey','blue','grey','grey'],
  success : 15
}

// LEVEL 2
const level2Properties = { 
  number: 2,
  width: 5,
  height : 9,
  initState : [{ row: 4, column: 2, color: 'blue', current: true }],
  nextColorsQueue : ['blue','grey','grey','blue','grey','grey','blue','blue','blue','grey','blue','blue','blue','grey','blue','grey','grey','blue','blue','grey','blue','grey','blue','grey','blue','grey','blue','grey','grey'],
  success : 20
}

// LEVEL 3
const level3Properties = { 
  number: 3,
  width: 5,
  height : 9,
  initState : [{ row: 6, column: 2, color: 'blue', current: true }],
  nextColorsQueue : ['blue','grey','grey','blue','red','blue','grey','grey','grey','red','red','red','blue','blue','blue','grey','red','red','blue','red','blue','blue','grey','red','grey','red','red','blue','blue','blue','blue','grey','grey'],
  success : 15
}
