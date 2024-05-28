const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { GoogleGenerativeAI } = require("@google/generative-ai");

var user = "";
var mod = "";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  await message.reply(text); //Reply to user
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
  if (message.body.includes(".dwipa")) {
    var query;
    const regxmatch = message.body.match(/\.dwipa(.+)/);

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
  }
});

client.initialize();
