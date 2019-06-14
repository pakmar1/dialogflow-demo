'use strict';

const functions = require('firebase-functions');
const https = require('https');
var admin = require('firebase-admin');

exports.dialogflowFirebaseFulfillment = 
  	functions.https.onRequest((request, response) => {
  		var chat = "Here is my primary response from the Inline editor before calling the API";
  
        const action = request.body.result.action;
  		response.setHeader('ContentType','application/json');

        if(action != 'input.getStockPrice') {
            response.send(buildChatResponse("I'm sorry, I don't know this!"));
          	return;
        }
        
        const parameters = request.body.result.parameters;
          
  		var companyName = parameters.company_name;// 'AAPL';
        var priceType = parameters.price_type;//'Opening';
        var date = parameters.date;//'2019-06-17';
        getStockPrice(companyName, priceType, date, response);
          
  		//response.send(JSON.stringify({"speech": chat, "displayText": chat}));
	});

function getStockPrice(companyName, priceType, date, cloudFnResponse) {
    //var cloudFnResponse = "In function get StockPrice";
  	console.log('In function getStockPrice');
  
    
  	console.log("Company Name: " + companyName);
    console.log("Price type: " + priceType);
    console.log("Date: " + date);

    var tickerMap = {
        "apple" : "AAPL",
        "microsoft" : "MSFT",
        "ibm" : "IBM",
        "google" : "GOOG",
        "facebook" : "FB",
        "amazon" : "AMZN",
      	"walmart" : "WMT"
    };

    var priceMap = {
        "opening" : "open_price",
        "closing" : "close_price",
        "maximum" : "high_price",
        "high" : "high_price",
        "minimum" : "low_price",
        "low" : "low_price"
    };
  	var stockTicker = tickerMap[companyName.toLowerCase()];
    var priceTypeCode = priceMap[priceType.toLowerCase()];
	var api_key = 'OjkxYmU3Y2RjMmMwMzg2YjA4ODIxODE3YjY2Njk4NWE3';
    
    var pathString = "https://api-v2.intrinio.com/historical_data/" + stockTicker +
                    "/" + priceTypeCode +
                    "?api_key=" + api_key + 
                    "&start_date=" + date +
                    "&end_date=" + date;
    console.log('Path String: ' + pathString);

    var request = https.get({
        host: "api-v2.intrinio.com",
        path: pathString
    }, function(response) {
        var json = "";
        response.on('data', function(chunk){
            console.log("Received json response: " + chunk);
            json += chunk;
        });

        response.on('end', function() {
            
            var jsonData = JSON.parse(json);
            console.log("Received json response: " + json);
            var interm = jsonData.historical_data;
            console.log("Received interm response: " + interm[0].value);

            var stockPrice = interm[0].value;
          
          
            
            console.log("The stock price received is:" + stockPrice);

            var chat = "The " + priceType + " price for " + companyName + 
                        " on " + date + " was " + stockPrice;
            cloudFnResponse.send(buildChatResponse(chat));
        });

    });

}

function buildChatResponse(chat) {
	return JSON.stringify({ "speech": chat, "displayText": chat});
}
