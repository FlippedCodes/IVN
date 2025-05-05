import { Listener } from '@sapphire/framework';

import { type MessageReaction, Events } from 'discord.js';

import { db } from '../db/connect';

export class MessageReactionAddListener extends Listener<typeof Events.MessageReactionAdd> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageReactionAdd,
    });
  }

  public async run(reaction: MessageReaction) {
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
          },
        },
      },
    });
    console.log(guildDB);

    // check if guild is enabled
    // check if feature is enabled
    // get emoji, channel and message ID
  }
}
