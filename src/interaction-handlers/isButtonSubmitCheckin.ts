import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';

import { DateTime } from 'luxon';

import { db } from '../lib/database/connect';

import { messageFail } from '../lib/discord/generic';

import {
  type ButtonInteraction,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  type MessageActionRowComponentBuilder,
  ChannelType,
  EmbedBuilder,
  Message,
  Collection,
  roleMention,
} from 'discord.js';

const buttonsOld = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
  new ButtonBuilder()
    .setCustomId('checkin_submit_disabled')
    .setEmoji('👌')
    .setLabel(`I'm ready!`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),
]);

const buttonsCheckinCtrl = (checkedText: string) =>
  new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('checkin_allow')
      .setEmoji('👌')
      .setLabel(checkedText !== 'Already checked ID' ? 'Verfiy first' : 'Allow')
      .setDisabled(checkedText !== 'Already checked ID')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('checkin_deny')
      .setEmoji('✋')
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger),
  ]);

const buttonsVerificationSystemMod = (
  buttonsCheckinCtrl: ActionRowBuilder<MessageActionRowComponentBuilder>,
  checked: boolean,
  checkedText: string
) =>
  buttonsCheckinCtrl.addComponents([
    new ButtonBuilder()
      .setCustomId('checkin_verifSys_checked')
      .setEmoji('🔞')
      .setLabel(checkedText)
      .setDisabled(checked)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('checkin_verifSys_idtutorial')
      .setEmoji('🪪')
      .setLabel('ID Tutorial')
      .setDisabled(checked)
      .setStyle(ButtonStyle.Secondary),
  ]);

async function getDate(
  channelName: string,
  messages: Collection<string, Message<boolean>>,
  dateFormat: string
) {
  // match date
  const dateRegEx = /\d{4}[-]\d{2}[-]\d{2}/gm;
  const found = await messages.filter(
    (msg) => msg.content.match(dateRegEx) && msg.author.id === channelName
  );
  if (!found.size) return;
  // TS: message is gonna be there. As it's tested previously
  const coreMessage = found.entries().next().value![1].content;
  const rawDate = coreMessage.match(dateRegEx)![0];
  return DateTime.fromFormat(rawDate, dateFormat);
}

export class IsButtonSubmitCheckin extends InteractionHandler {
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
    // get vars
    const channel = interaction.channel!;
    const messages = await channel.messages.fetch();
    // check if its a guild text channel
    if (channel.type !== ChannelType.GuildText) return;

    // get DB details
    const guildDB = await db.query.guildTable.findFirst({
      where: (guildTable, { eq, and }) =>
        and(eq(guildTable.guildID, `${channel.guild}`), eq(guildTable.enabled, true)),
      with: {
        guildVerificationSetting: {
          columns: {
            enabled: true,
            enabledAgeVerification: true,
            checkinCategoryID: true,
            verifierRoleID: true,
          },
          with: {
            // guildSettingCheckinRoles: {
            //   columns: { checkinRoleID: true },
            // },
            guilds: {
              columns: {
                dateFormat: true,
              },
            },
          },
        },
      },
    });

    if (!(guildDB && guildDB.guildVerificationSetting.enabled))
      return messageFail(
        interaction,
        'Unable to find guild settings, is this feature disabled?\nPlease inform a server admin about this.'
      );

    // check if channel is a checkin channel
    if (channel.parentId !== guildDB.guildVerificationSetting.checkinCategoryID)
      return messageFail(interaction, 'This channel is not a check-in channel.');

    // check if user send a message
    const found = await messages.filter((msg) => msg.author.id === channel.name);
    if (found.size === 0)
      return messageFail(
        interaction,
        'Please follow the instructions above, before pressing the button.'
      );

    // gray out start button
    interaction.message.edit({ components: [buttonsOld] });

    // get user info
    const userID = channel.name;

    // set default values for buttons
    let checked = false;
    let checkedText = 'ID checked';

    // check if feature is enabled, and start age verification
    if (guildDB.guildVerificationSetting.enabledAgeVerification) {
      // pre-verification of parsed DoB
      // parse date from send messages in checkin channel
      const date = await getDate(
        channel.name,
        messages,
        guildDB.guildVerificationSetting.guilds.dateFormat
      );
      // check if date is found
      if (date && date.isValid) {
        const age = DateTime.now().diff(date).years;
        if (age <= 17) {
          messageFail(
            interaction,
            "Hello! You don't seem to be old enough for our server.\nPlease come back, when you are old enough."
          );
          checked = true;
          checkedText = 'Not old enough';
        }
      }

      // check DB if user is already verified
      const userDoB = await db.query.verifiedUserTable.findFirst({
        where: (verifiedUserTable, { eq }) => eq(verifiedUserTable.userID, `${userID}`),
        columns: {
          createdAt: true,
        },
      });
      // set button values, if user is verified
      if (userDoB) {
        checked = true;
        checkedText = 'Already checked ID';
      }
    }

    // initial checks passed

    // prepare buttons with correct texts and verification system modding
    const buttonsNew = buttonsCheckinCtrl(checkedText);
    if (guildDB.guildVerificationSetting.enabledAgeVerification)
      buttonsVerificationSystemMod(buttonsNew, checked, checkedText);

    // prepare embed for button row
    const embedCheckinCtrl = new EmbedBuilder()
      .setColor('Green')
      .setDescription('Please wait for a team member to review your answers.')
      .setFooter({ text: 'The buttons are for staff only.' });

    // ping team, if not pinged already and only if user uses button/command
    if (guildDB.guildVerificationSetting.verifierRoleID) {
      const mentions = messages.filter((message) =>
        message.mentions.roles.has(guildDB.guildVerificationSetting.verifierRoleID!)
      );
      if (mentions.size === 0 && interaction.user.id === userID)
        channel.send(roleMention(guildDB.guildVerificationSetting.verifierRoleID));
    } else this.container.logger.error(`[${this.name}] No verifierRoleID in ${channel.guildId}!`);
    // send all buttons that are needed
    interaction.reply({ embeds: [embedCheckinCtrl], components: [buttonsNew] });
  }

  public async parse(interaction: ButtonInteraction) {
    if (interaction.customId !== 'checkin_submit') return this.none();
    await interaction.deferReply();
    if (!interaction.guildId) return this.none();
    return this.some();
  }
}
