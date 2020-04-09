const bot = require('./bot');
const twit = require('./twit');

const botName = 'covid_bot_my';

// Twitter stream events for bot to reply
twit.stream(`@${botName}`, bot.getStreamEvents);

// Tweet daily stats
setInterval(() => {
	let hour = new Date().getHours();
	if (hour > 18 || hour < 19) {
		bot.getTotalStats();
	}
}, 1000 * 60 * 60);
