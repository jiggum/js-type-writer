"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickSort = void 0;
var quickSort = function (arr, left, right) {
    var pivot, partitionIndex;
    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right);
        // sort left
        (0, exports.quickSort)(arr, left, partitionIndex - 1);
        // sort right
        (0, exports.quickSort)(arr, partitionIndex + 1, right);
    }
    return arr;
};
exports.quickSort = quickSort;
var partition = function (arr, pivot, left, right) {
    var pivotValue = arr[pivot], partitionIndex = left;
    for (var i = left; i < right; i++) {
        if (arr[i] < pivotValue) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
};
var swap = function (arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
};
