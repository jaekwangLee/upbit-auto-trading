class Market {
	constructor(_data) {
		this.ticker = _data.market;
		this.name = _data.korean_name;
		this.enName = _data.english_name;
	}
}

export default Market;
