var filters = require('filters');

// var raw = [ 2, 3, 4, 9, 6, 2 ];
// console.log(raw);

// var n1 = filters.median(raw);
// console.log(n1);


// var raw = [ 2, 3, 4, 9, 6, 2 ];
// var n2 = filters.average(raw, 3, 0.5);
// console.log(n2);


var arr = [];
for(var i=0; i<20; i++){
	var x = Math.random()*100 + 1;
	x = Math.floor(x);
	arr.push(x);
}

console.log(arr);


var n1 = filters.median(arr, 5);
console.log(n1);


var raw = [ 2, 3, 4, 9, 6, 2 ];
var n2 = filters.average(arr, 3, 0.5);
console.log(n2);