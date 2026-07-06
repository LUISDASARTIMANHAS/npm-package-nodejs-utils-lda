import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let nmapCommand = new SlashCommandBuilder()
  .setName("nmap")
  .setDescription("Network mapper and security scanner.")
  .addStringOption((option) =>
    option
      .setName("target")
      .setDescription("Hostname, IP address or network.")
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName("--ipv6")
      .setDescription("Enable IPv6 scanning.")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--ping-scan")
      .setDescription("Ping scan only (-sn).")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--service-version")
      .setDescription("Detect service versions (-sV).")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--os-detection")
      .setDescription("Enable OS detection (-O).")
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName("--aggressive")
      .setDescription("Aggressive scan (-A).")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("--ports")
      .setDescription("Ports to scan (e.g. 80,443 or 1-1000).")
      .setRequired(false),
  )
  .addIntegerOption((option) =>
    option
      .setName("--top-ports")
      .setDescription("Scan the top N most common ports.")
      .setMinValue(1)
      .setMaxValue(65535)
      .setRequired(false),
  )
  .addIntegerOption((option) =>
    option
      .setName("--timing")
      .setDescription("Timing template (0-5).")
      .setMinValue(0)
      .setMaxValue(5)
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("Additional nmap arguments.")
      .setRequired(false),
  );

nmapCommand = nmapCommand.toJSON();

async function handleNmap(interaction) {
  if (interaction.commandName !== "nmap") return;

  const target = interaction.options.getString("target");

  const ipv6 = interaction.options.getBoolean("--ipv6");
  const pingScan = interaction.options.getBoolean("--ping-scan");
  const serviceVersion = interaction.options.getBoolean("--service-version");
  const osDetection = interaction.options.getBoolean("--os-detection");
  const aggressive = interaction.options.getBoolean("--aggressive");

  const ports = interaction.options.getString("--ports");
  const topPorts = interaction.options.getInteger("--top-ports");
  const timing = interaction.options.getInteger("--timing");

  const args = interaction.options.getString("args");

  const command = ["nmap"];

  if (ipv6) command.push("-6");
  if (pingScan) command.push("-sn");
  if (serviceVersion) command.push("-sV");
  if (osDetection) command.push("-O");
  if (aggressive) command.push("-A");

  if (ports) {
    command.push("-p", ports);
  }

  if (topPorts) {
    command.push("--top-ports", topPorts.toString());
  }

  if (timing !== null && timing !== undefined) {
    command.push(`-T${timing}`);
  }

  command.push(target);

  await discordHandleExecTemplate(interaction, command.join(" "), args);
}

export { nmapCommand, handleNmap };
