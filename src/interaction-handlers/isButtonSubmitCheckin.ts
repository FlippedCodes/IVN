import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';

import { messageFail } from '../lib/discord/generic';

import {
  type ButtonInteraction,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  type MessageActionRowComponentBuilder,
  ChannelType,
} from 'discord.js';

const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
  new ButtonBuilder()
    .setCustomId('checkin_submit_disabled')
    .setEmoji('👌')
    .setLabel(`I'm ready!`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),
]);

export class HowDoWeUseThemExample extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction
    // parsedData: InteractionHandler.ParseResult<this>
  ) {
    // ping team, once
    const channel = interaction.channel!;
    const messages = await channel.messages.fetch();
    if (channel.type !== ChannelType.GuildText) return;

    const found = await messages.filter((msg) => msg.author.id === channel.name);
    if (found.size === 0)
      return messageFail(interaction, 'Please answer the questions, before pressing the button.');

    // gray out button
    interaction.message.edit({ components: [buttons] });

    if (channel.parentId !== config.checkin.categoryID)
      return messageFail(interaction, 'This channel is not a check-in channel.');
    await client.functions.get('ENGINE_checkin_postReaction').run(interaction);
  }

  public async parse(interaction: ButtonInteraction) {
    if (interaction.customId !== 'checkin_submit') return this.none();
    await interaction.deferReply();
    if (!interaction.guildId) return this.none();
    return this.some();
  }
}
