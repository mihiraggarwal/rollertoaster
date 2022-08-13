require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const Servers = require("../models/Servers");
const Task = require("../models/Task");
const User = require("../models/User");
const table = require("table");

mongoose.connect(process.env.DB_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

const emojis = ['🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜','🔶','🔷']
let assign = {}
let assign2 = {}
let selection = []
let reactmsg = ''
let taskBtnState = false
let pointState = false
let pointInCounter = 0
let tasks = []
let count = 0
let taskMsg = ''
let assignIndex = 0
let verifyState = false
let finalAssignment = {}

const embedRolesDescription = (roles) => {
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

const embedTaskAssignment = () => {
    assign2 = {}
    const start = `Here are the tasks you have created. You may choose all the ones you wish to assign to **${selection[assignIndex]}**\n\n\
    **Tasks**\n\n\
    \
    `
    let end = ''
    for (i = 0; i < tasks.length; i++) {
        end += `${emojis[i]} : ${tasks[i].content}\n`
        assign2[emojis[i]] = tasks[i].content
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

client.on("ready", (resp) => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    
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
    }

    else if (pointState) {
        newTask = new Task({
            name : tasks[pointInCounter].content,
            points : message.content,
        })

        newTask.save()
        .then()
        .catch(err => console.log(err))
        
        pointInCounter++
        pointState = false

        if (pointInCounter < tasks.length) {
            message.channel.send({content: `Please enter the number of points for task: ${tasks[pointInCounter].content}`})
            .then(result => pointState = true)
        } 

        else {
            pointState = false
            const desc = embedTaskAssignment()
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription(desc)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("assignTask")
                            .setLabel("Assign")
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            }).then(msg => {
                reactmsg = msg
                emojis.slice(0, tasks.length).forEach(emoji => msg.react(emoji))
            })
        }
    }
    
    else if(verifyState){
        const members = message.mentions.members.map(member => member.user.username)
        Servers.findOne({serverId : message.guild.id})
        .then(doc => {
            for(i = 0; i < members.length; i++) {
               if(doc.memberInfo[members[i]] == undefined) {
                   doc.memberInfo[members[i]] = 0
               }else{
                     doc.memberInfo[members[i]]++
               }
            }

            doc.markModified('memberInfo')
            doc.save()
            .then(()=>{
                message.reply('Leaderboard Updated')
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
        
        verifyState = false
    }
    
    else if (message.mentions.has(client.user.id) && message.content.includes("user")) {
        let members = message.mentions.members.map(member => `${member.user.username}#${member.user.discriminator}`)
        let avatarUrls = message.mentions.members.map(member => `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpeg`)
        members = members.slice(1,)
        avatarUrls = avatarUrls.slice(1,)
        members.forEach(member => {
            User.findOne({username: member})
            .then(doc => {
                try {
                    let ctask = ''
                    Task.findOne({taskId: doc.currentTask})
                    .then(tdoc=>{
                        try {
                            ctask = tdoc.name
                        } catch (e) {
                            ctask = "None"
                        }
                    })
                    .then(_ => {
                        message.channel.send({
                            embeds: [new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(doc.username)
                            .addFields(
                                {name: "Points", value: `${doc.points}`},
                                {name: "Current task", value: `${ctask}`},
                                {name: "Completed tasks", value: `${doc.tasksCompleted}`}
                            )
                            .setThumbnail(`${avatarUrls[members.indexOf(member)]}`)
                            ] })
                })
                    } catch (e) {
                        message.channel.send("User not found")
                    }
                }) 
        })
    }
    
    else if (message.mentions.has(client.user.id) && message.content.includes("authenticate")) {
        Servers.findOne({serverId : message.guild.id})
        .then(doc => {
            if(doc){
                message.channel.send('Your server is already authenticated.')
            }else{
                message.guild.members.fetch({force : true})
                .then(memb => {
                    const members = memb.map(member => member.user.username)
                    const memberInfo = {}
                    for(i = 0; i < members.length; i++) {
                        memberInfo[members[i]] = 0
                    }
                    newServer = new Servers({
                        serverId : message.guild.id,
                        serverName : message.guild.name,
                        memberInfo : memberInfo,
                    })
            
                    newServer.save()
                    .then(()=>{
                        message.reply('You have been authenticated :thumbsup:')
                    })
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
    }else if(message.mentions.has(client.user.id) && message.content.includes("leaderboard")){
        Servers.findOne({serverId : message.guild.id})
        .then(doc => {
            let data = [['Users', 'Points']]
            for(member in doc.memberInfo){
                data.push([member, doc.memberInfo[member].toString()])
            }

            config = {
                border: table.getBorderCharacters("ramac")
            }
            
            const newTable = "```\n" + table.table(data, config) + "```"

            message.reply({
                content: newTable,
            })
        })
        .catch(err => console.log(err))
    }else if(message.mentions.has(client.user.id) && message.content.includes("verify")){
        message.channel.send({
            content: "Please mention the members you wish to verify.",
        }).then(() => {
            verifyState = true
        })
    }
    else if(message.mentions.has(client.user.id)) {
        const roles = message.guild.roles.cache.map(role => role.name)
        const desc = embedRolesDescription(roles)
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
        assign = {}
        msg.edit({ embeds: [
            new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rollertoaster')
            .setDescription('Roles saved')
        ] }).then(msg.reactions.removeAll())

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
    }
    
    else if(interaction.customId == 'confirmTask') {
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
                interaction.reply({
                    content: `Please enter the number of points for task: ${tasks[0].content}`
                }).then(msg => pointState = true)                
            })
        })
    }
    
    else if(interaction.customId == 'resetTask') {
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
    
    else if(interaction.customId == 'assignTask') {
        const msg = await reactmsg.fetch()
        const reacts = await msg.reactions.cache
        finalAssignment[selection[assignIndex]] = []
        reacts.forEach(emoji => {
            if (emoji.count > 1) {
                finalAssignment[selection[assignIndex]].push(assign2[emoji._emoji.name])
            }
        })
        assignIndex++
        msg.edit({
            components: []
        })

        if (assignIndex < selection.length) {
            const desc = embedTaskAssignment()
            interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription(desc)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("assignTask")
                            .setLabel("Assign")
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            }).then(message => {
                reactmsg = message
                emojis.slice(0, tasks.length).forEach(emoji => message.react(emoji))
            })
        }
        else {
            const channel = interaction.client.channels.cache.find(channel => channel.name === "announcements")
            interaction.channel.send({
                content: `Tasks have been assigned to all roles. Press the button below to announce all tasks in <#${channel.id}>.`,
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("announceTask")
                            .setLabel("Announce")
                            .setStyle(ButtonStyle.Primary)
                    )
                ]
            })
        }
    }

    else if (interaction.customId == 'announceTask') {
        const channel = interaction.client.channels.cache.find(channel => channel.name === "announcements")
        const roles = interaction.guild.roles.cache
        for (const [key, value] of Object.entries(finalAssignment)) {
            const croll = roles.filter(roll => roll.name == key)
            const id = croll.map(roll => roll.id)
            value.forEach(task => {
                channel.send({
                    content: `<@&${id}> ${task}`,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("claimTask")
                                .setLabel("Claim")
                                .setStyle(ButtonStyle.Primary)
                        )
                    ]
                }).then(message => reactmsg = message)
            })
        }
        interaction.reply({
            content: 'Tasks announced!',
            ephemeral: true
        })
    }

    else if (interaction.customId == 'claimTask') {
        const msg = await interaction.message.fetch()
        msg.edit({
            components : [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("claimTask")
                        .setLabel("Claimed")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                )
            ]
        })
        interaction.reply({
            content: 'Task claimed!',
            ephemeral: true
        })
    }
})

client.login(process.env.DISCORD_TOKEN);