// this file actually gets ran first when the bot is ran and initializes everything

import { Client } from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";

// gives permissions of stuff the bot can do (for some fucking reason discord calls servers guilds) 
const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"],
});

// registers all the commands in the server (deploy-commands.ts)
client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
    console.log(`Commands deployed to new guild: ${guild.name}`);
})

// sets logic to runs commands when interaction created (command sent in chat)
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  });
  
client.login(config.DISCORD_TOKEN);
  
// epic console logging
client.once("ready", async () => {
    console.log(`\nLogged in as ${client.user?.tag}!\n`);

    // Deploy commands to all guilds the bot is currently in. 
    // This should be changed to only run on bot update, but for a bot that's not on a lot of servers it really doesn't matter.
    const guilds = client.guilds.cache.map(guild => guild.id);
    for (const guildId of guilds) {
        await deployCommands({ guildId });
    }

    console.log("\nCommands deployed to all guilds.");
});