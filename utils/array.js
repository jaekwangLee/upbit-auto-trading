const reduceArrayWithSameKey = (originArr, arr, key) => {
  return originArr.reduce((prev, val) => {
    const matchedValueIndex = arr.indexOf((item) => item[key] === val[key]);
    if (!matchedValue) {
      return prev;
    }

    const matchedValue = arr[matchedValueIndex];
    const prevArrMatchedValueIndex = prev.indexOf((prevItem) => prevItem[key] === matchedValue[key]);

    if (!prevArrMatchedValueIndex) {
      prev.push(matchedValue);
    } else {
      prev[matchedValueIndex] = {
        ...prev[matchedValueIndex],
        ...matchedValue,
      };
    }

    return prev;
  }, [])
}

export { reduceArrayWithSameKey }