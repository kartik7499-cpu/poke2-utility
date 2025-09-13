// autocatcher/index.js
const fs = require("fs");
const path = require("path");
const {
  Client,
  Intents,
  WebhookClient,
  MessageButton
} = require("discord.js-selfbot-v13");
const logger = require("../utils/logger");
const config = require("../config.json");

const tokens = fs.readFileSync(path.join(__dirname, "../data/tokens.txt"), "utf8").trim().split("\n");
const pokemonList = fs.readFileSync(path.join(__dirname, "../data/pokemon.txt"), "utf8").split("\n");

const poketwoId = "716390085896962058";
const assistantId = "854233015475109888"; // Pokétwo Assistant
const catchWebhook = new WebhookClient({ url: config.webhooks.catches });
const captchaWebhook = new WebhookClient({ url: config.webhooks.captchas });

function solveHint(hint, list) {
  const clean = hint.replace(/\\/g, "");
  const pattern = clean.replace(/_/g, ".");
  const regex = new RegExp(`^${pattern}$`, "i");
  return list.filter((p) => regex.test(p));
}

function startSpam(client, channelId) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  const intervals = [1500, 1600, 1700, 1800, 1900];

  const spamLoop = async () => {
    const length = Math.floor(Math.random() * 13) + 12;
    const text = Array.from({ length }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97))
    ).join("");

    try {
      await channel.send(text);
    } catch (e) {
      logger.warn(`Spam error: ${e.message}`);
    }

    const next = intervals[Math.floor(Math.random() * intervals.length)];
    setTimeout(spamLoop, next);
  };
  spamLoop();
}

function startCatcher(token, spamChannelId) {
  const client = new Client({
    checkUpdate: false,
  });

  client.once("ready", () => {
    logger.success(`Catcher logged in as ${client.user.tag} | Spam Channel: ${spamChannelId}`);
    startSpam(client, spamChannelId);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.id !== poketwoId) return;

    // Captcha detected
    if (message.content.includes("Whoa") && message.content.includes("captcha")) {
      logger.warn(`[CAPTCHA] ${client.user.tag} got captcha in ${message.channel.id}`);
      await captchaWebhook.send({
        content: `⚠️ CAPTCHA triggered for **${client.user.tag}**\n[Click here](https://verify.poketwo.net/captcha/${client.user.id})`
      });
      return;
    }

    // Pokémon spawn
    if (message.embeds.length > 0 && message.embeds[0].title?.includes("wild pokémon has appeared")) {
      logger.info(`[SPAWN] Pokémon spawned in #${message.channel.id}`);
      await message.channel.send(`<@${poketwoId}> h`);

      // Wait for assistant
      const assistantFilter = (m) => m.author.id === assistantId && m.content.includes("Possible Pokémon");
      let assistantMsg;
      try {
        assistantMsg = await message.channel.awaitMessages({
          filter: assistantFilter,
          max: 1,
          time: 4000,
          errors: ["time"],
        });
      } catch {
        assistantMsg = null;
      }

      if (assistantMsg && assistantMsg.size > 0) {
        const content = assistantMsg.first().content;
        const possible = content.replace("Possible Pokémon:", "").split(",").map((x) => x.trim());

        let choice;
        if (possible.length === 1) {
          choice = possible[0];
        } else {
          const hintMsg = message.content;
          const underscores = (hintMsg.match(/_/g) || []).length;
          let filtered = possible.filter((p) => p.length === underscores);
          if (filtered.length === 0) filtered = possible;
          choice = filtered[0];
        }

        await message.channel.send(`<@${poketwoId}> c ${choice}`);
        logger.success(`[CATCH] Assistant → ${choice}`);
        fs.appendFileSync("logs/catches.txt", `[${new Date().toISOString()}] Assistant → ${choice}\n`);
        await catchWebhook.send(`[CATCH] **${client.user.tag}** caught ${choice}`);
      } else {
        // fallback to regex solver
        const hintMsg = message.content;
        const matches = solveHint(hintMsg, pokemonList);
        if (matches.length > 0) {
          await message.channel.send(`<@${poketwoId}> c ${matches[0]}`);
          logger.success(`[CATCH] Regex solver → ${matches[0]}`);
          fs.appendFileSync("logs/catches.txt", `[${new Date().toISOString()}] Regex solver → ${matches[0]}\n`);
          await catchWebhook.send(`[CATCH] **${client.user.tag}** caught ${matches[0]}`);
        } else {
          logger.warn(`[MISS] Could not solve hint: ${hintMsg}`);
        }
      }
    }
  });

  // `.say` command for all bots
  client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(".say")) return;
    const content = message.content.slice(4).trim();
    if (!content) return;

    await message.channel.send(content);

    // Auto-click confirm/accept buttons
    if (message.reference) {
      try {
        const refMsg = await message.channel.messages.fetch(message.reference.messageId);
        if (refMsg?.components.length > 0) {
          for (const row of refMsg.components) {
            for (const btn of row.components) {
              if (btn.label?.toLowerCase().includes("confirm") || btn.label?.toLowerCase().includes("accept")) {
                await refMsg.clickButton(btn.customId);
                logger.info(`[AUTOCLICK] Clicked ${btn.label} for ${client.user.tag}`);
              }
            }
          }
        }
      } catch (e) {
        logger.warn(`Autoclick failed: ${e.message}`);
      }
    }
  });

  client.login(token).catch(() => {
    logger.error(`Login failed for token: ${token.substring(0, 10)}...`);
  });
}

// Start all tokens
tokens.forEach((line) => {
  const [token, spamChannelId] = line.split("|");
  if (token && spamChannelId) startCatcher(token.trim(), spamChannelId.trim());
});
