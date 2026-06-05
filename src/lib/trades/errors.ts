export class TradeError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 403 | 404 | 409 = 400,
    readonly code = "TRADE_ERROR",
  ) {
    super(message);
    this.name = "TradeError";
  }
}
