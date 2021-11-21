export const quickSort = (arr, left, right) => {
  let pivot;
  let partitionIndex;

  if (left < right) {
    pivot = right;
    partitionIndex = partition(arr, pivot, left, right);

    // sort left
    quickSort(arr, left, partitionIndex - 1);
    // sort right
    quickSort(arr, partitionIndex + 1, right);
  }
  return arr;
}

const partition = (arr, pivot, left, right) => {
  var pivotValue = arr[pivot],
    partitionIndex = left;

  for (var i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      swap(arr, i, partitionIndex);
      partitionIndex++;
    }
  }
  swap(arr, right, partitionIndex);
  return partitionIndex;
}

const swap = (arr, i, j) => {
  var temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

