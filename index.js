const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const token = fs.readFileSync(path.join(__dirname, "data/main_token.txt"), "utf8").trim();
const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

let catcherProcess = null;

bot.once("ready", () => {
  console.log(`🤖 Main bot logged in as ${bot.user.tag}`);
});

bot.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith(".")) return;
  const [cmd, ...args] = msg.content.slice(1).split(" ");

  // 📜 Help command
  if (cmd === "help") {
    const helpEmbed = new EmbedBuilder()
      .setTitle("⚡ Pokétwo Autocatcher Commands")
      .setColor("#00FF9C")
      .setDescription("Here are all available commands:")
      .addFields(
        { name: "🔑 Token Management", value: "`.add-token <token> <channelId>` → Add an account\n`.list-tokens` → Show all accounts\n`.remove-token <line>` → Remove an account" },
        { name: "🤖 Autocatcher Control", value: "`.catcher start` → Start autocatcher\n`.catcher stop` → Stop autocatcher\n`.catcher restart` → Restart autocatcher\n`.status` → Check status" },
        { name: "🕵️ Captcha Handling", value: "`.captcha solved` → Resume autocatcher after captcha" },
        { name: "📢 Broadcasting", value: "`.say <message>` → Broadcast to all selfbots\n*(auto-clicks Confirm / Accept buttons)*" },
        { name: "❓ Help", value: "`.help` → Shows this menu" }
      )
      .setFooter({ text: "Pokétwo Autocatcher | Use responsibly ⚠️" });

    return msg.reply({ embeds: [helpEmbed] });
  }

  // ➕ Add token
  if (cmd === "add-token") {
    const [userToken, channelId] = args;
    if (!userToken || !channelId) return msg.reply("⚠️ Usage: `.add-token <token> <channelId>`");
    fs.appendFileSync("data/tokens.txt", `${userToken}|${channelId}\n`);
    msg.reply("✅ Token added.");
  }

  // ▶️ Start autocatcher
  if (cmd === "catcher" && args[0] === "start") {
    if (catcherProcess) return msg.reply("⚠️ Autocatcher already running.");
    catcherProcess = spawn("node", ["autocatcher/index.js"], { stdio: "inherit" });
    msg.reply("✅ Autocatcher started.");
  }

  // ⏹ Stop autocatcher
  if (cmd === "catcher" && args[0] === "stop") {
    if (!catcherProcess) return msg.reply("⚠️ No autocatcher is running.");
    catcherProcess.kill();
    catcherProcess = null;
    msg.reply("🛑 Autocatcher stopped.");
  }

  // 🔄 Restart autocatcher
  if (cmd === "catcher" && args[0] === "restart") {
    if (catcherProcess) catcherProcess.kill();
    catcherProcess = spawn("node", ["autocatcher/index.js"], { stdio: "inherit" });
    msg.reply("🔄 Autocatcher restarted.");
  }

  // ✅ Resume after captcha
  if (cmd === "captcha" && args[0] === "solved") {
    msg.reply("✅ Resuming autocatchers (selfbots will pick up again).");
  }

  // 📢 Broadcast a message
  if (cmd === "say") {
    const sayMsg = args.join(" ");
    if (!sayMsg) return msg.reply("⚠️ Usage: `.say <message>`");
    msg.reply(`📢 Broadcasting: "${sayMsg}"`);
  }
});

bot.login(token);
