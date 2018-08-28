App = {
  web3Provider: null,
  contracts: {},

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('SurveyFactory.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SurveyFactoryArtifact = data;
      App.contracts.SurveyFactory = TruffleContract(SurveyFactoryArtifact);

      // Set the provider for our contract
      App.contracts.SurveyFactory.setProvider(App.web3Provider);
      return App.loadData();
    });
  },

  loadData: function() {
    userAddress = web3.eth.accounts[0].toString();
    $('#userAddress').replaceWith('<div id="userAddress">Current Address:  ' + userAddress + '</div>');
    App.getProfile();
    App.getBalance();
    App.getSurveysLength();
    App.getSurveyAnswerLength();
    App.getApproved();
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#deposit', App.deposit);
    $(document).on('click', '#withdraw', App.withdraw);
    $(document).on('click', '#createProfile', App.createProfile);
    $(document).on('click', '#createSurvey', App.createSurvey);
    $(document).on('click', '#getSurveyContent', App.getSurveyContent);
    $(document).on('click', '#addAddress', App.approveAddress);
  },

  getApproved: function() {
    userAddress = web3.eth.accounts[0].toString();
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.approved.call(userAddress);
    }).then(function(approvedBool) {
      if (approvedBool) {
        $('#userAddress').append(' is Approved');
        console.log(approvedBool);
      } else {
        $('#userAddress').append(' is Not Approved');
      }
      return approvedBool;
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getProfile: function() {
    userAddress = web3.eth.accounts[0];
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.userProfiles.call(userAddress);
    }).then(function(profile) {
      if (profile[0]) {
        $('#userProfile').replaceWith('<div id="userProfile"> User Profile:  ' + profile + '</div>');
        $('#createProfile').replaceWith('<button id="createProfile"> Update Profile </button>');
      }
      return profile;
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getBalance: function(event) {
    userAddress = web3.eth.accounts[0];
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call({from: userAddress});
    }).then(function(balance) {
      userBalance = web3.fromWei(balance, 'ether').toString();
      $('#userBalance').replaceWith('<div id="userBalance"> Balance:  ' + userBalance + '</div>');
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getSurveysLength: function() {
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.surveyCount.call();
    }).then(function(length) {
      if(length.toNumber() > 0) {
        var i;
        for (i=0; i<length.toNumber(); i++) {
          App.getSurveys(i);
        }
      }
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getSurveys: function(i) {
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.surveys(i);
    }).then(function(survey) {
      // console.log(survey);
      $('#surveyTable').append(`
        <tr><td>` + i + `</td>
        <td>` + web3.fromWei(survey[2], 'ether').toString() + `</td>
        <td>` + web3.fromWei(survey[3], 'ether').toString() + `</td>
        <td>` + survey[4] + `</td>
        <td>` + survey[5] + `</td>
        <td>` + survey[6] + `</td>
        <td>` + survey[7] + `</td></tr>`)
      return survey;
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getSurveyContent: function(events) {
    surveyNumber = $('#surveyNumber').val();
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.surveys(surveyNumber);
    }).then(function(survey) {
      ipfs.files.get(survey[1], function (err, res) {
        console.log(err);
        console.log(res);
        parsed = JSON.parse(res[0].content.toString());
        console.log(parsed);
        $('#surveyAnswerArea').append(
          `<div id="surveyAnswered">` + surveyNumber + `</div>` + 
          parsed.question + 
          `<input type="radio" name="userAnswer" value="0">` + parsed.answerA +
          `<input type="radio" name="userAnswer" value="1">` + parsed.answerB +
          `<input type="radio" name="userAnswer" value="2">` + parsed.answerC +
          `<input type="radio" name="userAnswer" value="3">` + parsed.answerD +
          `<button id="answerSurvey" onclick="App.answerSurvey()">Answer Survey</button>`
        )
      });
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getSurveyAnswerLength: function() {
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.surveyAnswerCount.call();
    }).then(function(length) {
      if(length.toNumber() > 0) {
        var i;
        for (i=0; i<length.toNumber(); i++) {
          App.getSurveyAnswers(i);
        }
      }
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  getSurveyAnswers: function(i) {
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.surveyAnswers(i);
    }).then(function(surveyAnswer) {
      console.log(surveyAnswer[0].toNumber());
      $('#surveyAnswerTable').append(`
        <tr><td>` + surveyAnswer[0].toString() + `</td>
        <td>` + surveyAnswer[2] + `</td>
        <td>` + web3.fromWei(surveyAnswer[1], 'ether').toString() + `</td>
        <td>` + surveyAnswer[3] + `</td>
        <td>` + surveyAnswer[4] + `</td>
        <td>` + surveyAnswer[5] + `</td>
        <td>` + surveyAnswer[6] + `</td></tr>`)
      return surveyAnswer;
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  approveAddress: function(event) {
    userAddress = web3.eth.accounts[0];

    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.addApprovedAddress($('#addressToApprove').val());
    }).then(function(response) {
      console.log(response);
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  deposit: function(event) {
    userAddress = web3.eth.accounts[0];
    depositAmount = web3.toWei($('#depositAmount').val(), 'ether');

    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.deposit({from: userAddress, value: depositAmount});
    }).then(function(response) {
      console.log(response);
      // console.log(response.logs[0].args.amount.toNumber());
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  withdraw: function(event) {
    userAddress = web3.eth.accounts[0];
    withdrawalAmount = web3.toWei($('#withdrawalAmount').val(), 'ether');

    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.withdraw(withdrawalAmount, {from: userAddress});
    }).then(function(response) {
      console.log(response);
      location.reload();
    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  createProfile: function(event) {
    userAddress = web3.eth.accounts[0];
    country = $('#country').val();
    age = $('#age').val();
    gender = $('input[name=sex]:checked').val();
    console.log(gender);
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.createProfile(country, age, gender, {from: userAddress});
    }).then(function(response) {
      console.log(response);
      location.reload();

    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  },

  createSurvey: function(event) {
    userAddress = web3.eth.accounts[0];
    country = $('#nationalityReq').val();
    ageMin = $('#minAge').val();
    ageMax = $('#maxAge').val();
    gender = $('input[name=sexReq]:checked').val();
    balance = Number(web3.toWei($('#budget').val(), 'ether'));
    payRate = Number(web3.toWei($('#payRate').val(), 'ether'));
    surveyContent = `{
      "question":"` + $('#question').val()+ `",
      "answerA":"` + $('#answerA').val() + `",
      "answerB":"` + $('#answerB').val() + `",
      "answerC":"` + $('#answerC').val() + `",
      "answerD":"` + $('#answerD').val() + `"
    }`;
    ipfsBuffer = ipfs.types.Buffer(surveyContent);
    ipfs.files.add(ipfsBuffer, function (error, response) {
      console.log(error);
      console.log(response[0].path);
      var meta;
      App.contracts.SurveyFactory.deployed().then(function(instance) {
        meta = instance;
        return meta.createSurvey(response[0].path, balance, payRate, country, ageMin, ageMax, gender, {from: userAddress});
      }).then(function(response) {
        console.log(response);
        location.reload();
      }).catch(function(e) {
        console.log(e);
        console.log("ERROR 404");
      });
    });
  },

  answerSurvey: function(event) {
    userAddress = web3.eth.accounts[0];
    numberQ = $('#surveyAnswered').text();
    userAnswer = $('input[name=userAnswer]:checked').val();
    var meta;
    App.contracts.SurveyFactory.deployed().then(function(instance) {
      meta = instance;
      return meta.answerSurvey(numberQ, userAnswer, {from: userAddress});
    }).then(function(response) {
      console.log(response);
      location.reload();

    }).catch(function(e) {
      console.log(e);
      console.log("ERROR 404");
    });
  }

};

$(function () {
  $(window).load(function() {
    ipfs = new Ipfs({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
    console.log(ipfs);
    App.initWeb3();
  });
});