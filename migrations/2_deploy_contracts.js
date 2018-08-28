var SurveyFactory = artifacts.require("./SurveyFactory.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, SurveyFactory);
  deployer.deploy(SurveyFactory);
};
