// discordUtils\defaultCommands\curl.mjs
import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let curlCommand = new SlashCommandBuilder()
  .setName("curl")
  .setDescription(
    "curl is used in command lines or scripts to transfer data. curl is also libcurl",
  )
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("enter domain or ip to curl")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("--output")
      .setDescription("Saves the download to a specific file name.")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--remote-name")
      .setDescription("Saves the file using its remote name from the URL.")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--location")
      .setDescription(
        "Automatically follows HTTP redirects (301/302 status codes).",
      )
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--include")
      .setDescription(
        "Prints the server's HTTP response headers along with the body.",
      )
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--head")
      .setDescription(
        "Fetches only the HTTP headers without downloading the body.",
      )
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--insecure")
      .setDescription(
        "Bypasses SSL certificate checks (useful for self-signed certs).",
      )
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--verbose")
      .setDescription(
        "Shows the full handshake, request headers, and response info.",
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("--user-agent")
      .setDescription("specify the User-Agent string.")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option.setName("args").setDescription("extra args").setRequired(false),
  );

curlCommand = curlCommand.toJSON();

// help.js
async function handleCurl(interaction) {
  if (interaction.commandName === "curl") {
    const domain = interaction.options.getString("domain");

    // Validação da URL
    try {
      new URL(domain);
    } catch {
      return interaction.reply({
        content: "❌ Invalid URL.",
        ephemeral: true,
      });
    }

    const outputFile = interaction.options.getString("--output");
    const remoteName = interaction.options.getBoolean("--remote-name");
    const location = interaction.options.getBoolean("--location");
    const include = interaction.options.getBoolean("--include");
    const head = interaction.options.getBoolean("--head");
    const insecure = interaction.options.getBoolean("--insecure");
    const verbose = interaction.options.getBoolean("--verbose");

    const userAgent =
      interaction.options.getString("--user-agent") ??
      process.env.SERVER_USER_AGENT;

    const command = ["curl"];

    command.push(`"${domain}"`);

    if (userAgent) command.push("--user-agent", `"${userAgent}"`);

    if (outputFile) command.push("--output", `"${outputFile}"`);

    const flags = [
      ["--remote-name", remoteName],
      ["--location", location],
      ["--include", include],
      ["--head", head],
      ["--insecure", insecure],
      ["--verbose", verbose],
    ];

    for (const [flag, enabled] of flags) {
      if (enabled) command.push(flag);
    }

    await discordHandleExecTemplate(interaction, command.join(" "));
  }
}

export { curlCommand, handleCurl };
