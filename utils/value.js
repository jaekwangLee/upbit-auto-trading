const getAverage = (numbers) => {
	const avg = numbers.reduce((prev, curr) => prev + curr, 0) / numbers.length;
	return Number(avg.toFixed(2));
};

export {getAverage};
