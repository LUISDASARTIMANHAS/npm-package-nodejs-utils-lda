import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let nslookupCommand = new SlashCommandBuilder()
  .setName("nslookup")
  .setDescription("Query DNS records using nslookup.")
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("Hostname or IP address.")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("--type")
      .setDescription("DNS record type.")
      .addChoices(
        { name: "A", value: "A" },
        { name: "AAAA", value: "AAAA" },
        { name: "MX", value: "MX" },
        { name: "TXT", value: "TXT" },
        { name: "NS", value: "NS" },
        { name: "SOA", value: "SOA" },
        { name: "PTR", value: "PTR" },
        { name: "CNAME", value: "CNAME" },
        { name: "SRV", value: "SRV" },
        { name: "ANY", value: "ANY" },
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("--server")
      .setDescription("DNS server to query.")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("Additional nslookup arguments.")
      .setRequired(false),
  );

nslookupCommand = nslookupCommand.toJSON();

async function handleNslookup(interaction) {
  if (interaction.commandName !== "nslookup") return;

  const domain = interaction.options.getString("domain");
  const type = interaction.options.getString("--type");
  const server = interaction.options.getString("--server");
  const args = interaction.options.getString("args");

  const command = ["nslookup"];

  if (type) {
    command.push(`-type=${type}`);
  }

  command.push(domain);

  if (server) {
    command.push(server);
  }

  await discordHandleExecTemplate(
    interaction,
    command.join(" "),
    args,
  );
}

export { nslookupCommand, handleNslookup };