var SurveyFactory = artifacts.require("./SurveyFactory.sol");

/*
Tests that functions that write to state in the SurveyFactory contract update state as expected with valid parameters.
Tests for throws given invalid inputs such as strings of right length.
Tests that library functions call
*/

contract('SurveyFactory', function(accounts) {

	it("should deposit funds and call SafeMath library function", async () => {
		let instance = await SurveyFactory.deployed();
		let amount = 100;
		let deposit = await instance.deposit({value: amount});
		let balance = await instance.getBalance();
		assert.equal(balance.toNumber(), 100);
	});

	it("should stop depositing funds if circuit breaker toggle is switched true", async () => {
		let instance = await SurveyFactory.deployed();
		let toggle = await instance.toggleCircuitBreaker();

	    return SurveyFactory.deployed()
			.then(function(factory) {
				return factory.deposit({value: 10});
			})
			.then(assert.fail)
			.catch(function(error) {
				assert.equal(
					error.message,
					'VM Exception while processing transaction: revert'
			)
		});
	});

	it("should not be able to toggle circuit breaker if not owner", async () => {
		return SurveyFactory.deployed()
			.then(function(factory) {
				return factory.toggleCircuitBreaker({from: accounts[1]});
			})
			.then(assert.fail)
			.catch(function(error) {
				assert.equal(
					error.message,
					'VM Exception while processing transaction: revert'
			)
		});
	});

	it("should withdraw funds and call SafeMath library function", async () => {
		let instance = await SurveyFactory.deployed();
		let amount = 50;
		let withdraw = await instance.withdraw(amount);
		let balance = await instance.getBalance();
		assert.equal(balance.toNumber(), 50);
	});

	it("should not withdraw funds if user balance less than withdrawal amount", async () => {
		return SurveyFactory.deployed()
			.then(function(factory) {
				return factory.withdraw(500);
			})
			.then(assert.fail)
			.catch(function(error) {
				assert.equal(
					error.message,
					'VM Exception while processing transaction: revert'
			)
		});
	});

	it("should create profile", async () => {
		let instance = await SurveyFactory.deployed();
		let createProfile = await instance.createProfile("US",30,"M", {from: accounts[1]});
		let profile = await instance.userProfiles(accounts[1]);
		assert.equal(profile[0], "US");
		assert.equal(profile[1], 30);
		assert.equal(profile[2], "M");
	});

	it("should not create profile if country is not two characters", async () => {
		return SurveyFactory.deployed()
			.then(function(factory) {
				return factory.createProfile("USAAAAAAA", 30, "M", {from: accounts[1]});
			})
			.then(assert.fail)
			.catch(function(error) {
				assert.equal(
					error.message,
					'VM Exception while processing transaction: revert'
			)
		});
	});

	it("should create new survey", async () => {
		let instance = await SurveyFactory.deployed();
		let withdraw = await instance.createSurvey("QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",10,5,"US",10,50,"M");
		let survey = await instance.surveys(0);
		assert.equal(survey[0], accounts[0]);
		assert.equal(survey[1], "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn");
		assert.equal(survey[2].toNumber(), 10);
		assert.equal(survey[3].toNumber(), 5);
		assert.equal(survey[4], "US");
	});	

	it("should not create survey if survey funding is higher than account balance", async () => {
		return SurveyFactory.deployed()
			.then(function(factory) {
				return factory.createSurvey("QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",100,5,"US",10,50,"M", {from: accounts[0]});
			})
			.then(assert.fail)
			.catch(function(error) {
				assert.equal(
					error.message,
					'VM Exception while processing transaction: revert'
			)
		});
	});

	it("should answer survey and get paid if profile fits survey criteria", async () => {
		let instance = await SurveyFactory.deployed();
		let submitAnswer = await instance.answerSurvey(0,0, {from: accounts[1]});
		let newBalance = await instance.getBalance({from: accounts[1]});
		let surveyGet = await instance.surveys(0);
		let surveyPayRate = surveyGet[3].toNumber();
		assert.equal(newBalance.toNumber(), surveyPayRate);
	});	

	it("should not answer survey if user already answered", async () => {
		return SurveyFactory.deployed()
			.then(function(factory) {
				return factory.answerSurvey(0,0, {from: accounts[1]});
			})
			.then(assert.fail)
			.catch(function(error) {
				assert.equal(
					error.message,
					'VM Exception while processing transaction: revert'
			)
		});
	});

});