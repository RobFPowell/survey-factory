pragma solidity ^0.4.17;

import "./SafeMath.sol";

contract SurveyFactory {

    // uses SafeMath library to prevent overflow and underflow on addition and subtraction
    using SafeMath for uint;

    // Set owner of contract and modifier isOwner to restrict function access
    address private owner;

    modifier isOwner {
        require(msg.sender==owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
        surveyCount = 0;
    }

    mapping (address => uint) private balances;

    struct userProfile {
        string country;
        uint age;
        string sex;
    }
    
    mapping (address => userProfile) public userProfiles;
    
    struct Survey {
        address surveyOwner;
        string ipfsHash;
        uint balance;
        uint payRate;
        string nationality;
        uint minAge;
        uint maxAge;
        string gender;
        mapping (address => bool) addressAnswered;
    }

    uint public surveyCount;    
    Survey[] public surveys;
    
    struct SurveyAnswer {
        uint surveyAnswered;
        uint payrate;
        address userAddress;
        uint answer;
        string nationality;
        uint age;
        string gender;
    }
    
    uint public surveyAnswerCount;
    SurveyAnswer[] public surveyAnswers;

    event LogDeposit(address accountAddress, uint balance);
    event LogWithdrawal(address accountAddress, uint withdrawAmount, uint newBalance);
    event LogCreateSurvey(address accountAddress, string ipfsHashInput, uint deposit, uint payRateInput);

    // circuitBreaker stops deposit()  in case of emergency, owner turns on with toggleCircuitBreaker()
    bool private stopped = false;
    modifier circuitBreaker {
        require(!stopped); 
        _; 
    }

    function toggleCircuitBreaker () 
        isOwner
        public
    {
        stopped = !stopped;
    }

    // Add ether sent to user balance, don't deposits if owner toggles circuit breaker
    function deposit ()
        circuitBreaker
        public 
        payable 
        returns (uint) 
    {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        emit LogDeposit(msg.sender, balances[msg.sender]);
        return (balances[msg.sender]);
    }

    // Withdrawal pattern subtracts from user balance before msg.sender.transfer
    function withdraw (uint withdrawAmount)
        public
        returns (uint)
    {
        require(balances[msg.sender] >= withdrawAmount);
        balances[msg.sender] = balances[msg.sender].sub(withdrawAmount);
        msg.sender.transfer(withdrawAmount);
        emit LogWithdrawal(msg.sender, withdrawAmount, balances[msg.sender]);
        return(balances[msg.sender]);
    }

    function createProfile (string country, uint age, string gender)
        public
        returns (bool)
    {
        require(age <= 99 && age >= 1);
        require(keccak256(gender) == keccak256("M") || keccak256(gender) == keccak256("F"));
        require(bytes(country).length == 2);
        userProfile memory user = userProfile(country, age, gender);
        userProfiles[msg.sender] = user;
        return true;
    }

    function createSurvey (string ipfsHashInput, uint surveyFunding, uint payRateInput, string nationality, uint ageMin, uint ageMax, string gender)
        public
        returns (string)
    {
        // Verify survey has enough funding and survey maker used valid inputs
        require(balances[msg.sender] >= surveyFunding);
        require(bytes(ipfsHashInput).length == 46);
        require(surveyFunding >= payRateInput);
        require(ageMax <= 99 && ageMax >= 1);
        require(ageMin <= 99 && ageMin >= 1);
        require(keccak256(gender) == keccak256("M") || keccak256(gender) == keccak256("F"));
        require(bytes(nationality).length == 2);
        
        // Lower balance of survey maker by amount of survey funding
        balances[msg.sender] = balances[msg.sender].sub(surveyFunding);

        // Create survey and push to survey array
        Survey memory createdSurvey = Survey(msg.sender, ipfsHashInput, surveyFunding, payRateInput, nationality, ageMin, ageMax, gender);
        surveys.push(createdSurvey);
        surveyCount++;
        emit LogCreateSurvey(msg.sender, ipfsHashInput, surveyFunding, payRateInput);
        return ipfsHashInput;
    }

    function answerSurvey (uint surveyAnswered, uint answer) 
        public
        returns (uint)
    {
        // Verify survey has funding and participant has matching demographics and valid inputs
        require(surveys[surveyAnswered].balance >= surveys[surveyAnswered].payRate);
        require(answer >=0 && answer <= 3);
        require(userProfiles[msg.sender].age >= surveys[surveyAnswered].minAge);
        require(userProfiles[msg.sender].age <= surveys[surveyAnswered].maxAge);
        require(keccak256(userProfiles[msg.sender].country) == keccak256(surveys[surveyAnswered].nationality));
        require(keccak256(userProfiles[msg.sender].sex) == keccak256(surveys[surveyAnswered].gender));
        require(surveys[surveyAnswered].addressAnswered[msg.sender] != true);

        // Set user answered
        surveys[surveyAnswered].addressAnswered[msg.sender] = true;

        // Create survey answer and push to array
        SurveyAnswer memory answerStruct = SurveyAnswer(surveyAnswered, surveys[surveyAnswered].payRate, msg.sender, answer, userProfiles[msg.sender].country,userProfiles[msg.sender].age,userProfiles[msg.sender].sex);
        surveyAnswers.push(answerStruct);
        surveyAnswerCount++;

        // Add ether to participant account and lower survey balance
        balances[msg.sender] = balances[msg.sender].add(surveys[surveyAnswered].payRate);
        surveys[surveyAnswered].balance = surveys[surveyAnswered].balance.sub(surveys[surveyAnswered].payRate);
        return surveys[surveyAnswered].payRate;
    }
    
    function getBalance()
        public
        view
        returns (uint)
    {
        return balances[msg.sender];
    }
    
    // Fallback function reverts transactions with no data
    function () {
        revert();
    }
}