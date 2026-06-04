const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');

// Recursively load all command files
function loadCommands(dir) {
    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadCommands(filePath);
            } else if (file.endsWith('.js')) {
                try {
                    const command = require(filePath);
                    if ('data' in command && 'execute' in command) {
                        commands.push(command.data.toJSON());
                    }
                } catch (err) {
                    console.error(`Failed to load ${file}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error(`Cannot read directory ${dir}:`, err.message);
    }
}

loadCommands(commandsPath);

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
    process.exit(1);
}

const rest = new REST({ version: '10', timeout: 15000 }).setToken(token);

(async () => {
    try {
        if (!commands.length) {
            console.log('No commands found.');
            process.exit(0);
        }

        console.log(`Deploying ${commands.length} commands...`);

        let data;
        if (guildId) {
            data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log(`Guild deploy complete: ${data.length} commands.`);
        } else {
            data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log(`Global deploy complete: ${data.length} commands.`);
        }
    } catch (err) {
        console.error('Deploy failed:', err.message);
        process.exit(1);
    }
})();
