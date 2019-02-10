const { Command } = require('discord.js-commando');
const Utils = require('../../core/utils.js');
const Discord = require('discord.js');
const suits = ['♣', '♥', '♦', '♠'];
const faces = ['Jack', 'Queen', 'King'];

module.exports = class BlackjackCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'blackjack',
			group: 'casino',
			memberName: 'blackjack',
			description: 'Play a game of blackjack.',
			args: [
			{
				key: 'amount',
				prompt: 'How many chips do you want to bet?',
				type: 'integer',
				validate: amount => {
					if(amount >= 10) return true;
					return 'Minimum bet is 10 chips!';
				}
			}]
		});

		this.decks = new Map();
	}

	async run(msg, {amount}) {
		const embedMsg = new Discord.RichEmbed()
			.setAuthor("House of Dragons Casino", "https://i.imgur.com/CyAb3mV.png")
			.setColor("#FDF018")
			.setDescription("<@"+msg.author.id+">")
		if (await Utils.getLocType(msg.author) == 'casino') {
			if (this.decks.has(msg.channel.id)) return msg.reply('Only one game of blackjack may be occurring per channel.');
			if(await Utils.hasChips(msg.author.id, amount)) {
				try {
					await Utils.takeChips(msg.author.id, amount);
					this.decks.set(msg.channel.id, this.generateDeck(1));
					const dealerHand = [];
					this.drawCard(msg.channel, dealerHand);
					this.drawCard(msg.channel, dealerHand);
					const playerHand = [];
					this.drawCard(msg.channel, playerHand);
					this.drawCard(msg.channel, playerHand);
					const dealerInitialTotal = this.calculate(dealerHand);
					const playerInitialTotal = this.calculate(playerHand);
					if (dealerInitialTotal === 21 && playerInitialTotal === 21) {
						this.decks.delete(msg.channel.id);
						await Utils.giveChips(msg.author.id, amount);
						return msg.embed(Utils.makeRPGEmbed(`Draw`, `You both hit blackjack straight away, your bet is returned!`));
					} else if (dealerInitialTotal === 21) {
						this.decks.delete(msg.channel.id);
						return msg.embed(Utils.makeRPGEmbed(`You Lost!`, `Dealer got a natural blackjack, you lose **{$amount}** chips!`));
					} else if (playerInitialTotal === 21) {
						this.decks.delete(msg.channel.id);
						await Utils.giveChips(msg.author.id, amount*2);
						return msg.embed(Utils.makeRPGEmbed(`You Won!`, `You got a natural blackjack, winning **{$amount*2}** chips!`));
					}
					let playerTurn = true;
					let win = false;
					let reason;
					while (!win) {
						if (playerTurn) {
							await msg.embed(Utils.makeBJEmbed(
								`Dealer's Visible Card`,
								`${dealerHand[0].display}`,
								`Your Hand (${this.calculate(playerHand)})`,
								`${playerHand.map(card => card.display).join('\n')}`,
								`Options`,
								`Do you **hit**? (**yes** or **no**)`));
								
							const hit = await Utils.verify(msg.channel, msg.author);
							if (hit) {
								const card = this.drawCard(msg.channel, playerHand);
								const total = this.calculate(playerHand);
								if (total > 21) {
									reason = `You drew ${card.display}, total of ${total}! Bust`;
									break;
								} else if (total === 21) {
									reason = `You drew ${card.display} and hit 21`;
									win = true;
								}
							} else {
								const dealerTotal = this.calculate(dealerHand);
								await msg.embed(Utils.makeBJEmbed(
									`Dealer's Hand (${this.calculate(dealerHand)})`,
									`${dealerHand[0].display}\n${dealerHand[1].display}`,
									`Your Hand (${this.calculate(playerHand)})`,
									`${playerHand.map(card => card.display).join('\n')}`));
								playerTurn = false;
							}
						} else {
							const inital = this.calculate(dealerHand);
							let card;
							if (inital < 17) card = this.drawCard(msg.channel, dealerHand);
							const total = this.calculate(dealerHand);
							if (total > 21) {
								reason = `Dealer drew ${card.display}, total of ${total}! Dealer bust`;
								win = true;
							} else if (total >= 17) {
								const playerTotal = this.calculate(playerHand);
								if (total === playerTotal) {
									reason = `${card ? `Dealer drew ${card.display}, making it ` : ''}${playerTotal}-${total}`;
									break;
								} else if (total > playerTotal) {
									reason = `${card ? `Dealer drew ${card.display}, making it ` : ''}${playerTotal}-**${total}**`;
									break;
								} else {
									reason = `${card ? `Dealer drew ${card.display}, making it ` : ''}**${playerTotal}**-${total}`;
									win = true;
								}
							} else {
								await msg.embed(Utils.makeBJEmbed(`Dealer Action`, `Dealer drew ${card.display} - (Dealer's total is **${total})**`));
							}
						}
					}
					this.decks.delete(msg.channel.id);
					if (win) {
						await Utils.giveChips(msg.author.id, amount*2);
						return msg.embed(Utils.makeBJEmbed(`You Won!`, `${reason}! You won **${amount*2}** chips!`));
					}
					return msg.embed(Utils.makeBJEmbed(`You Lost!`, `${reason}! You lost **${amount}** chips!`));
				} catch (err) {
					this.decks.delete(msg.channel.id);
					throw err;
				}
			} else {
				embedMsg.addField("Can't Bet", "You don't have enough chips to bet that much!");
				return msg.embed(embedMsg);
			}
		} else {
			embedMsg.addField("Not In Casino", "You need to be in a casino to use this, find one on the `!map`!");
			return msg.embed(embedMsg);
		}
	}

	drawCard(channel, hand) {
		const deck = this.decks.get(channel.id);
		const card = deck[0];
		deck.shift();
		hand.push(card);
		return card;
	}

	generateDeck(deckCount) {
		const deck = [];
		for (let i = 0; i < deckCount; i++) {
			for (const suit of suits) {
				deck.push({
					value: 11,
					display: `${suit} Ace`
				});
				for (let j = 2; j <= 10; j++) {
					deck.push({
						value: j,
						display: `${suit} ${j}`
					});
				}
				for (const face of faces) {
					deck.push({
						value: 10,
						display: `${suit} ${face}`
					});
				}
			}
		}
		return Utils.shuffle(deck);
	}

	calculate(hand) {
		return hand.sort((a, b) => a.value - b.value).reduce((a, b) => {
			let { value } = b;
			if (value === 11 && a + value > 21) value = 1;
			return a + value;
		}, 0);
	}
};
