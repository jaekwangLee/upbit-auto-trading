const getAverage = (numbers) => {
	const avg = sum(numbers) / numbers.length;
	return Number(avg.toFixed(2));
};

const sum = (numbers) => {
	try {
		return numbers.reduce((value, number) => value + number, 0);
	} catch (e) {
		return 0;
	}
};

export {getAverage, sum};
