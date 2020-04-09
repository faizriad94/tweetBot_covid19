const Twit = require('twit');
const config = require('./config'); //api keys

const T = new Twit(config);

module.exports = {
	/**
	 * Send tweet
	 * @param { string } text - required
	 * @param { string } id_str - optional - used to reply to tweets
	 */
	sendTweet: (text, id_str) => {
		T.post(
			'statuses/update',
			{ status: text, in_reply_to_status_id: id_str },
			function (err, data, response) {
				if (err) {
					console.log(err);
				}
			}
		);
	},

	/**
	 * Search for tweets containing query
	 * @param { string } query
	 * @param { number } limit - amount of tweet to return
	 */
	searchTweet: (query, limit) => {
		const params = {
			q: 'query',
			count: limit,
		};

		T.get('search/tweets', params, function (err, data, response) {
			if (err) {
				console.log(err);
			}
			console.log(data.statuses[0]);
		});
	},

	/**
	 * Retweet
	 * @param { string} - id of the tweet
	 */
	retweet: (id_str) => {
		T.post('statuses/retweet/:id', { id: id_str }, function (
			err,
			data,
			response
		) {
			if (err) {
				console.log(err);
			}
			console.log('retweeted');
		});
	},

	/**
	 * Stream
	 * @param { string} name - search for keyword
	 * @param { function } cb - callback function
	 */
	stream: (name, cb) => {
		T.stream('statuses/filter', { track: name }).on('tweet', cb);
	},
};
