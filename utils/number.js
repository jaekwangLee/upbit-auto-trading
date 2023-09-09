const digitNum = (number, maxDigit) => {
  return parseFloat(parseFloat(number).toFixed(maxDigit));
}

export { digitNum };