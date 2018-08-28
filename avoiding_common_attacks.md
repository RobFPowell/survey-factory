Reentrancy
Withdraw function changes balance before calling msg.sender.transfer. This ensures a second or more calls to function will not to withdraw more funds than the users updated balance.

Integer Overflow and Underflow
Addition and subtraction is handled with the SafeMath library. SafeMath uses require to revert transaction if addition or subtraction is not behaving as expected because the too high or large of numbers causing overflow or underflow.

DOS With Block Gas Limit
App uses pull instead of push payments. Users must withdraw own funds, there is no function that loops through user balances and pays out funds.

Transaction Ordering / Front Running
Survey makers can't adjust pay rate of existing survey so they can't front run participant and lower price.

Timestamp Dependance
No functions depend on block timestamp

Forcibly Sending Ether to Contract
No functions depend on contract balance