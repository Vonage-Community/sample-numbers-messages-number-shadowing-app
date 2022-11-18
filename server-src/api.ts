import * as dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa'
import { Vonage } from '@vonage/server-sdk'
import { Auth } from '@vonage/auth'
import { SMS } from '@vonage/messages'
import { LineType } from '@vonage/numbers/dist/enums/LineType'
import Router from '@koa/router'
import koaBody from 'koa-body'
import cors from '@koa/cors'

const base64Key = process.env.VONAGE_PRIVATE_KEY || ''
const buff = Buffer.from(base64Key, 'base64')
const vonageAuth = new Auth({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    privateKey: buff.toString('ascii'),
    applicationId: process.env.VONAGE_APPLICATION_ID,
});
const vonage = new Vonage(vonageAuth);

async function home(ctx: any) {
    ctx.body = { 'status': 'ok' }
}

const deliveryPhone = process.env.DELIVERY_PHONE || '';
let driverNumber: string = '';
let clientNumber: string = '';

async function placeOrder(ctx: any) {
    clientNumber = JSON.parse(ctx.request.body).client_number;
    await vonage.numbers.getAvailableNumbers({ country: 'US', size: 1, type: LineType['LANDLINE-TOLL-FREE'] })
        .then(async (resp: any) => {
            driverNumber = resp.numbers[0].msisdn;
            await vonage.numbers.buyNumber({ country: 'US', msisdn: driverNumber })
                .then(async () => {
                    await vonage.numbers.updateNumber({ country: 'US', msisdn: driverNumber, applicationId: process.env.VONAGE_APPLICATION_ID })
                        .then(() => {
                            ctx.body = { driver_number: driverNumber }
                        })
                        .catch(err => console.error(err))
                })
                .catch(err => console.error(err))
        })
        .catch(err => console.error(err))
}

async function answerCall(ctx: any) {
    ctx.body = [
        {
            "action": "talk",
            "text": "Calling your driver, just a moment"
        },
        {
            "action": "connect",
            "endpoint": [
                {
                    "type": "phone",
                    "number": deliveryPhone
                }
            ],
            "from": driverNumber
        }
    ]
}

async function answerMessage(ctx: any) {
    if (ctx.request.body.from === clientNumber) {
        await vonage.messages.send(new SMS('From orderer: ' + ctx.request.body.text, deliveryPhone, driverNumber))
            .then(resp => { ctx.status = 200; ctx.body = { response: 'OK' } })
    }

    if (ctx.request.body.from === deliveryPhone) {
        await vonage.messages.send(new SMS('From delivery driver: ' + ctx.request.body.text, clientNumber, driverNumber))
            .then(resp => { ctx.status = 200; ctx.body = { response: 'OK' } })
    }

    ctx.body = { response: 'OK' }
}

async function messageStatus(ctx: any) {
    console.log(ctx.request.body)
    ctx.body = { response: 'OK' }
}

const app = new Koa();

const router = new Router();
router
    .get('', home)
    .post('/orders', placeOrder)
    .get('/webhooks/voice/answer', answerCall)
    .post('/webhooks/voice/answer', answerCall)
    .post('/webhooks/messages/inbound', answerMessage)
    .post('/webhooks/messages/status', messageStatus);

app.use(cors());
app.use(koaBody());
app.use(router.routes());
app.listen(3000)