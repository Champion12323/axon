// let n = 6 ;
// let m = 1;
// for(let i = 2 ; i<=n ; i++){
//     m = m * i;
// }
// console.log(m);

import { parse } from "node:path";

// let text = "aaaabcbcdddeesfghdddddd";
// let count = text.split("");
// let len = 0;
// for(let i = 0 ; i < count.length ; i++){
//     if(count[i] === count[i+1]){
//         len++;
//     }else{
//         console.log(count[i] + ": " + (len + 1));
//         len = 0;
//     }
// }

// let array = [2,3,5,3,6 ,4,7,8,1];
// var sum = 0;
// let summ = 0;
// for(let i = 0 ; i < array.length ; i++){
//     if(array[i] + array[i+1] === 9){
//     sum = i + " and " +(i+1);
//     }
//     else if(array[i] === 9){
//         summ = i ;
//     }
// }
// console.log(sum);
// console.log(summ);

//  let s = "bababd";
//     let arr = s.split('');
//     let output = '';
//     for(let i = 0 ; i < arr.length ;++i){
//         for(let j = arr.length ; j > i ;--j)
//          if(arr[i] === arr[j]){
//             let currentSubstring = s.slice(i, j + 1);
//                 if(currentSubstring.length > output.length){
//             output = currentSubstring;
//          }
//         }
//     }
//     console.log(output);

// const convert = function(s, numRows) {
//     // If only one row or string is too short, no zigzag happens
//     if (numRows === 1 || s.length <= numRows) return s;

//     // Create an array of strings, one for each row
//     const rows = new Array(numRows).fill("");
//     let currentRow = 0;
//     let goingDown = false;

//     for (let char of s) {
//         rows[currentRow] += char;

//         // Flip direction when we hit the top or bottom row
//         if (currentRow === 0 || currentRow === numRows - 1) {
//             goingDown = !goingDown;
//         }

//         // Move up or down
//         currentRow += goingDown ? 1 : -1;
//     }

//     // Join all rows into one final string
//     return rows.join("");
// };

// // Example usage:
// console.log(convert("PAYPALISHIRING", 3)); // "PAHNAPLSIIGYIR"


// function interection(arr1, arr2) {
//     let i = 0, j = 0;
//     let result = [];
//     while (i < arr1.length && j < arr2.length) {
//         if (arr1[i] === arr2[j]) {
//             result.push(arr1[i]);
//              i++;
//             j++;
//         } else if (arr1[i] < arr2[j]) {
//             i++;
//         } else {
//             j++;
//         }
//     }
//     return result;
// }
// let arr1 = [1, 2, 4, 5, 6];
// let arr2 = [2, 3, 5, 7];
// console.log(interection(arr1, arr2)); // Output: [2, 5]

// number reverse 

// let num = 1234567;
// let str = num.toString();
// let result = Number(str.split('').reverse().join(''));
// console.log(typeof(result));
// console.log(result);
// console.log(typeof(str));

// Rest parameter :- for giving indefinite number of arguments to a function
// function multiplyofmany(...numbers){
//     return numbers.reduce((acc,num)=> acc * num);
// }
// console.log(multiplyofmany(2,3,4,5,6)); // Output: 24

// function sumofmany(...numbers){
//     return numbers.reduce((acc,num)=> acc + num);
// }
// console.log(sumofmany(2,3,4,5,6)); // Output: 20

// const arr = [1, 2, 3, 4, 5];
// const [first, second, ...rest] = arr;
// console.log(first);
// const arr2 = [...arr , 6, 7, 8];
// console.log(arr2);

const break1 = {
    username : "john_doe",
    lastname : "doe"
}
const  {lastname , ...rest} = break1;
console.log(lastname);

function calcpayout(totalAmount){
  const platform_fee = (totalAmount *10)/100;
  return {
    platformfees : parseFloat(platform_fee.toFixed()),
    influencerPayout : parseFloat(totalAmount - platform_fee)
  }
}

const {platformfees , influencerPayout} = calcpayout(10000);

console.log(influencerPayout)