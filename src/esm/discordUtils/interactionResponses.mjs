/**
 * Responde a uma interação respeitando o estado atual do ACK.
 * @param {any} interaction
 * @param {any} payload
 * @returns {Promise<any>}
 */
export async function replyInteraction(interaction, payload) {
  if (!interaction) {
    throw new TypeError("interaction is required");
  }

  if (interaction.deferred) {
    return interaction.editReply(payload);
  }

  if (interaction.replied) {
    return interaction.followUp(payload);
  }

  try {
    return await interaction.reply(payload);
  } catch (error) {
    const alreadyAcknowledged =
      error?.code === "InteractionAlreadyReplied" ||
      error?.code === 40060 ||
      error?.rawError?.code === 40060;

    if (!alreadyAcknowledged) {
      throw error;
    }

    return interaction.followUp(payload);
  }
}