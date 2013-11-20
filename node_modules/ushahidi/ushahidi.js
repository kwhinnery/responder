var https = require("https");
var querystring = require("querystring");
var url = require("url");

/* Initialize the Ushahidi API with your base URL */
module.exports.init = function(baseURL,u,p){
        this.baseURL = baseURL;
        this.username = u;
        this.password = p;
}


/* Submits an unverified report to the server */
module.exports.submitReport = function(report,success, failure) {

	//construct url string from report
	report.task = "report";
	var postData = querystring.stringify(report);

	this.postCall(this.baseURL,postData,success,failure);
}

/* Returns all of the categories from the server */
module.exports.categories = function(success, failure) {
	this.getCall(this.baseURL + "?task=categories",		
		function(payload) {
			success(data.payload.categories);
		},
		function(error) {
			failure(error);
		});
}

/* Returns all of the categories from the server */
module.exports.category = function(categoryId,success, failure) {
	this.getCall(this.baseURL + 
		"?task=categories&by=catid&id=" 
		+ categoryId,		
		function(payload) {
			success(data.payload.categories);
		},
		function(error) {
			failure(error);
		});
}

/* Returns the Ushahidi version running on the server, 
along with descriptive information */
module.exports.versionMiscellaneous = function(success, failure) {
	this.getCall(this.baseURL + "?task=version",success,failure);
}

/* Internal HTTP Post API Call */
module.exports.postCall = function(postURL,postData,success,failure) {

	//require success and failure
	if(typeof success == "undefined"){
		throw Error("A success method must be passed in as an argument");
	}

	if (typeof failure == "undefined") {
		throw Error("A failure method must be passed in as an argument");
	}

	var options = url.parse(postURL);
	options.method = 'POST';
    options.auth = this.username+':'+this.password;
	options.headers =  {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
      }

	var postRequest = https.request(options, function(response){
	    var buffer = "";
	    response.on("data", function(chunk){
	            buffer+=chunk;
	    });
	    response.on("end", function () {
	    	data = JSON.parse(buffer);
        	success(data);
        });
        response.on("error", function (error) {
        	failure(error);
        });
        
    }); 

    postRequest.write(postData);
    postRequest.end();
}


/* Internal HTTP Get API Call */
module.exports.getCall = function(url,success,failure) {

	//require success and failure
	if(typeof success == "undefined"){
		throw Error("A success method must be passed in as an argument");
	}

	if (typeof failure == "undefined") {
		throw Error("A failure method must be passed in as an argument");
	}


	https.get(url, function(response){
	    var buffer = "";
	    response.on("data", function(chunk){
	            buffer+=chunk;
	    });
	    response.on("end", function () {
	    	console.log(buffer);
        	data = JSON.parse(buffer);
        	console.log(data);
        	success(data);
        });
        response.on("error", function (error) {
        	console.log(error);
        	failure(error);
        });
        
    }); 
}