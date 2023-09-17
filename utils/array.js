import {DEFAULT_WEIGHT, PER_WEIGHT_RATE} from '../constant/trading.js';

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
	}, []);
};

const getAverageByNumberField = (data = [], key) => {
	return data.reduce((acc, val) => acc + val[key], 0) / data.length;
};

const getAverageWithWeight = (data = [], key, defaultWeight = 0, weightRate = 0) => {
	return (
		data.reduce((acc, val, index) => {
			const currWeight = defaultWeight + index;
			const currWeightRate = currWeight * weightRate;
			const weight = val[key] * currWeightRate;
			const weightedValue = val[key] + weight;

			return acc + weightedValue;
		}, 0) / data.length
	);
};

export {reduceArrayWithSameKey, getAverageByNumberField, getAverageWithWeight};
