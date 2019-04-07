export class TelegramRouter {
  private routes: { route: string, callback: Function}[] = [];

  public route(route: string, callback: Function): TelegramRouter {
    this.routes.push({route, callback});
    return this;
  }

  public match(route: string, message) {
    if (!route) {
      return;
    }

    for (const routeConfig of this.routes) {
      if (route.startsWith(routeConfig.route)) {
        const chatId = message.chat.id;
        return routeConfig.callback(chatId, message);
      }
    }
  }
}