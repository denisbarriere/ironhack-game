/**
 * DEFINE: Each level properties
**/

/**
 * GLOBAL COLORS
**/
const availableColor = [
  'blue',
  'grey',
  'red',
  'light-green'
];


/**
 * LEVEL PROPERTIES
**/

// LEVEL 1
const level1Properties = { 
  number: 1,
  width: 5,
  height: 7,
  initState: [{ row: 3, column: 2, color: 'blue', current: true }],
  nextColorsQueue: ['grey','blue','grey','blue','grey','grey','blue','grey','blue','blue','grey','blue','blue','blue','grey','blue','grey','grey','grey','grey','blue','grey','grey'],
  success: 15,
  successInstructions: `<p>Make <span>15</span></p>
                        <p>Matches!</p>`
};


// LEVEL 2
const level2Properties = { 
  number: 2,
  width: 5,
  height: 9,
  initState: [{ row: 4, column: 2, color: 'blue', current: true }],
  nextColorsQueue: ['blue','grey','grey','blue','grey','grey','blue','blue','blue','grey','blue','blue','blue','grey','blue','grey','grey','blue','blue','grey','blue','grey','blue','grey','blue','grey','blue','grey','grey'],
  success: 20,
  successInstructions: `<p>Make <span>20</span></p>
                        <p>Matches!</p>`
};


// LEVEL 3
const level3Properties = { 
  number: 3,
  width: 5,
  height: 9,
  initState: [{ row: 6, column: 2, color: 'blue', current: true }],
  nextColorsQueue: ['blue','grey','grey','blue','red','blue','grey','grey','grey','red','red','red','blue','blue','blue','grey','red','red','blue','red','blue','blue','grey','red','grey','red','red','blue','blue','blue','blue','grey','grey'],
  success: 15,
  successInstructions: `<p>Make <span>15</span></p>
                        <p>Matches!</p>`
};


// LEVEL 4
const level4Properties = { 
  number: 4,
  width: 5,
  height: 7,
  initState: [{ row: 3, column: 2, color: 'light-green', current: true }],
  nextColorsQueue: ['blue','grey','grey','blue','red','blue','grey','grey','grey','red','red','red','light-green','light-green','blue','blue','blue','grey','light-green','red','red','blue','red','blue','blue','grey','red','light-green','light-green','light-green','grey','red','red','blue','blue','blue','blue','grey','grey','light-green'],  
  success: 25,
  successInstructions: `<p>Make <span>25</span></p>
                        <p>Matches!</p>`
};

// LEVEL 5
const level5Properties = { 
  number: 5,
  width: 5,
  height: 7,
  initState: [{ row: 5, column: 3, color: 'red', current: true }],
  nextColorsQueue: ['light-green','light-green','blue','grey','grey','blue','red','blue','grey','grey','grey','red','red','red','light-green','light-green','blue','blue','blue','grey','red','red','blue','light-green','red','blue','blue','grey','red','grey','red','red','light-green','blue','blue','blue','blue','grey','grey','light-green','light-green'],  
  success: 50,
  successInstructions: `<p>Make <span>50</span></p>
                        <p>Matches!</p>`
};


// Global level properties object accessible by other js files
const levelProperties = {
  level1: level1Properties,
  level2: level2Properties,
  level3: level3Properties,
  level4: level4Properties,
  level5: level5Properties
}