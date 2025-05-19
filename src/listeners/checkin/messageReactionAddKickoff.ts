import handlebars from 'handlebars';

import { Listener } from '@sapphire/framework';

import { db } from '../../lib/database/connect';

import {
  type MessageReaction,
  type MessageActionRowComponentBuilder,
  Events,
  User,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  userMention,
  messageLink,
  channelMention,
} from 'discord.js';

const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
  new ButtonBuilder()
    .setCustomId('checkin_submit')
    .setEmoji('👌')
    .setLabel("I'm ready!")
    .setStyle(ButtonStyle.Primary),
]);

export class MessageReactionAddListener extends Listener<typeof Events.MessageReactionAdd> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageReactionAdd,
    });
  }

  public async run(reaction: MessageReaction, user: User) {
    // get DB emoji, channel and message ID
    const guildDB = await db.query.guildTable.findFirst({
      where: (guildTable, { eq, and }) =>
        and(eq(guildTable.guildID, reaction.message.guildId || ''), eq(guildTable.enabled, true)),
      with: {
        verifiedUsers: true,
        guildVerificationSetting: {
          columns: {
            enabled: true,
            kickoffEmoji: true,
            kickoffChannelID: true,
            kickoffMessageID: true,
            checkinCategoryID: true,
            checkinMessageInstructions: true,
            verificationInstructionMessageID: true,
            verificationInstructionChannelID: true,
          },
          with: {
            guildSettingCheckinRoles: {
              columns: { checkinRoleID: true },
            },
          },
        },
      },
    });
    // check if feature is enabled and guild exists
    // verification feature doesn't have to be checked, because its done by the query
    if (!guildDB) return;
    if (!guildDB.guildVerificationSetting.enabled) return;
    // check emoji, channel and message ID
    if (guildDB.guildVerificationSetting.kickoffEmoji !== reaction.emoji.toString()) return;
    if (guildDB.guildVerificationSetting.kickoffChannelID !== reaction.message.channelId) return;
    if (guildDB.guildVerificationSetting.kickoffMessageID !== reaction.message.id) return;

    // TODO: add DB table to check if user is already checked in and if they are already verified in DB table

    // Create channel, set settings and edit channel topic
    const topic = `Ticket opened: ${Date.now()}
    Username: ${user.tag}
    Avatar link: ${user.displayAvatarURL({ extension: 'png', size: 4096 })}`;

    // create channel
    const guild = reaction.message.guild!;
    if (!guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      // TODO: Log into guild log channel
      return this.container.logger.error(
        `${this.event.toString()}[${this.name}] Missing "ManageChannels" permissions on server ${guild.id}!`
      );
    }
    const channel = await guild.channels.create({
      name: user.id,
      topic,
      parent: guildDB.guildVerificationSetting.checkinCategoryID,
    });
    if (!channel) return this.container.logger.error('Channel was not created!');
    // applies permission from category and then give users permissions to see the channel
    await channel.lockPermissions().catch(this.container.logger.error);
    await channel.permissionOverwrites
      .edit(user.id, { ViewChannel: true })
      .catch(this.container.logger.error);

    // get checkin instructions and post in channel
    // TODO: Move messages to templating channel
    const checkinMessageInstructions = handlebars.compile(
      guildDB.guildVerificationSetting.checkinMessageInstructions,
      { noEscape: true }
    );
    await channel
      .send({
        content: checkinMessageInstructions({
          user: userMention(user.id),
          dateFormat: guildDB.dateFormat,
          instructionsLink: messageLink(
            guildDB.guildVerificationSetting.verificationInstructionChannelID!,
            guildDB.guildVerificationSetting.verificationInstructionMessageID!
          ),
          instructionsChannel: channelMention(
            guildDB.guildVerificationSetting.verificationInstructionChannelID!
          ),
        }),
        components: [buttons],
      })
      .catch(this.container.logger.error);

    // remove user reaction
    reaction.users.remove(user);
  }
}
