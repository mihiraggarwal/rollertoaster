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

const emojis = ['🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜','🔶','🔷']
let assign = {}
let selection = []
let reactmsg = ''

const embedDescription = (roles) => {
    const start = `Here are the roles present in the server. You may choose all the ones you wish to assign tasks to\
    \n\n\
    **Roles**\n\n\
    \
    `
    let end = ''
    for (i = 0; i < roles.length; i++) {
        end += `${emojis[i]} : ${roles[i]}\n`
        assign[emojis[i]] = roles[i]
    }
    let final = start + end
    return final
}

const finReactBtn = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('taskOn')
        .setLabel('Add Tasks')
        .setStyle(ButtonStyle.Primary)
    )

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message)=>{
    const roles = message.guild.roles.cache.map(role => role.name)
    const desc = embedDescription(roles)
    if(message.mentions.has(client.user.id)){
        message.channel.send({ embeds: [
            new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rollertoaster')
            .setDescription(desc)
        ] }).then(eMessage => {
                emojis.slice(0, roles.length).forEach(emoji => eMessage.react(emoji))
                reactmsg = eMessage
        })
        message.channel.send({
            content: "Once you have selected the roles, you may begin adding the tasks.",
            components: [finReactBtn]
        })
    }
})

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "taskOn") {
        const msg = await reactmsg.fetch()
        const reacts = await msg.reactions.cache
        reacts.forEach(emoji => {
            if (emoji.count > 1) {
                selection.push(assign[emoji._emoji.name])
            }
        })
        msg.edit({ embeds: [
            new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rollertoaster')
            .setDescription('Roles saved')
        ] }).then(msg.reactions.removeAll())
    }
})

client.login(process.env.DISCORD_TOKEN);