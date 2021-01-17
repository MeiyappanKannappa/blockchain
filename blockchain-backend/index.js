const express = require('express');
const bodyParser = require('body-parser')
 
const app = express()
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// SMART CONTRACT CONFIG
let fs = require("fs");
let Web3 = require('web3'); // https://www.npmjs.com/package/web3

// Create a web3 connection to a running geth node over JSON-RPC running at
// http://localhost:8545
// For geth VPS server + SSH tunneling see
// https://gist.github.com/miohtama/ce612b35415e74268ff243af645048f4
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));

// Read the compiled contract code
// Compile with
// solc SampleContract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contracts.json
let source = fs.readFileSync("chocolavabank.json");
let contracts = JSON.parse(source);
var Contract = require('web3-eth-contract');




//SMART CONTRACT CONFIG ENDS

app.get('/', (req, res) => { // new
  res.send('Homepage! Hello world.');
});

app.get('/getBalance', (req, res) => { // new
    console.log(req.query.account_id);
    var myContract = new web3.eth.Contract(contracts.abi,  process.env.CONTRACTS_ADDRESS, {
        from: req.query.account_id, // default from address
        gasPrice: '3000000' // default gas price in wei, 20 gwei in this case
    });
    myContract.methods.balance().call({from: req.query.account_id,gasPrice: '3000000'})
    .then(function(result){
        console.log(result+' wei')
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Headers', "*");
        res.send(result+' wei');
    }).catch(err => {
        console.log(err)
        res.send(err);
    });
    
});

app.get('/withdraw', (req, res) => { // new
    console.log('--Req Params--')
    console.log(req.query.account_id);
    console.log(req.query.amount);
    console.log(process.env.CONTRACTS_ADDRESS)
    var myContract = new web3.eth.Contract(contracts.abi, process.env.CONTRACTS_ADDRESS, {
        from: req.query.account_id, // default from address
        gasPrice: '3000000' // default gas price in wei, 20 gwei in this case
    });
    myContract.methods.withdraw(req.query.amount).send({from: req.query.account_id,gasPrice: '3000000'})
    .then(function(result){
        
        console.log(result)
        myContract.methods.balance().call({from: req.query.account_id,gasPrice: '3000000'})
        .then(function(balance){
            console.log("Check Balance ",balance)
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*");
            res.send(balance+" wei");
        }).catch(err => {
            console.log(err)
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*");
            res.send('Transaction Failure! Balance Update failed');
        });
    }).catch(err => console.log(err));
    
});

app.get('/transfer', (req, res) => { // new
    console.log(req.query.account_id);
    console.log(req.query.amount);
    console.log(req.query.to_account);
    console.log(process.env.CONTRACTS_ADDRESS)
    var myContract = new web3.eth.Contract(contracts.abi, process.env.CONTRACTS_ADDRESS, {
        from: req.query.account_id, // default from address
        gasPrice: '3000000' // default gas price in wei, 20 gwei in this case
    });
   
    myContract.methods.transfer(req.query.to_account,req.query.amount).send({from: req.query.account_id,gasPrice: '300'})
    .then(function(result){
        console.log("After Transfer",result)
        myContract.methods.balance().call({from: req.query.account_id,gasPrice: '300'})
        .then(function(balance){
            console.log("Check Balance ",balance)
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*");
            res.send(balance+" wei");
        }).catch(err => {
            console.log(err)
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*");
            res.send('Transaction Failure! Balance Update failed');
        });
        myContract.methods.balance().call({from: req.query.to_account,gasPrice: '300'})
        .then(function(balance){
            console.log("Reciever Account Balance ",balance)
            
        }).catch(err => {
            console.log(err)
           
        });
        //res.send(result);
    }).catch(err => {
        console.log(err)
        res.send("Transaction Failure! Transfer failed")
    });
    
});
app.get('/getTransactions', (req, res) => { // new
    console.log(req.query.account_id);
    var myContract = new web3.eth.Contract(contracts.abi,  process.env.CONTRACTS_ADDRESS, {
        from: req.query.account_id, // default from address
        gasPrice: '3000000' // default gas price in wei, 20 gwei in this case
    });
    web3.eth.getTransactionCount(req.query.account_id)
 .then((b=console.log)=>{
    console.log(b)
    for(var i=0;i<b;i++){
            web3.eth.getBlock(b-i).then((Block)=>
            {

            a =[ Block.hash]
                     console.log(a);
                 var  iterator =a.values()
                 for (let elements of iterator) { 
                  web3.eth.getTransactionFromBlock(elements).then(console.log)
                } 
             });
         }
         });
    
});
app.listen(8000, () => console.log('listening on port 8000'));