const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const _sdata = require('../../assets/_data/static_data.json');
const Currency = require('../../structures/currency/Currency');
const Inventory = require('../../structures/currency/Inventory');
const ItemGroup = require('../../structures/currency/ItemGroup');
const Store = require('../../structures/currency/Store');

module.exports = class BuyItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'buy-item',
            aliases: ['item-buy', 'buy'],
            group: 'item',
            memberName: 'buy',
            description: '`AL: low` Buys an item at the store.',
            details: 'Let\'s you exchange your hard earned donuts for other goods.',
            throttling: {
                usages: 2,
                duration: 3
            },

            args: [
                {
                    key: 'item',
                    prompt: 'what do you want to buy?\n',
                    type: 'string',
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'amount',
                    label: 'amount to buy',
                    prompt: 'how many do you want to buy?\n',
                    type: 'integer',
                    default: 1,
                    min: 1
                }
            ]
        });
    }

    hasPermission(msg) {
        return this.client.provider.get(msg.author.id, 'userLevel') >= _sdata.aLevel.low;
    }

    async run(msg, { amount, item }) {
        const itemName = item.replace(/(\b\w)/gi, lc => lc.toUpperCase());
        const storeItem = Store.getItem(item);
        if (!storeItem) {
            return msg.embed({
                color: _sdata.colors.blue,
                description: stripIndents`
				${msg.member}, that item does not exist.

				You can use ${this.client.registry.commands.get('store').usage()} to get a list of the available items.`
            });
        }

        const balance = await Currency.getBalance(msg.author.id);
        const plural = amount > 1 || amount === 0;
        if (balance < storeItem.price * amount) {
            return msg.embed({
                color: _sdata.colors.red,
                description: stripIndents`
				${msg.member}, you don't have enough donuts to buy ${amount} ${itemName}${plural
    ? 's'
    : ''}. ${amount} ${itemName}${plural
    ? 's'
    : ''} cost${plural
    ? ''
    : 's'} ${amount * storeItem.price} 🍩s.
				Your current account balance is ${balance} 🍩s.`
            });
        }

        const inventory = await Inventory.fetchInventory(msg.author.id);
        inventory.addItems(new ItemGroup(storeItem, amount));
        Currency.removeBalance(msg.author.id, amount * storeItem.price);
        inventory.save();
        return msg.embed({
            color: _sdata.colors.green,
            description: stripIndents`
			${msg.member}, you have successfully purchased ${amount} ${itemName}${plural
    ? 's'
    : ''} for ${amount * storeItem.price} 🍩s.`
        });
    }
};
