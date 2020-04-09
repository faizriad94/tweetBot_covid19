const bot = require('./bot');
const twit = require('./twit');

const botName = 'covid_bot_my';
const once_a_day = 1000 * 60 * 60 * 24;

// Twitter stream events for bot to reply
twit.stream(`@${botName}`, bot.getStreamEvents);

// Tweet daily stats
bot.getTotalStats();
setInterval(() => {
	let hour = new Date().getHours();
	if (hour > 18 || hour < 19) {
		bot.getTotalStats();
	}
}, once_a_day);
