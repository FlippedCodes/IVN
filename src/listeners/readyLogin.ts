import { Listener } from '@sapphire/framework';

import { type Client, Events } from 'discord.js';

export class ReadyListener extends Listener<typeof Events.ClientReady> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: Events.ClientReady,
    });
  }

  public run(client: Client) {
    const { username, id } = client.user!;
    this.container.logger.info(`🔓 Successfully logged in as "${username}" (${id})!`);
  }
}
