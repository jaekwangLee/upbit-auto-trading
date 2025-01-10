class Market {
	constructor(_data) {
		this.ticker = _data.market;
		this.name = _data.korean_name;
		this.enName = _data.english_name;
		this.isWarning = _data.market_event.warning;
		this.isCaution = _data.market_event.caution;
	}

	// 급등락 경보
	get isFluctuation() {
		return this.isCaution === 'PRICE_FLUCTUATIONS';
	}

	// 거래량 급등
	get isVolumeSoaring() {
		return this.isCaution === 'TRADING_VOLUME_SOARING';
	}

	// 입출금 급등
	get isAccountSoaring() {
		return this.isCaution === 'DEPOSIT_AMOUNT_SOARING';
	}

	// 글로벌 가격과 간극 발생
	get isGlobalGap() {
		return this.isCaution === 'GLOBAL_PRICE_DIFFERENCES';
	}

	// 소수 계정 집중매매
	get isGiantGroupHandles() {
		return this.isCaution === 'CONCENTRATION_OF_SMALL_ACCOUNTS';
	}
}

export default Market;
