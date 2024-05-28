const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const readline = require("readline");
const { Keyboard } = require("puppeteer");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var user = "";
var mod = "";
var pilihanpacar = false;
var page;

puppeteer.use(StealthPlugin());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

(async () => {
  const path =
    "C:\\Users\\naray\\OneDrive\\Desktop\\botjs\\ErineBot\\node_modules\\whatsapp-web.js\\node_modules\\puppeteer\\.local-chromium\\win64-982053\\chrome-win\\chrome.exe";
  browser = await puppeteer.launch({
    headless: false,
    args: [
      "--user-agent=Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    ],
    executablePath: path,
  });
  page = await browser.newPage();
  await page.goto(
    "https://character.ai/chat/S04Rz9Dn2IujE2TxPFXZ_WakCzQH1Nze4cquAdtE7Ow"
  );
})();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function cAI(pesan, message) {
  const textareaSelector =
    'textarea.flex[placeholder="Message Erine JKT48 ..."]';
  await page.waitForSelector(textareaSelector);

  const msg = pesan;
  await page.type(textareaSelector, msg);
  await page.keyboard.press("Enter");

  await page.waitForTimeout(8000);

  const responseSelector = 'p[node="[object Object]"]';
  await page.waitForSelector(responseSelector);

  const text = await page.$eval(responseSelector, (el) => el.textContent);

  await message.reply(text);
}

const pacar = "6289671817799@c.us";

function fileToGenerativePart(data, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(data, "base64").toString("base64"),
      mimeType,
    },
  };
}

const genAI = new GoogleGenerativeAI("AIzaSyAdEUNa2GfQzYsJvn5Pc9Da1Qe1UR6PfT4");

async function generate(prompt, message) {
  const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const chat = model2.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: user }],
      },
      {
        role: "model",
        parts: [{ text: mod }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();
  await message.reply(text);
  delay(2000);
  user = prompt;
  mod = text;
}

async function generateimg(prompt, img, message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent([prompt, img]);
  const response = await result.response;
  const text = response.text();
  await message.reply(text);
  delay(2000);
  mod = text;
  user = prompt;
}

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Client is authenticated!");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("disconnected", () => {
  console.log("Client is disconnected!");
});

client.on("auth_failure", () => {
  console.log("Client is auth_failure!");
});

client.on("message", async (message) => {
  if (message.body.includes(".erine")) {
    var query;

    const regxmatch = message.body.match(/\.erine(.+)/);

    if (regxmatch) {
      if (message.hasMedia) {
        query = regxmatch[1];
        const media = await message.downloadMedia();
        const inlineData = fileToGenerativePart(media.data, media.mimetype);
        generateimg(query, inlineData, message);
      } else {
        query = regxmatch[1];
        generate(query, message);
      }
    } else {
      console.log("No regex match!");
      query = "halo";
      generate(query, message);
    }
  } else if (message.from == pacar && !message.isGroupMsg) {
    if (!pilihanpacar) {
      if (message.body.includes("Mode Ai")) {
        await message.reply("Mode Ai onn");
        pilihanpacar = true;
      } else {
        pesan = message.body;
        cAI(pesan, message);
      }
    } else {
      if (message.body.includes("Mode pacar")) {
        await message.reply("Mode pacarrr onn");
        pilihanpacar = false;
      } else {
        if (message.hasMedia) {
          query = message.body;
          const media = await message.downloadMedia();
          const inlineData = fileToGenerativePart(media.data, media.mimetype);
          generateimg(query, inlineData, message);
        } else {
          query = message.body;
          generate(query, message);
        }
      }
    }
  } else {
    await message.reply("Tolong gunakan command .erine yaa");
  }
});

client.initialize();
