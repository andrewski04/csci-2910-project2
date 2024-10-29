import { CommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("blackjack")
  .setDescription("Play a singleplayer game of blackjack against the dealer.");

export async function execute(interaction: CommandInteraction) {
  // Basic card deck and game setup
  const deck = createDeck();
  const playerHand = [drawCard(deck), drawCard(deck)];
  const dealerHand = [drawCard(deck), drawCard(deck)];
  let playerScore = calculateScore(playerHand);
  let dealerScore = calculateScore(dealerHand);

  // Display initial hands
  await interaction.reply(
    `Your hand: ${displayHand(playerHand)} (Score: ${playerScore})\n` +
    `Dealer's visible card: ${displayHand([dealerHand[0]])}`
  );

  // Check if channel supports message collectors
  if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
    return interaction.followUp("This command can only be used in text channels.");
  }
  const collector = interaction.channel?.createMessageCollector({
    filter: (m) => m.author.id === interaction.user.id,
    time: 60000,
  });
  
  collector?.on("collect", async (m) => {
    console.log(`Collected message: ${m.content}`);
    
    const choice = m.content.trim().toLowerCase();
    if (choice === "hit") {
      playerHand.push(drawCard(deck));
      playerScore = calculateScore(playerHand);
      await interaction.followUp(`You draw a card: ${displayHand(playerHand)} (Score: ${playerScore})`);
  
      if (playerScore > 21) {
        await interaction.followUp("Bust! You lose.");
        collector.stop();
      }
    } else if (choice === "stand") {
      // Dealer's turn to draw
      while (dealerScore < 17) {
        dealerHand.push(drawCard(deck));
        dealerScore = calculateScore(dealerHand);
      }
  
      // Reveal final hands and determine the winner
      await interaction.followUp(
        `Dealer's hand: ${displayHand(dealerHand)} (Score: ${dealerScore})\n` +
        `${determineWinner(playerScore, dealerScore)}`
      );
      collector.stop();
    } else {
      await interaction.followUp("Invalid choice! Type 'hit' or 'stand'.");
    }
  });
  
  collector?.on("end", async (collected) => {
    if (collected.size === 0) {
      await interaction.followUp("No response received. Game ended.");
    } else {
      await interaction.followUp("Game over! Thanks for playing.");
    }
  });
}

// Helper functions

function createDeck() {
  const suits = ["♠️", "♥️", "♦️", "♣️"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5); // Shuffle deck
}

function drawCard(deck: any[]) {
  return deck.pop();
}

function calculateScore(hand: any[]) {
  let score = 0;
  let aceCount = 0;

  for (const card of hand) {
    if (["J", "Q", "K"].includes(card.value)) {
      score += 10;
    } else if (card.value === "A") {
      score += 11;
      aceCount++;
    } else {
      score += parseInt(card.value);
    }
  }

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

function displayHand(hand: any[]) {
  return hand.map((card) => `${card.value}${card.suit}`).join(" ");
}

function determineWinner(playerScore: number, dealerScore: number) {
  if (dealerScore > 21 || playerScore > dealerScore) return "You win!";
  if (playerScore < dealerScore) return "Dealer wins!";
  return "It's a tie!";
}
