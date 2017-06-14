const { Command } = require('discord.js-commando');
const moment = require('moment');
require('moment-duration-format');
const { stripIndents } = require('common-tags');
const _sdata = require('../../assets/_data/static_data.json');
const { version } = require('../../package');

module.exports = class StatsCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'stats',
			aliases: ['statistics'],
			group: 'util',
			memberName: 'stats',
			description: '`AL: low` Displays statistics about the bot.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	hasPermission (msg) {
		return this.client.provider.get(msg.author.id, 'userLevel') >= _sdata.aLevel.low;
	}

	run (msg) {
		return msg.embed({
			color: _sdata.colors.blue,
			description: '**Statistics**',
			fields: [
				{
					name: '❯ Uptime',
					value: moment.duration(this.client.uptime)
						.format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'),
					inline: true
				},
				{
					name: '❯ Memory usage',
					value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
					inline: true
				},
				{
					name: '❯ General Stats',
					value: stripIndents`
					• Guilds: ${this.client.guilds.size}
					• Channels: ${this.client.channels.size}
					• Users: ${this.client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b)}
					`,
					inline: true
				},
				{
					name: '❯ Version',
					value: `v${version}`,
					inline: true
				}
			],
			thumbnail: { url: this.client.user.displayAvatarURL }
		});
	}
};
