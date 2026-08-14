"""
Subscriber side. Turns a verified document plus the subscriber's own account
state into a concrete order list.

This file is the whole personalization layer. It is ordinary arithmetic with
no model in the loop, which is the point: the difference between two
subscribers' order lists comes from their accounts and from the choices they
froze at install, not from anyone's judgment and not from a language model's
sampling.

The published document says what the model holds. The subscriber's own config
says how they want it held in their account. Prices come from the subscriber's
broker. The publisher never sends a price and never learns a fill.
"""

from decimal import Decimal, ROUND_DOWN


def _d(x):
    return Decimal(str(x))


def _money(x):
    return _d(x).quantize(Decimal("0.01"), rounding=ROUND_DOWN)


DEFAULT_CONFIG = {
    # Frozen by the subscriber at install. Not sent by the publisher.
    "entry_convention": "published_weight",   # or "equal_weight"
    "min_trade_notional_usd": 5.0,
    "fractional_shares": True,
    "on_insufficient_cash": "scale_pro_rata",
    "on_unavailable_symbol": "skip_leg",
}


def compute_orders(document, account, quotes, today, config=None):
    """Deterministic. Same document, account and config always give the same orders."""
    c = document["constraints"]
    cfg = {**DEFAULT_CONFIG, **(config or {})}
    targets = document["targets"]["positions"]
    notes, orders, holds = [], [], []

    equity = _d(account["cash_usd"])
    for sym, pos in account["positions"].items():
        equity += _d(pos["shares"]) * _d(quotes[sym])

    held_now = {s: _d(p["shares"]) for s, p in account["positions"].items() if _d(p["shares"]) > 0}
    sold_today = set(account.get("sold_today", []))

    # Entry sizing. Either the weight the model publishes, or an equal split
    # across the model's position count, depending on what the subscriber froze.
    equal_weight = cfg["entry_convention"] == "equal_weight"
    if equal_weight and targets:
        deployed = sum((_d(v) for v in targets.values()), Decimal(0))
        entry_pct = deployed / _d(len(targets))
    else:
        entry_pct = None

    # --- exits: model no longer holds it, so neither do we ---------------
    for sym in sorted(held_now):
        if sym in targets:
            continue
        value = held_now[sym] * _d(quotes[sym])
        if value < _d(cfg["min_trade_notional_usd"]):
            holds.append(f"{sym}: exit skipped, ${value:.2f} below "
                         f"${cfg['min_trade_notional_usd']:.2f} minimum trade size")
            continue
        orders.append({"symbol": sym, "side": "SELL", "shares": float(held_now[sym]),
                       "notional_usd": float(_money(value)),
                       "reason": "model exited this position"})

    # --- entries: model holds it and we do not ---------------------------
    room = _d(c["max_positions"]) - (len(held_now) - sum(
        1 for o in orders if o["side"] == "SELL"))
    for sym in sorted(targets):
        if sym in held_now:
            holds.append(f"{sym}: already held, no maintenance rebalancing")
            continue
        if sym in sold_today:
            holds.append(f"{sym}: sold this session, re-entry blocked")
            continue
        if room <= 0:
            holds.append(f"{sym}: book at max_positions ({c['max_positions']}), entry skipped")
            continue
        pct = entry_pct if entry_pct is not None else _d(targets[sym])
        value = equity * pct / Decimal(100)
        if value < _d(cfg["min_trade_notional_usd"]):
            holds.append(f"{sym}: entry ${value:.2f} below "
                         f"${cfg['min_trade_notional_usd']:.2f} minimum trade size")
            continue
        orders.append({"symbol": sym, "side": "BUY", "shares": 0.0,
                       "notional_usd": float(_money(value)),
                       "reason": f"model entry at {pct:.2f}% of equity"})
        room -= 1

    if equal_weight and any(o["side"] == "BUY" for o in orders):
        notes.append(f"Entry convention: equal weight. The model's {deployed:.2f}% "
                     f"deployed is split evenly at {entry_pct:.2f}% across "
                     f"{len(targets)} names (subscriber config, frozen at install).")

    # --- cash sufficiency ------------------------------------------------
    buys = sum(_d(o["notional_usd"]) for o in orders if o["side"] == "BUY")
    sells = sum(_d(o["notional_usd"]) for o in orders if o["side"] == "SELL")
    available = _d(account["cash_usd"]) + sells
    if buys > available and buys > 0:
        scale = available / buys
        notes.append(f"Buy side {_money(buys)} exceeds available {_money(available)}; "
                     f"scaled pro rata by {scale:.4f} per subscriber config.")
        for o in orders:
            if o["side"] == "BUY":
                o["notional_usd"] = float(_money(_d(o["notional_usd"]) * scale))

    # --- shares from the subscriber's own prices -------------------------
    places = Decimal("0.0001") if cfg["fractional_shares"] else Decimal("1")
    for o in orders:
        if o["side"] == "BUY":
            o["shares"] = float((_d(o["notional_usd"]) / _d(quotes[o["symbol"]]))
                                .quantize(places, rounding=ROUND_DOWN))

    return {
        "equity_usd": float(_money(equity)),
        "entry_convention": cfg["entry_convention"],
        "orders": sorted(orders, key=lambda o: (o["side"], o["symbol"])),
        "holds": holds,
        "notes": notes,
    }
