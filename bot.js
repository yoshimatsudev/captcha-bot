const puppeteer = require('puppeteer-extra')
const fs = require('fs').promises
const cron = require('node-cron')

const { Client, Events, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
// const { token } = require('./config.json');

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())


console.log('starting nodejs script')

const saveCookie = async (page) => {
    const cookies = await page.cookies();
    const cookieJson = JSON.stringify(cookies, null, 2);
    await fs.writeFile('cookies.json', cookieJson);
}

const loadCookie = async (page) => {
    const cookieJson = await fs.readFile('cookies.json');
    const cookies = JSON.parse(cookieJson);
    return cookies
}

const setCookie = async (cookies) => {
    try {
        await page.setCookie(...cookies)
        console.log('success setCookie')
    } catch (e) {
        console.log(e, 'fail setCookie')
    }
}

const cleanCookies = async () => {
    await page.setCookie({})
}

async function startBot(channel, client) {
    console.log('starting routine...')
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 })

    await page.goto('https://www.cssbuy.com/?go=user&action=login')
    await page.waitForTimeout(500)

    await page.waitForSelector('.functionList1 > li:nth-child(4) > ul:nth-child(2)')

    // raw dog on exact x y of page
    // await page.waitForSelector('#codeCont > div > div.col-md-4.col-xs-12 > img')

    // await page.screenshot({
    //     path: 'captcha.png', clip: {
    //         x: 675,
    //         y: 460,
    //         width: 150,
    //         height: 75
    //     }
    // });



    await page.waitForSelector('#username')
    const element = await page.$("img.pull-right");
    await element.screenshot({ path: 'element.png' });

    const file = new AttachmentBuilder('./element.png')
    const attach = new EmbedBuilder().setTitle('captcha').setImage('attachment://element.png')

    await channel.message({ embeds: [attach], files: [file] })
    await page.type('#username', process.env.USERNAME)
    await page.waitForTimeout(500)

    await page.waitForSelector('#password')
    await page.type('#password', process.env.PASSWORD)
    await page.waitForTimeout(500)

    await page.waitForSelector('#remember')
    await page.click('#remember')
    await page.waitForTimeout(500)

    try {
        const prefix = '!'
        console.log('here adsda')
        client.on('message', message => {
            if (message.author.bot || message.channel.id !== channelId) return;

            console.log('here')
            if (message.content.startsWith(prefix)) {
                const args = message.content.slice(prefix.length).trim().split(/ +/);
                const command = args.shift().toLowerCase();
                console.log(command)
                if (command === 'ask') {
                    message.channel.send('Please provide your input:').then(() => {
                        const filter = m => m.author.id === message.author.id;
                        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000 });

                        collector.on('collect', m => {
                            message.channel.send(`You provided: ${m.content}`);
                        });

                        collector.on('end', collected => {
                            if (collected.size === 0) {
                                message.channel.send('You did not provide any input.');
                            }
                        });
                    }).catch(err => {
                        console.error('Error:', err);
                    });
                }
            }
        });
        await page.click('#loginBtn')
        await page.waitForTimeout(1000)

    } catch (e) {

    }







}




(async () => {
    async function startBot() {



        console.log('starting routine...')
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 720 })

        await page.goto('https://www.cssbuy.com/?go=user&action=login')
        await page.waitForTimeout(500)

        await page.waitForSelector('.functionList1 > li:nth-child(4) > ul:nth-child(2)')

        await page.waitForSelector('#username')
        const element = await page.$("img.pull-right");
        await element.screenshot({ path: 'element.png' });

        const file = new AttachmentBuilder('./element.png')
        const attach = new EmbedBuilder().setTitle('captcha').setImage('attachment://element.png')

        await channel.send({ embeds: [attach], files: [file] })
        await page.type('#username', process.env.USERNAME)
        await page.waitForTimeout(500)

        await page.waitForSelector('#password')
        await page.type('#password', process.env.PASSWORD)
        await page.waitForTimeout(500)

        await page.waitForSelector('#remember')
        await page.click('#remember')
        await page.waitForTimeout(500)

        const prefix = '!'

        let captcha = undefined



        client.on('messageCreate', async message => {
            if (message.content.startsWith(prefix)) {

                captcha = message.content.substring(1, 5);

                console.log(captcha)
                await page.type('#code', captcha)
                await page.click('#loginBtn')
                await page.waitForTimeout(1000)

                let test = await page.$('.functionList1 > li:nth-child(4) > ul:nth-child(2) > a:nth-child(4)')

                if (test != null) {
                    console.log('login success')
                } else {
                    console.error('login error')
                    await browser.close()
                }

            }
        });


    }

    const channelId = '1041906163001868311'

    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
    await client.login(process.env.TOKEN);

    const channel = await client.channels.fetch(channelId);
    try {
        await startBot();
    } catch (e) {
        if (e.message == 'failed to login') {
            await startBot();
        }
    }



})();
