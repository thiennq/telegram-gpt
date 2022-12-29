import {Telegraf} from 'telegraf';
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv';

dotenv.config('../')
const {TELEGRAM_BOT_TOKEN, OPENAI_API_KEY} = process.env;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const openai = new OpenAIApi(new Configuration({
    apiKey: OPENAI_API_KEY,
}));

bot.command('start', ctx => {
    console.log(ctx)
    console.log(ctx.from);
    bot.telegram.sendMessage(ctx.chat.id, `Hello! I'm ${ctx.botInfo.first_name}, a chatbot powered by ChatGPT.`);
    bot.telegram.sendMessage(ctx.chat.id, `You can ask me any question.`);
})

// For use in groups
bot.command("ask", ctx => {
    const {text} = ctx.update.message;
    const question = text.split(/\s/).splice(1).join(' ');
    AIResponse(ctx, question);
});

// Answer directly in private chat with the chatbot
bot.on('text', ctx => {
    if (ctx.update.message.entities) {
        return ctx.reply('Unknown command');
    }

    const isPrivate = ctx.update.message.chat.type === 'private';
    if (isPrivate) {
        const question = ctx.update.message.text;
        AIResponse(ctx, question)
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


function AIResponse(ctx, question) {
    openai.createCompletion({
        model: "text-davinci-003",
        prompt: question,
        temperature: 0.6,
        max_tokens: 1000
    }).then(completion => {
        const answer = completion.data.choices[0].text.trim();
        const questionMessageId = ctx.update.message.message_id;
        ctx.reply(answer, {reply_to_message_id: questionMessageId });
    })
}