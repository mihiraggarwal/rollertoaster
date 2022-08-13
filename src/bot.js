require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionsBitField,
} = require("discord.js");
const mongoose = require("mongoose");
const Servers = require("../models/Servers");
const Task = require("../models/Task");
const User = require("../models/User");
const table = require("table");
const fs = require("fs");


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
let userState = false
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
    let end = 'Once you have selected the roles, you may begin adding the tasks.'

    let mid = ''
    for (i = 0; i < roles.length; i++) {
        mid += `${emojis[i]} : ${roles[i]}\n`
        assign[emojis[i]] = roles[i]
    }
    let final = start + mid + end
    return final
}

const embedTaskAssignment = () => {
    const start = `Here are the tasks you have created. You may choose all the ones you wish to assign to **${selection[assignIndex]}**\n\n\
    **Tasks**\n\n\
    \
    `
    let end = ''
    for (i = 0; i < tasks.length; i++) {
        end += `${emojis[i]} : ${tasks[i].content}\n`
        assign2[emojis[i]] = tasks[i]
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
    if(message.mentions.has(client.user.id) && message.mentions.everyone == false){
        if(message.member.permissions.has(PermissionsBitField.Flags.Administrator, true)){
            assign = {}
            assign2 = {}
            selection = []
            reactmsg = ''
            taskBtnState = false
            pointState = false
            pointInCounter = 0
            tasks = []
            count = 0
            taskMsg = ''
            assignIndex = 0
            verifyState = false
            finalAssignment = {}
            message.channel.send({
                embeds : [
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription(`Hello, I am Rollertoaster. I am here to help you manage your tasks.\n\n\
                    **Please select one of the options below**`),
                ],
                components : [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("authMenu")
                                .setLabel("Authenticate")
                                .setStyle(ButtonStyle.Primary)
                        ).addComponents(
                            new ButtonBuilder()
                                .setCustomId("assignMenu")
                                .setLabel("Assign")
                                .setStyle(ButtonStyle.Primary)
                        ).addComponents(
                            new ButtonBuilder()
                                .setCustomId("verifyMenu")
                                .setLabel("Verify")
                                .setStyle(ButtonStyle.Primary)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("statusMenu")
                                .setLabel("Status")
                                .setStyle(ButtonStyle.Primary)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("leaderboardMenu")
                                .setLabel("Leaderboard")
                                .setStyle(ButtonStyle.Primary)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("userMenu")
                                .setLabel("User")
                                .setStyle(ButtonStyle.Primary)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("exitMenu")
                                .setLabel("Exit")
                                .setStyle(ButtonStyle.Danger)
                        )        
                ]
            })
        }else{
            message.reply('You do not have permission to use this command.')
        }
    }
    
    else if(taskBtnState){
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
                    .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks or Reset to reset the task list.'),
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
        if (!Number.isNaN(parseInt(message.content))) {
            tasks[pointInCounter].points = parseInt(message.content)
            pointInCounter++
            pointState = false

            if (pointInCounter < tasks.length) {
                message.channel.send({content: `Please enter the number of points for task: ${tasks[pointInCounter].content}`})
                .then(() => pointState = true)
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
        } else {
            pointState = false
            message.channel.send('Points must be numerical only. Please enter the correct value.').then(_ => 
                pointState = true
            )
        }
    }
    
    else if(verifyState){
        const members = message.mentions.members.map(member => member.user.username+'#'+member.user.discriminator)
        let verifyPoints = []
        members.forEach(member => {
            Task.findOne({currentUser: member, status: 'claimed', serverId: message.guild.id})
            .then(task => {
                verifyPoints.push(task.points)
                task.status = 'completed'
                task.save()

                if (verifyPoints.length == members.length) {
                    Servers.findOne({serverId : message.guild.id})
                    .then(doc => {
                        for(i = 0; i < members.length; i++) {
                            doc.memberInfo[members[i]].points += verifyPoints[i]
                            doc.memberInfo[members[i]].tasksCompleted += 1
                        }

                        doc.markModified('memberInfo')
                        doc.save()
                        .then(()=>{
                            message.channel.send({
                                content: 'Verified!'
                            })

                            members.forEach(member => {
                                User.findOne({username : member, serverId: message.guild.id})
                                .then(doc => {
                                    doc.points += verifyPoints[members.indexOf(member)]
                                    doc.tasksCompleted += 1
                                    doc.currentTask = ''
                                    doc.save()
                                })
                            })
                        })
                        .catch(err => console.log(err))
                    })
                    .catch(err => console.log(err))
                    
                    verifyState = false
                }


            })
            .catch(err => console.log(err))
        })        
        verifyState = false
    }
    
    else if (userState) {
        let members = message.mentions.members.map(member => `${member.user.username}#${member.user.discriminator}`)
        let avatarUrls = message.mentions.members.map(member => `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpeg`)
        members.forEach(member => {
            User.findOne({username: member, serverId: message.guild.id})
            .then(doc => {
                try {
                    let ctask = ''
                    Task.findOne({taskId: doc.currentTask, serverId: message.guild.id})
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
                        userState = false
                })
                    } catch (e) {
                        message.channel.send("User not found")
                    }
                }) 
        })
    }
})



client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if(interaction.customId == 'authMenu'){
        Servers.findOne({serverId : interaction.guild.id})
        .then(doc => {
            if(doc){
                interaction.reply('Your server is already authenticated.')
            }else{
                newServer = new Servers({
                    serverId : interaction.guild.id,
                    serverName : interaction.guild.name,
                })
        
                newServer.save()
                .then(()=>{
                    interaction.reply('You have been authenticated :thumbsup:')
                })
                .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
    }

    else if(interaction.customId == 'assignMenu'){
        let roles = interaction.guild.roles.cache.map(role => role.name)
        roles = roles.map(role => {
            if (role.startsWith('@')){
                return role.substring(1, role.length)
            } 
            return role
        })
        const desc = embedRolesDescription(roles)
        interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Rollertoaster')
                .setDescription(desc)
            ],
            components: [finReactBtn],
        }).then(() => {
                let replyMsg = interaction.channel.lastMessage
                emojis.slice(0, roles.length).forEach(emoji => replyMsg.react(emoji))
                reactmsg = replyMsg
        })
    }

    else if(interaction.customId == 'verifyMenu'){
        interaction.reply({
            content: "Please mention the members you wish to verify.",
        }).then(() => {
            verifyState = true
        })
    }

    else if(interaction.customId == 'leaderboardMenu'){
        interaction.deferReply().then(_ => {
            Servers.findOne({serverId : interaction.guild.id})
            .then(doc => {
                let data = []
                for(member in doc.memberInfo){
                    data.push([member, doc.memberInfo[member].points.toString(), doc.memberInfo[member].tasksCompleted.toString()])
                }

                data.sort((a,b) => {
                    return b[1] - a[1]
                })

                data = [['Users', 'Points', 'Tasks Completed'], ...data]

                config = {
                    border: table.getBorderCharacters("ramac")
                }
                
                const newTable = "```\n" + table.table(data, config) + "```"

                if(newTable.length > 2000){
                    try{
                        fs.writeFileSync('./src/leaderboard.txt', table.table(data, config))
                        interaction.editReply({
                            files : [{
                                attachment : `${__dirname}/leaderboard.txt`,
                                name: 'leaderboard.txt',
                                description: 'Leaderboard',
                            }]
                        }).then(() => {
                            try {
                                fs.unlinkSync('./src/leaderboard.txt')
                            }catch (error) {
                                console.log(error)
                            }
                        })
                    }catch(err){
                        console.log(error)
                        interaction.editReply(`Couldn't get leaderboard. Please try again.`)
                    }
                }else{
                    interaction.editReply({
                        content: newTable,
                    })
                }

                interaction.editReply({
                    content: newTable,
                })
            })
            .catch(err => console.log(err))
        })
    }

    else if(interaction.customId == 'statusMenu'){
        interaction.deferReply().then(_ => {
            Task.find({serverId : interaction.guild.id})
            .then(tasks => {
                let data = [['Task', 'Points', 'Status', 'User']]
                tasks.forEach(task => {
                    let taskStatus = ''
                    let taskUser = ''
                    if(task.status == 'unclaimed'){
                        taskStatus = 'Not Started'
                        taskUser = 'None'
                    }else if(task.status == 'claimed'){
                        taskStatus = 'In Progress'
                        taskUser = task.currentUser
                    }else if(task.status == 'completed'){
                        taskStatus = 'Completed'
                        taskUser = task.currentUser
                    }

                    data.push([task.name, task.points, taskStatus, taskUser])
                })

                config = {
                    border: table.getBorderCharacters("ramac")
                }
                
                const newTable = "```\n" + table.table(data, config) + "```"

                if(newTable.length > 2000){
                    try{
                        fs.writeFileSync('./src/status.txt', table.table(data, config))
                        interaction.editReply({
                            files : [{
                                attachment : `${__dirname}/status.txt`,
                                name: 'status.txt',
                                description: 'Status of tasks',
                            }]
                        }).then(() => {
                            try {
                                fs.unlinkSync('./src/status.txt')
                            } catch (error) {
                                console.log(error)
                            }
                        })
                    }catch(err){
                        console.log(error)
                        interaction.editReply(`Couldn't get status. Please try again.`)
                    }
                }else{
                    interaction.editReply({
                        content: newTable,
                    })
                }

                
            })
            .catch(err => console.log(err))
        })
    }

    else if (interaction.customId == "userMenu") {
        interaction.reply({
            content: "Please mention the member(s) you wish to know about.",
        }).then(() => {
            userState = true
        })
    }

    else if(interaction.customId == 'exitMenu'){
        taskBtnState = false
        interaction.reply('Thankyou for using Rollertoaster :wink:')
        .then(() => {
            assign = {}
            assign2 = {}
            selection = []
            reactmsg = ''
            pointState = false
            pointInCounter = 0
            tasks = []
            count = 0
            taskMsg = ''
            assignIndex = 0
            verifyState = false
            finalAssignment = {}
        })
    }

    else if (interaction.customId === "taskOn") {
        const msg = await reactmsg.fetch()
        const reacts = await msg.reactions.cache
        let finalDesc = 'Roles saved\n\n'
        let i = 1
        reacts.forEach(emoji => {
            if (emoji.count > 1) {
                selection.push(assign[emoji._emoji.name])
                finalDesc += `${i}. ${assign[emoji._emoji.name]}\n`
                i++
            }
        })
        if (selection.length < 1) {
            interaction.reply({
                content: "You must select atleast 1 role.",
                ephemeral: true
            })
        } else {
            assign = {}
            msg.edit({ 
                embeds: [
                new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Rollertoaster')
                .setDescription(finalDesc)
                ], 
                components: [] 
            }).then(msg.reactions.removeAll())

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rollertoaster')
                    .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks or Reset to reset the task list.'),
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
                    .setDescription('Please write your task and press Enter to save them one-by-one. Press Confirm when you are done saving the tasks or Reset to reset the task list.'),
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
                finalAssignment[selection[assignIndex]].push({
                    taskName: assign2[emoji._emoji.name].content,
                    taskPoints : assign2[emoji._emoji.name].points
                })
            }
        })
        if (finalAssignment[selection[assignIndex]].length < 1) {
            interaction.reply({
                content: "You must select atleast 1 role.",
                ephemeral: true
            })
        } else {
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
    }

    else if (interaction.customId == 'announceTask') {
        const channel = interaction.client.channels.cache.find(channel => channel.name === "announcements")
        const roles = interaction.guild.roles.cache
        for (const [key, value] of Object.entries(finalAssignment)) {
            console.log('key', key)

            ////////////////////////////////
            let sContent = []
            const croll = roles.filter(roll => {
                console.log('roll', roll)
                if (roll.name.startsWith('@')) {
                    console.log('s', roll.name)
                    sContent.push('@everyone')
                    return roll.name.substring(1, roll.length) == key
                } else {
                    console.log('t', roll.name)
                    sContent.push('<@&')
                    return roll.name == key
                }
            })
            const id = croll.map(roll => roll.id)
            value.forEach(task => {
                console.log(sContent)
                let finalContent = ''
                if (sContent[Object.keys(finalAssignment).indexOf(key)].startsWith('@')) {
                    finalContent = `${sContent[Object.keys(finalAssignment).indexOf(key)]} ${task.taskName}\nPoints: ${task.taskPoints}`
                } else {
                    finalContent = `${sContent[Object.keys(finalAssignment).indexOf(key)]}${id}> ${task.taskName}\nPoints: ${task.taskPoints}`
                }
                channel.send({
                    content: finalContent,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("claimTask")
                                .setLabel("Claim")
                                .setStyle(ButtonStyle.Primary)
                        )
                    ]
                }).then(message => {
                    reactmsg = message
                    newTask = new Task({
                        name: task.taskName,
                        points: task.taskPoints,
                        taskId: message.id,
                        status: 'unclaimed',
                        serverName: interaction.guild.name,
                        serverId: interaction.guild.id,
                    })

                    newTask.save()
                    .then()
                    .catch(err => console.log(err))
                })
            })
        }
        interaction.reply({
            content: 'Tasks announced!',
            ephemeral: true
        })
        assign = {}
        assign2 = {}
        selection = []
        reactmsg = ''
        taskBtnState = false
        pointState = false
        pointInCounter = 0
        tasks = []
        count = 0
        taskMsg = ''
        assignIndex = 0
        verifyState = false
        finalAssignment = {}
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
        
        User.findOne({username: `${interaction.user.username}#${interaction.user.discriminator}`, serverId: interaction.guild.id})
        .then(user => {
            if(user){
                user.currentTask = msg.id
                user.save()
            }else{
                const newUser = new User({
                    username: `${interaction.user.username}#${interaction.user.discriminator}`,
                    points: 0,
                    tasksCompleted: 0,
                    currentTask: msg.id,
                    serverName: interaction.guild.name,
                    serverId: interaction.guild.id,
                })
                newUser.save()
            }

            Task.findOne({taskId: msg.id, serverId: interaction.guild.id})
            .then((task)=>{
                task.currentUser = `${interaction.user.username}#${interaction.user.discriminator}`
                task.status = 'claimed'
                task.save()
            })
            .catch(err => console.log(err))

            Servers.findOne({serverId: interaction.guild.id})
            .then(server => {
                if(server.memberInfo != undefined){
                    server.memberInfo[`${interaction.user.username}#${interaction.user.discriminator}`] = {
                        points: 0,
                        tasksCompleted: 0,
                    }
                }else{
                    server.memberInfo = {
                        [`${interaction.user.username}#${interaction.user.discriminator}`]: {
                            points: 0,
                            tasksCompleted: 0,
                        }
                    }
                }

                server.markModified('memberInfo')
                server.save()
                .then(()=>{
                    interaction.reply({
                        content: 'Task claimed!',
                        ephemeral: true
                    })
                })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }
})

client.login(process.env.DISCORD_TOKEN);