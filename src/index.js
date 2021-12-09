const axios = require('axios');
const webApi = require('@slack/web-api');

async function getPoloData() {
    return await axios.post("https://www.dogusoto.com.tr/api/vehicle/getvehiclelist/yeni-polo-ae1");
}

function getAnyAvailablePolo(polos) {
    let iFindPolo = false;

    for (let polo of polos) {

        if (iFindPolo) {
            break;
        }

        if (polo.geartypeclass === "Otomatik") {
            let availableSellers = polo.vehiclereservedealer;

            for (let seller of availableSellers) {

                if (seller.isoptiontocustomer) {
                    console.log("cha cabana I find to polo notify to me", seller);
                    iFindPolo = true;
                    break;
                }
            }
        }
    }

    return iFindPolo;
}

async function sendProcessResultViaSlack(message) {
    console.log('Starting send message to user with slack');
    const slack = new webApi.WebClient(process.env.SLACK_TOKEN);

    const options = {
        type: 'message',
        as_user: true,
        unfurl_links: true,
        username: 'MY Polo Finder Bot Reporter',
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": message
                }
            }
        ]
    };

    const user = await slack.users.lookupByEmail({'email': process.env.SLACK_USER});
    options.channel = user.user.id;

    const res = await slack.chat.postMessage(options);
    console.log('Message sent: ', res.ts);
}

exports.handler = async function (event, context, callback) {
    try {
        const poloList = await getPoloData();
        console.log("polo vehicle list : ", poloList.data.data);

        const iFindPolo = getAnyAvailablePolo(poloList.data.data);

        if (iFindPolo) {
            await sendProcessResultViaSlack("polo buldum git reservasyon yap :alert:");
        }
    } catch (err) {
        await sendProcessResultViaSlack("polo bulucu hata aldı düzelt beni conem :alert:");
        console.error(`error getting :(  ${err.name} ${err.message} ${err.stack}`);
    }

    callback(null, 'completion success');
};