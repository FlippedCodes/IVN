// Common functions used for different operations on Discord
// TODO: Needs to be refactored to class

import { EmbedBuilder } from 'discord.js';

import type { ButtonInteraction, ColorResolvable, CommandInteraction } from 'discord.js';

type interactionType = CommandInteraction | ButtonInteraction;

export function messageFail(
  interaction: interactionType,
  content: string,
  color?: ColorResolvable,
  ephemeral?: boolean
) {
  embedMessage(interaction, content, '', color || 'Red', undefined, ephemeral || true);
}

export async function messageSuccess(
  interaction: interactionType,
  content: string,
  color: ColorResolvable,
  ephemeral: boolean
) {
  const sentMessage = await embedMessage(
    interaction,
    content,
    '',
    color || 'Green',
    undefined,
    ephemeral || false
  );
  return sentMessage;
}

export async function embedMessage(
  interaction: interactionType,
  body: string,
  title?: string,
  color?: ColorResolvable,
  footer?: string,
  ephemeral: boolean = false
) {
  // needs to be local as settings overlap from different embed-requests
  const embed = new EmbedBuilder();

  if (body) embed.setDescription(body);
  if (title) embed.setTitle(title);
  if (color) embed.setColor(color);
  if (footer) embed.setFooter({ text: footer });

  const options = {
    embeds: [embed],
    components: [],
    ephemeral,
  };

  return reply(interaction, options);
}

// raw reply to commands
export async function reply(
  interaction: interactionType,
  // FIXME: ts cant determine the type as it is different from normal reply and edit reply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  followUp: boolean = false
) {
  if (followUp) return interaction.followUp(payload);
  // check if message needs to be edited or if its a first reply
  if (interaction.deferred || interaction.replied) return interaction.editReply(payload);
  return interaction.reply(payload);
}
