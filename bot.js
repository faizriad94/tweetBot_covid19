const axios = require('axios').default;
const cheerio = require('cheerio');

const twit = require('./twit');
const tips = require('./tips'); //array of tips

const botName = 'covid_bot_my';

let rng = Math.floor(Math.random() * tips.length);

/**
 * Make requests to endpoints.
 * @param { string } url
 */
async function getEndpoint(url) {
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

/**
 * Get streaming events.
 * Bot will reply when user interacts
 */
function getStreamEvents(e) {
	let replyTo = e.in_reply_to_screen_name;
	let text = e.text;
	let userName = e.user.screen_name;
	let tweetId = e.id_str;

	if (replyTo === botName) {
		if (text.toLowerCase().includes('tips')) {
			getTips(userName, tweetId);
		} else if (text.toLowerCase().includes('negeri')) {
			getStatsByState(userName, tweetId);
		}
	}
}

/**
 * Get tips for covid19 prevention
 * @param { string } user - username of the twitter account
 * @param { string } tweetId  - id of the tweet
 */
function getTips(user, tweetId) {
	let newTweet = `@${user} ${tips[rng]} #covidTips`;
	twit.sendTweet(newTweet, tweetId);
}

async function getYesterdayData() {
	const date = new Date();

	//get date in YYYY-MM-DD
	let today = date.toISOString().split('T')[0].split('-');
	let t = `${today[0]}-${today[1]}-${today[2]}`;

	let yesterday = date;
	yesterday.setDate(yesterday.getDate() - 1);
	let y = yesterday.toISOString().split('T')[0].split('-');
	let y2 = `${y[0]}-${y[1]}-${y[2]}`;

	//yesterday's data
	let yd = await getEndpoint(
		`http://api.coronatracker.com/v3/analytics/trend/country?countryCode=MY&startDate=${y2}&endDate=${t}`
	);
	return {
		lastTotalCase: yd[0].total_confirmed,
		lastTotalDeath: yd[0].total_deaths,
		lastTotalRecover: yd[0].total_recovered,
	};
}

// Get stats of covid-19 in Malaysia
async function getTotalStats() {
	let yd = await getYesterdayData();
	let lastTotalCase = yd.lastTotalCase;
	let lastTotalDeath = yd.lastTotalDeath;
	let lastTotalRecover = yd.lastTotalRecover;

	let data = await getEndpoint(
		'http://api.coronatracker.com/v3/stats/worldometer/country?countryCode=MY'
	);

	let date = new Date(data[0].lastUpdated);

	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();

	let hour = date.getHours();
	let minute = date.getMinutes();
	let isAM = hour < 12 ? 'am' : 'pm';

	// twit.sendTweet(`Ringkasan Kes COVID-19 terkini di Malaysia (Sehingga ${regularHour(
	// 	hour
	// )}:${minute}${isAM}, ${day}-${month}-${year})
	// Jumlah Kes Baru: ${d[0].totalConfirmed - lastTotalCase}
	// Jumlah Pulih Baru: ${d[0].totalRecovered - lastTotalR}
	// Jumlah Kematian Baru: ${d[0].totalDeaths - lastTotalDeath}

	// Jumlah Kes: ${d[0].totalConfirmed}
	// Jumlah Pulih: ${d[0].totalRecovered}
	// Jumlah Kritikal: ${d[0].totalCritical}
	// Jumlah Dalam Rawatan: ${d[0].activeCases}
	// Jumlah Kematian: ${d[0].totalDeaths}`);

	console.log(
		`Ringkasan Kes COVID19 terkini di Malaysia (Sehingga ${regularHour(
			hour
		)}:${minute}${isAM}, ${day}-${month}-${year})
		Jumlah Kes Baru: ${data[0].totalConfirmed - lastTotalCase}
		Jumlah Pulih Baru: ${data[0].totalRecovered - lastTotalRecover}
		Jumlah Kemation Baru: ${data[0].totalDeaths - lastTotalDeath}

		Jumlah Kes: ${data[0].totalConfirmed}
		Jumlah Pulih: ${data[0].totalRecovered}
		Jumlah Kritikal: ${data[0].totalCritical}
		Jumlah Dalam Rawatan: ${data[0].activeCases}
	    Jumlah Kematian: ${data[0].totalDeaths}
	    #COVID19 #COVID19Malaysia`
	);
}
// function getTotalStats() {
// 	let totalStats = getEndpoint(
// 		'http://api.coronatracker.com/v3/stats/worldometer/country?countryCode=MY'
// 	);

// 	totalStats.then((data) => {
// 		let date = new Date(data[0].lastUpdated);

// 		let year = date.getFullYear();
// 		let month = date.getMonth() + 1;
// 		let day = date.getDate();

// 		let hour = date.getHours();
// 		let minute = date.getMinutes();
// 		let isAM = hour < 12 ? 'am' : 'pm';

// 		last = data[0].lastUpdated;
// 		console.log('last updated' + last);

// 		// twit.sendTweet(`Ringkasan Kes COVID-19 terkini di Malaysia (Sehingga ${regularHour(
// 		// 	hour
// 		// )}:${minute}${isAM}, ${day}-${month}-${year})
// 		// Jumlah Kes Baru: ${d[0].totalConfirmed - lastTotalCase}
// 		// Jumlah Pulih Baru: ${d[0].totalRecovered - lastTotalR}
// 		// Jumlah Kematian Baru: ${d[0].totalDeaths - lastTotalDeath}

// 		// Jumlah Kes: ${d[0].totalConfirmed}
// 		// Jumlah Pulih: ${d[0].totalRecovered}
// 		// Jumlah Kritikal: ${d[0].totalCritical}
// 		// Jumlah Dalam Rawatan: ${d[0].activeCases}
// 		// Jumlah Kematian: ${d[0].totalDeaths}`);

// 		console.log(
// 			`Ringkasan Kes COVID19 terkini di Malaysia (Sehingga ${regularHour(
// 				hour
// 			)}:${minute}${isAM}, ${day}-${month}-${year})
// 		Jumlah Kes Baru: ${data[0].totalConfirmed - lastTotalCase}
// 		Jumlah Pulih Baru: ${data[0].totalRecovered - lastTotalR}
// 		Jumlah Kemation Baru: ${data[0].totalDeaths - lastTotalDeath}

// 		Jumlah Kes: ${data[0].totalConfirmed}
// 		Jumlah Pulih: ${data[0].totalRecovered}
// 		Jumlah Kritikal: ${data[0].totalCritical}
// 		Jumlah Dalam Rawatan: ${data[0].activeCases}
//         Jumlah Kematian: ${data[0].totalDeaths}
//         #COVID19 #COVID19Malaysia`
// 		);
// 	});
// }

/**
 * Get stats of each Malaysia states.
 * @param { string } user - username of the twitter account
 * @param { string } tweetId  - id of the tweet
 */
function getStatsByState(user, tweetId) {
	//web scrape from website
	let data = getEndpoint('https://www.outbreak.my/');
	let info = {};

	data.then((res) => {
		const $ = cheerio.load(res);
		$('tbody tr').each((i, e) => {
			let negeri = $(e).children('.text-value').text().trim().toLowerCase();
			let total = $(e).children('.text-value-total').text();
			let death = $(e).children('.text-value-black').text();

			if (negeri === 'kuala lumpur') {
				negeri = 'KL';
			}

			if (negeri === 'negeri sembilan') {
				negeri = 'n9';
			}

			info[negeri] = [negeri, total.trim(), death.trim()];
		});

		let stateData = [];
		for (let [key, value] of Object.entries(info)) {
			//checks for total death more than 0
			if (value[1] > 0) {
				stateData.push([upper(key), value[1], value[2]]);
			}
		}

		let message = 'Kes Mengikut Negeri:\n';

		// let ans = arr.sort(function(a, b) {
		// 	return b[1] - a[1];
		// });
		for (const [k, v, a] of stateData) {
			message += `${k}: ${v}\n`;
		}

		let newTweet = `@${user} ${message} #covid19`;
		twit.sendTweet(newTweet, tweetId);

		console.log(str);
	});
}

// Convert military to regular hour
function regularHour(num) {
	return num > 12 ? num - 12 : num;
}

// Uppercase first letter
function upper(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
	getStreamEvents: getStreamEvents,
	getTotalStats: getTotalStats,
	getYesterdayData: getYesterdayData,
};
