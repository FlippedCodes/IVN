import { isMessageInstance } from '@sapphire/discord.js-utilities';

import { Command } from '@sapphire/framework';

import { MessageFlags } from 'discord.js';

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Ping bot to see, if it is alive',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description),
      { idHints: ['1365023683273560185', '1365093238792261684'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const interactionCallbackResponse = await interaction.reply({
      content: `Ping?`,
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });
    const msg = interactionCallbackResponse.resource!.message!;

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
    }

    return interaction.editReply('Failed to retrieve ping :(');
  }
}
