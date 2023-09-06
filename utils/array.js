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

const getAverageWithWeight = (data = [], key) => {
	const DEFAULT_WEIGHT = 1; // 기준 가산치 ( 클수록  첫 데이터의 중요도가 높아짐 )
	const PER_WEIGHT_RATE = -0.001; // 가산치 증가 비율 ( 클수록 먼 데이터의 가치하락 폭이 증가함 )

	return (
		data.reduce((acc, val, index) => {
			const currWeight = DEFAULT_WEIGHT + index;
			const currWeightRate = currWeight * PER_WEIGHT_RATE;
			const weight = val[key] * currWeightRate;
			const weightedValue = val[key] + weight;

			return acc + weightedValue;
		}, 0) / data.length
	);
};

export {reduceArrayWithSameKey, getAverageByNumberField, getAverageWithWeight};
