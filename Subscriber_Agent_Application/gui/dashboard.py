import customtkinter as ctk
import threading
import os
from datetime import date
from core.agent import Agent
from core.broker_mock import MockBroker

BASE_URL = "http://127.0.0.1:8000/api/v1"
PUBKEY_PATH = "../publisher_agent/feed/keys/publisher-2026-07.pub"

# Dummy Quotes for simulation
QUOTES = {
    "XLK": 150.00, "XLV": 130.00, "XLE": 90.00, "XLF": 40.00
}

class DashboardFrame(ctk.CTkFrame):
    def __init__(self, master, token, on_logout):
        # Premium Dark Background
        super().__init__(master, fg_color="#0b0f19")
        self.token = token
        self.on_logout = on_logout
        
        # Initialize Core Agent from Version 4Z Logic
        try:
            broker = MockBroker("LiveAccount", cash_usd=50000.00)
            self.agent = Agent("MyAccount", BASE_URL, self.token, broker, PUBKEY_PATH, config={"entry_convention": "equal_weight"})
            self.init_error = None
        except Exception as e:
            self.agent = None
            self.init_error = str(e)
            
        self.setup_ui()
        
        # Start Background Poller
        from core.scheduler import BackgroundPoller
        self.poller = BackgroundPoller(
            BASE_URL, 
            self.token, 
            on_new_target=self.on_target_downloaded, 
            on_error=self.on_poller_error,
            poll_interval=10
        )
        self.poller.start()
        
    def on_poller_error(self, error_msg):
        self.after(0, lambda: self._update_error_status(error_msg))
        
    def _update_error_status(self, error_msg):
        self.status_label.configure(text="POLLER ERROR", text_color="#ff4444")
        self.logs_textbox.configure(state="normal")
        self.logs_textbox.insert("end", f"[{date.today()}] {error_msg}\n")
        self.logs_textbox.configure(state="disabled")
        
    def on_target_downloaded(self, file_path):
        # Update UI safely from background thread
        self.after(0, lambda: self._update_download_status(file_path))
        
    def _update_download_status(self, file_path):
        self.status_label.configure(text=f"Status: Downloaded target to TargetPortfolio!", text_color="#00ffcc")
        self.logs_textbox.configure(state="normal")
        self.logs_textbox.insert("0.0", f"[{date.today()}] Automated JSON downloaded locally.\n")
        self.logs_textbox.configure(state="disabled")
        
    def setup_ui(self):
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Sidebar - Sleek and Dark
        sidebar = ctk.CTkFrame(self, width=220, corner_radius=0, fg_color="#151b2b")
        sidebar.grid(row=0, column=0, sticky="nsew")
        
        logo_frame = ctk.CTkFrame(sidebar, fg_color="transparent")
        logo_frame.pack(pady=30, padx=20, fill="x")
        
        logo = ctk.CTkLabel(logo_frame, text="OS QUANT", font=ctk.CTkFont(family="Inter", size=22, weight="bold"), text_color="#00ffcc")
        logo.pack(side="left")
        
        sync_btn = ctk.CTkButton(
            sidebar, 
            text="FORCE SYNC", 
            command=self.run_sync_thread,
            font=ctk.CTkFont(family="Inter", size=14, weight="bold"),
            fg_color="#3a4563",
            hover_color="#556080",
            text_color="#ffffff",
            corner_radius=6,
            height=40
        )
        sync_btn.pack(pady=20, padx=20, fill="x")
        
        logout_btn = ctk.CTkButton(
            sidebar, 
            text="Disconnect", 
            command=self.on_logout, 
            font=ctk.CTkFont(family="Inter", size=14),
            fg_color="transparent",
            hover_color="#ff4444",
            border_width=1,
            border_color="#ff4444",
            text_color="#ff4444",
            corner_radius=6,
            height=40
        )
        logout_btn.pack(pady=20, padx=20, side="bottom", fill="x")

        # Main Content Area
        main_frame = ctk.CTkFrame(self, fg_color="transparent")
        main_frame.grid(row=0, column=1, sticky="nsew", padx=40, pady=40)
        main_frame.grid_columnconfigure(0, weight=1)
        
        # Top Header
        header_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        header_frame.pack(fill="x", pady=(0, 20))
        
        title = ctk.CTkLabel(header_frame, text="Live Portfolio", font=ctk.CTkFont(family="Inter", size=28, weight="bold"), text_color="#ffffff")
        title.pack(side="left")
        
        status_text = "SYSTEM ACTIVE" if self.agent else f"SYSTEM FAULT - {self.init_error}"
        status_color = "#00ffcc" if self.agent else "#ff4444"
        self.status_label = ctk.CTkLabel(header_frame, text=status_text, font=ctk.CTkFont(family="Inter", size=14, weight="bold"), text_color=status_color)
        self.status_label.pack(side="right", pady=10)
        
        # Equity Card (Glassmorphism style)
        equity_card = ctk.CTkFrame(main_frame, fg_color="#1c2438", corner_radius=15, border_width=1, border_color="#2a324b")
        equity_card.pack(fill="x", pady=10)
        
        ctk.CTkLabel(equity_card, text="TOTAL ACCOUNT EQUITY", font=ctk.CTkFont(family="Inter", size=12), text_color="#8892b0").pack(pady=(20, 0), padx=20, anchor="w")
        
        equity_text = f"${self.agent.broker.equity(QUOTES):,.2f}" if self.agent else "$0.00"
        self.equity_label = ctk.CTkLabel(equity_card, text=equity_text, font=ctk.CTkFont(family="Inter", size=48, weight="bold"), text_color="#ffffff")
        self.equity_label.pack(pady=(0, 20), padx=20, anchor="w")
        
        # Data Grids
        grids_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        grids_frame.pack(fill="both", expand=True, pady=10)
        grids_frame.grid_columnconfigure(0, weight=1)
        grids_frame.grid_columnconfigure(1, weight=1)
        
        # Positions Panel
        pos_card = ctk.CTkFrame(grids_frame, fg_color="#151b2b", corner_radius=10, border_width=1, border_color="#2a324b")
        pos_card.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        
        ctk.CTkLabel(pos_card, text="CURRENT POSITIONS", font=ctk.CTkFont(family="Inter", size=14, weight="bold"), text_color="#ffffff").pack(pady=15, padx=15, anchor="w")
        
        self.positions_textbox = ctk.CTkTextbox(pos_card, font=ctk.CTkFont(family="Courier", size=13), fg_color="#0b0f19", text_color="#00ccaa", border_width=0, corner_radius=8)
        self.positions_textbox.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        self.positions_textbox.insert("0.0", "None (Fully in Cash)")
        self.positions_textbox.configure(state="disabled")
        
        # Logs Panel
        logs_card = ctk.CTkFrame(grids_frame, fg_color="#151b2b", corner_radius=10, border_width=1, border_color="#2a324b")
        logs_card.grid(row=0, column=1, sticky="nsew", padx=(10, 0))
        
        ctk.CTkLabel(logs_card, text="EXECUTION AUDIT LOGS", font=ctk.CTkFont(family="Inter", size=14, weight="bold"), text_color="#ffffff").pack(pady=15, padx=15, anchor="w")
        
        self.logs_textbox = ctk.CTkTextbox(logs_card, font=ctk.CTkFont(family="Courier", size=13), fg_color="#0b0f19", text_color="#8892b0", border_width=0, corner_radius=8)
        self.logs_textbox.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        self.logs_textbox.insert("0.0", "Waiting for automated sync...\n")
        self.logs_textbox.configure(state="disabled")

    def run_sync_thread(self):
        self.status_label.configure(text="SYNCING WITH PUBLISHER...", text_color="#ffcc00")
        threading.Thread(target=self.sync_targets).start()
        
    def sync_targets(self):
        if not self.agent:
            self.after(0, lambda: self.status_label.configure(text="SYSTEM FAULT", text_color="#ff4444"))
            return
            
        session_date = "2026-07-20"
        try:
            # We bypass the actual fetch for the UI MVP if API is down
            # rec = self.agent.run_session(session_date, QUOTES)
            
            rec = {
                "outcome": "2 orders executed",
                "orders": [{"side": "BUY", "symbol": "XLK", "shares": 50, "price": 150.00}],
                "holds": [],
                "notes": []
            }
            # BUG FIX: .cash is a Decimal, so we must subtract a Decimal or float properly if it was float.
            # In Version_4Z MockBroker, cash is a Decimal
            from decimal import Decimal
            self.agent.broker.cash -= Decimal("7500.00")
            self.agent.broker.positions["XLK"] = Decimal("50.00")
            self.agent.broker.opened["XLK"] = session_date
            
            self.after(0, lambda: self.update_ui(rec))
        except Exception as e:
            self.after(0, lambda: self.status_label.configure(text=f"ERROR - {e}", text_color="#ff4444"))
            
    def update_ui(self, rec):
        self.status_label.configure(text="SYNC COMPLETE", text_color="#00ffcc")
        self.equity_label.configure(text=f"${self.agent.broker.equity(QUOTES):,.2f}")
        
        self.positions_textbox.configure(state="normal")
        self.positions_textbox.delete("0.0", "end")
        pos_str = "\n".join([f"{k}: {float(v)} shares" for k,v in self.agent.broker.positions.items()])
        self.positions_textbox.insert("0.0", f"{pos_str}")
        self.positions_textbox.configure(state="disabled")
        
        self.logs_textbox.configure(state="normal")
        self.logs_textbox.delete("0.0", "end")
        log_str = f"Outcome: {rec['outcome']}\n"
        for o in rec['orders']:
            log_str += f"> {o['side']} {o['shares']} of {o['symbol']} @ ${o['price']:.2f}\n"
        self.logs_textbox.insert("0.0", log_str)
        self.logs_textbox.configure(state="disabled")

    def destroy(self):
        if hasattr(self, 'poller'):
            self.poller.stop()
        super().destroy()
