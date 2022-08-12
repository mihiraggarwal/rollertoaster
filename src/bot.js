require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

taskBtnState = false
tasks = []
count = 0
taskMsg = ''

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels
});

client.on('messageCreate', (message)=>{
    if(taskBtnState){
        const taskRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("confirmTask")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Primary)
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("resetTask")
                .setLabel("Reset")
                .setStyle(ButtonStyle.Secondary)
        )

        tasks.push({
            index : count + 1,
            content : message.content,
        })

        count++
        
        message.channel.messages.fetch(taskMsg)
        .then(msg => {
            msg.edit({
                embeds : [
                new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks.'),
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription(`**Your Tasks**\n${tasks.map(task => `${task.index}. ${task.content}`).join('\n')}`),
                ],
                components : [taskRow],
            })
            
        })
    }else if(message.content == 'hlo'){
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("taskOn")
                .setLabel("Add Tasks")
                .setStyle(ButtonStyle.Primary)
        )
        message.channel.send({
            components : [row]
        })
    }
})

client.on("interactionCreate", (interaction) => {
    if (!interaction.isButton()) return false;

    if(interaction.customId == 'taskOn'){
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Rollertoaster')
                .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks.'),
                new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Rollertoaster')
                .setDescription(`**Your Tasks**`)
            ]
        }).then(() => {
            interaction.fetchReply()
            .then(reply => {
                taskMsg = reply.id
                taskBtnState = true
            })
        })
    }else if(interaction.customId == 'confirmTask'){
        taskBtnState = false
        interaction.channel.messages.fetch(taskMsg)
        .then(msg => {
            msg.edit({
                embeds : [
                new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks or Reset to reset the task list.'),
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription(`**Your Tasks**\n${tasks.map(task => `${task.index}. ${task.content}`).join('\n')}`),
                ],
                components : [],
            })
            .then(() => {
                tasks = []
                count = 0
                interaction.reply({
                    content: 'Tasks saved!',
                    ephemeral: true
                })
            })
            
        })
    }else if(interaction.customId == 'resetTask'){
        count = 0
        interaction.channel.messages.fetch(taskMsg)
        .then(msg => {
            msg.edit({
                embeds : [
                new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks.'),
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription(`**Your Tasks**\n${tasks.map(task => `${task.index}. ${task.content}`).join('\n')}`),
                ]
            })
            
        })
        interaction.channel.bulkDelete(tasks.length)
        tasks = []
        interaction.reply({
            content: 'Tasks reset!',
            ephemeral: true
        })
    }
})

client.login(process.env.DISCORD_TOKEN);