import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let tracertCommand = new SlashCommandBuilder()
  .setName("tracert")
  .setDescription(
    "Trace the route packets take to a network host.",
  )
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("Hostname or IP address.")
      .setRequired(true),
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
  .addBooleanOption((option) =>
    option
      .setName("--no-dns")
      .setDescription("Do not resolve IP addresses to hostnames.")
      .setRequired(false),
  )
  .addIntegerOption((option) =>
    option
      .setName("--max-hops")
      .setDescription("Maximum number of hops.")
      .setMinValue(1)
      .setMaxValue(255)
      .setRequired(false),
  )
  .addIntegerOption((option) =>
    option
      .setName("--timeout")
      .setDescription("Timeout in milliseconds.")
      .setMinValue(100)
      .setMaxValue(60000)
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("Additional tracert arguments.")
      .setRequired(false),
  );

tracertCommand = tracertCommand.toJSON();

async function handleTracert(interaction) {
  if (interaction.commandName !== "tracert") return;

  const domain = interaction.options.getString("domain");
  const ipv4 = interaction.options.getBoolean("--ipv4");
  const ipv6 = interaction.options.getBoolean("--ipv6");
  const noDns = interaction.options.getBoolean("--no-dns");
  const maxHops = interaction.options.getInteger("--max-hops");
  const timeout = interaction.options.getInteger("--timeout");
  const args = interaction.options.getString("args");

  if (ipv4 && ipv6) {
    return interaction.reply({
      content: "❌ You cannot use IPv4 and IPv6 simultaneously.",
      ephemeral: true,
    });
  }

  const command = ["tracert"];

  if (ipv4) command.push("-4");
  if (ipv6) command.push("-6");
  if (noDns) command.push("-d");

  if (maxHops) {
    command.push("-h", maxHops.toString());
  }

  if (timeout) {
    command.push("-w", timeout.toString());
  }

  command.push(domain);

  await discordHandleExecTemplate(
    interaction,
    command.join(" "),
    args,
  );
}

export { tracertCommand, handleTracert };