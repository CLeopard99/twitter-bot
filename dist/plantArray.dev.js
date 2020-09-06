"use strict";

module.exports = {
  getPlantArray: function getPlantArray() {
    var plantArray = [];
    arrays[0] = 'array 0';
    arrays[1] = 'array 1';
    arrays[2] = 'array 2';
    arrays[3] = 'array 3';
    arrays[4] = 'array 4';
    return arrays[Math.floor(Math.random() * plantArray.length)];
  }
};