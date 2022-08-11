require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const embedDescription = (roles) => {
    const start = `Here are the roles present in the server. You may choose all the ones you wish to assign tasks to\
    \n\n\
    **Roles**\n\n\
    \
    `
    let end = ''
    roles.forEach(role => {end += `${role}\n`})
    let final = start + end
    return final
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message)=>{
    const roles = message.guild.roles.cache.map(role => role.name)
    const desc = embedDescription(roles)
    if(message.mentions.has(client.user.id)){
        message.reply({ embeds: [
            new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rollertoaster')
            .setDescription(desc)
        ] })
    }
})

client.login(process.env.DISCORD_TOKEN);