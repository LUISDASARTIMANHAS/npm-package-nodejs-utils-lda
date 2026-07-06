import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription(
    "Test network connectivity and measure latency.",
  )
  .addStringOption((option) =>
    option
      .setName("host")
      .setDescription("Hostname or IP address.")
      .setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("--count")
      .setDescription("Number of echo requests.")
      .setMinValue(1)
      .setMaxValue(20)
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--ipv4")
      .setDescription("Force IPv4.")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--ipv6")
      .setDescription("Force IPv6.")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("Additional ping arguments.")
      .setRequired(false),
  );

pingCommand = pingCommand.toJSON();

async function handlePing(interaction) {
  if (interaction.commandName !== "ping") return;

  const host = interaction.options.getString("host");
  const count = interaction.options.getInteger("--count");
  const ipv4 = interaction.options.getBoolean("--ipv4");
  const ipv6 = interaction.options.getBoolean("--ipv6");
  const args = interaction.options.getString("args");

  const command = ["ping"];

  if (ipv4) command.push("-4");
  if (ipv6) command.push("-6");

  if (count) command.push("-n", count.toString());

  command.push(host);

  await discordHandleExecTemplate(
    interaction,
    command.join(" "),
    args,
  );
}

export { pingCommand, handlePing };