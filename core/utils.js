const mysql = require( 'promise-mysql' );
const request = require( 'request-promise' );
const configFile = require("../config.json");

const config = {
    host: configFile.host,
    user: configFile.user,
    password: configFile.password,
    database: configFile.database,
    charset: configFile.charset
};

// --
// Query SQL database function
// --

async function queryDB(sql) {
	let connection;
	try {
		connection = await mysql.createConnection(config);
		let result = await connection.query(sql);
		connection.end();
		return result;
	} catch (error) {
		console.log("Utils: Error in querying database\n"+error.stack);
	};
}

// --
// Check if string is a positive integer
// --

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n > 0;
}

function getTimestamp() {
	return new Date().getTime();
}

// --
// Check if string is numeric
// --

function isNumeric(num) {
    return !isNaN(num)
}

// --
// Generate a random number between min-max EXCLUDING max
// --

function randomIntEx(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// --
// Generate a random number between min-max INCLUDING max
// --

function randomIntIn(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --
// Generate a biased random number leaning closer to the minimum
// the higher 'p' is set
// --

function biasedRandom(min, max, p) {
  var bias  = Math.pow(Math.random(), p);
  return Math.round(min + (max-min) * bias);
}

// --
// Returns the mean average of an array
// --

function meanAverage(array) {
	var sum = 0;
	for(var i = 0; i < array.length; i++){
		sum += parseInt( array[i], 10 );
	}
	return sum/array.length;
}

// --
// Capitalize first letter of a string
// --

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// --
// Stringify a number (E.G. 1 -> first, 2 -> second)
// --

const special = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n) {
    if (n < 20) return special[n];
    if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + 'ieth';
    return deca[Math.floor(n / 10) - 2] + 'y-' + special[n % 10];
}

function getSum(total, num) {
  return total + num;
}

// --
// Return a formatted string displaying the time until a future timestamp
// --

function formatTimeUntil(futureTimestamp, hasDays) {
	var date = new Date();
	var timestamp = date.getTime();
	var timevar = parseInt(futureTimestamp - timestamp);
	var s = Math.floor( timevar /     1000 %   60 );
	var m = Math.floor( timevar /    60000 %   60 );
	var h = Math.floor( timevar /  3600000 %   24 );
	var d = Math.floor( timevar / 86400000        );
	if(hasDays) return d + " days, " + h + " hours, " + m + " minutes and " + s + " seconds";
	else return h + " hours, " + m + " minutes and " + s + " seconds";
}

// --
// Return a formatted string displaying the time since a past timestamp
// --

function formatTimeSince(pastTimestamp, hasDays) {
	var date = new Date();
	var timestamp = date.getTime();
	var timevar = parseInt(timestamp - pastTimestamp);
	var s = Math.floor( timevar /     1000 %   60 );
	var m = Math.floor( timevar /    60000 %   60 );
	var h = Math.floor( timevar /  3600000 %   24 );
	var d = Math.floor( timevar / 86400000        );
	if(hasDays) return d + " days, " + h + " hours, " + m + " minutes and " + s + " seconds";
	else return h + " hours, " + m + " minutes and " + s + " seconds";
}

function petTypeString(rarityNum) {
	var rarityString = "None";
	if (rarityNum == 6) rarityString = "Common";
    else if (rarityNum == 4) rarityString = "Uncommon";
    else if (rarityNum == 3) rarityString = "Rare";
    else if (rarityNum == 1) rarityString = "Ultra Rare";
	return rarityString;
}

async function webJson(url) {
	var options = {
		url: url,
		headers: {'User-Agent': 'request'},
		json: true
	}

	try {
		var result = await request(options);
		return result;
	} catch (err) {
		console.error(err);
	}
}

// --
// Generate level / max EXP based on the RuneScape formula
// --

function RSExp(){
    this.equate = function(xp){
        return Math.floor(xp + 300 * Math.pow(2, xp / 7));
    };
 
    this.level_to_xp = function(level){
        var xp = 0;
 
        for (var i = 1; i < level; i++)
            xp += this.equate(i);
 
        return Math.floor(xp / 4);
    };
 
    this.xp_to_level = function(xp){
        var level = 1;
 
        while (this.level_to_xp(level) < xp)
            level++;
 
        return level;
    };
 
}

function drawXPBar(neededXP, currentXP) {
	var percent = Math.floor((currentXP/neededXP*100));
	var tens = Math.ceil(percent / 10);
	var barString = "";
	if(tens > 10) tens = 10;
	if(tens < 1) tens = 1;
	for(var i = 0; i < tens; i++) {
		barString = barString + "█";
	}
	while(barString.length < 10) {
		barString = barString + "▁";
	}
	return barString + " " + percent + "%";
}

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// --
// Export functions
// --

module.exports = {queryDB, isNormalInteger, isNumeric, capitalize, stringifyNumber, formatTimeUntil, formatTimeSince, RSExp, getTimestamp, getSum, randomIntIn, randomIntEx, biasedRandom, drawXPBar, petTypeString, delay, webJson};