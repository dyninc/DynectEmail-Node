var DynectEmailNode = require('./../lib/dynectemail/index').DynectEmailNode;

/*
 * Init object
 */
var dynectemail = new DynectEmailNode({
	apikey: 'apikey',
	//useragent: 'my-app' // Change the user agent. Default is 'dynectemail-node'
	//secure: true,       // True will use port 443 instead of 80
	//format: 'xml',      // Possible formats: 'json', 'xml', 'html'. Default is json
	                      // Please note if you change the format from json the example below wont work. 
	                      // 'data' will no longer be an object it will be a string.
});

/*
 * Get sends
 */
var request_sent = dynectemail.request("reports/sent", {
    startdate: Date.UTC(2012,1,1), //year,month,day
	enddate:   Date.UTC(2012,1,7), //year,month,day
    handlers: {
        success: function(data) {
			if(data.response.status != '200') {
				console.log('Request Failed: ' + data.response.status + ' ' +data.response.message);
			} else {
				console.log('Request Success: ' + data.response.status, data.response.data);
			}
        },
        error: function(error) {
            console.log("Error: " + error.message);
        }
    }
});

/*
 * Create a sender
 */
var request_sender = dynectemail.request("senders", {
    emailaddress: 'superawesomesender@example.org',
    handlers: {
        success: function(data) {
			if(data.response.status != '200') {
				console.log('Request Failed: ' + data.response.status + ' ' +data.response.message);
			} else {
				console.log('Request Success: ' + data.response.status, data.response.data);
			}
        },
        error: function(error) {
            console.log("Error: " + error.message);
        }
    }
}, 'POST');


/**********************************
 * response format
 * 
 * data {
 *   response {
 *     status: (int) http status code,
 *     message: (string) If it errors message will be there with the http status message
 *     data: (object) the data object of a successful request with data to return
 *   }
 * }
 **********************************/
