const TelegramBot = require("node-telegram-bot-api");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const TOKEN = "7964379250:AAECKcNdQ_ucWb7BVPyeoA8Q6wMBUiLkkMU"; // BotFather token
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Welcome!\nSend /song <song name> to get mp3."
  );
});

bot.onText(/\/song (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, `🔎 Searching for "${query}"...`);

  try {
    const result = await yts(query);
    if (!result.videos.length) return bot.sendMessage(chatId, "❌ No results found.");

    const video = result.videos[0];
    const url = video.url;
    const fileName = `song_${Date.now()}.mp3`;

    // Download video & convert to mp3
    const stream = ytdl(url, { filter: "audioonly" });
    ffmpeg(stream)
      .audioBitrate(128)
      .save(fileName)
      .on("end", () => {
        bot.sendAudio(chatId, fs.createReadStream(fileName)).then(() => {
          fs.unlinkSync(fileName);
        });
      });
  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "❌ Failed to download song.");
  }
});

console.log("🎶 Song Bot running...");
