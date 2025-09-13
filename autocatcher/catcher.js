import { Client } from "discord.js-selfbot-v13";
import { logger } from "../utils/logger.js";

const POKETWO_ID = "716390085896962058";

export class AutoCatcher {
  constructor(token, channelId) {
    this.token = token;
    this.channelId = channelId;
    this.client = new Client();
    this.spamInterval = null;
  }

  async start() {
    this.client.on("ready", async () => {
      logger.success(
        `Logged in as ${this.client.user.tag} | Spamming in channel ${this.channelId}`
      );
      this.startSpam();
    });

    this.client.on("messageCreate", async (msg) => {
      if (msg.author.id !== POKETWO_ID) return;

      // Detect captcha
      if (msg.content.includes("human") && msg.content.includes(this.client.user.id)) {
        logger.warn(`[${this.client.user.tag}] CAPTCHA detected! Stopping spam.`);
        this.stopSpam();
      }

      // Detect Pokémon hint
      if (msg.content.includes("The pokémon is")) {
        logger.info(`[${this.client.user.tag}] Hint detected, but catching logic WIP.`);
        // TODO: Solve hint & catch logic
      }
    });

    try {
      await this.client.login(this.token);
    } catch (err) {
      logger.error(`Login failed for token ${this.token.slice(0, 10)}...`);
    }
  }

  startSpam() {
    if (this.spamInterval) clearInterval(this.spamInterval);

    this.spamInterval = setInterval(async () => {
      try {
        const channel = await this.client.channels.fetch(this.channelId);
        if (channel) {
          const text = Array.from({ length: Math.floor(Math.random() * 13) + 12 })
            .map(() =>
              String.fromCharCode(
                Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97)
              )
            )
            .join("");
          await channel.send(text);
          logger.debug(`[${this.client.user.tag}] Spam → #${this.channelId}`);
        }
      } catch (err) {
        logger.error(`[${this.client.user.tag}] Spam error: ${err.message}`);
      }
    }, Math.floor(Math.random() * 400) + 1500); // 1500–1900 ms
  }

  stopSpam() {
    if (this.spamInterval) {
      clearInterval(this.spamInterval);
      this.spamInterval = null;
      logger.warn(`[${this.client.user.tag}] Spam stopped.`);
    }
  }
}
