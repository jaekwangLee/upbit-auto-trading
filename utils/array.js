const reduceArrayWithSameKey = (originArr, arr, key) => {
  return originArr.reduce((prev, val) => {
    const matchedValueIndex = arr.findIndex((item) => item[key] === val[key]);
    const matchedValue = arr[matchedValueIndex];
    if (!matchedValue) {
      return prev;
    }
    
    const prevArrMatchedValueIndex = prev.indexOf((prevItem) => prevItem[key] === matchedValue[key]);

    if (prevArrMatchedValueIndex < 0) {
      prev.push({
        ...matchedValue,
        ...val,
      });
    } else {
      prev[matchedValueIndex] = {
        ...prev[matchedValueIndex],
        ...matchedValue,
        ...val,
      };
    }

    return prev;
  }, [])
}

export { reduceArrayWithSameKey }