Survey Factory

Description: A marketplace for users to post and answer paid surveys on the blockchain.

Users post surveys with demographic criteria. Survey participants can create profiles with demographic data and then get paid answering surveys. Demographic data input by user is not verified.

The marketplace is managed by the owner who can stop deposits in case of emergency.

User Stories:

A survey maker opens the web app and sees their address and balance of 0 in user account area. They send funds to the contract deposit function so they can fund surveys. They creates a survey with demographic criteria and content is uploaded to IPFS and contract storage. They can withdraw funds from account.

A survey participant opens the web app and sees their address and balance of 0 in user account area. They create a profile with their demographic information. The participant sees a list of surveys with pay rates and demographic criteria. They add survey number to empty input field and press Get Survey button to get survey question from ipfs. Participant submits answer and is paid if they match demographic criteria. They can then withdraw any earnings.



How to set up app

Run ganache on port 8545 and network id 666

Download project from github link

npm install

Web app uses lite-server and will run on localhost:3000
npm run dev

Compile and migrate contracts. Truffle.js set network port and id. If compile doesn't work try deleting build folder.
truffle compile
truffle migrate

Run tests with 
truffle test