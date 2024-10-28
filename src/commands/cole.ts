import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("cole")
  .setDescription("Cole is a very wholesome man");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("My name is Cole, I love giving back to the community and fostering growth!");
}


