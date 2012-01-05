# dynectemail-node

Read and write DynECT Email.

## Installation

    npm install dynectemail

## Usage

	var DynectEmailNode = require('dynectemail').DynectEmailNode;

	var dynectemail = new DynectEmailNode({
		apikey: 'apikey' //you can get this from the Integration page http://email.dynect.net/index.php?Page=Integration
		useragent: 'appname/vX.X MyApp' // optional. defaults to dynectemail-node.
	});

## Documentation

### DynectEmailRequest

    dynectemail.request(method, options, reqtype);

Returns a `DynectEmailRequest` instance.

Send request to DynECT Email. Requests automatically include the API key and are signed and/or sent via POST as described in the DynECT Email REST API documentation.

Methods:

Accepts any DynECT Email REST API method name, eg "reports/sent/count". 

Options:

All options are passed through to DynectEmail with the exception of the following.

- *handlers*

        Default event handlers to attach to the request object on creation.

Events:

- *success(json)*

        JSON response from DynECT Email

- *error(error)*

        An error returned by a transmission error.

## Influences

Heavily drawn from jammus's lastfm-node  
http://github.com/jammus/lastfm-node
