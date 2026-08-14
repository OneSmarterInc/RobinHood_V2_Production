import customtkinter as ctk
from tkinter import messagebox
from api.client import AuthClient
import os

class LoginFrame(ctk.CTkFrame):
    def __init__(self, master, on_login_success):
        # Premium Dark Background for the whole frame
        super().__init__(master, fg_color="#0b0f19")
        self.on_login_success = on_login_success
        self.auth_client = AuthClient()
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Central Glassmorphism Card
        self.card = ctk.CTkFrame(self, width=450, height=550, corner_radius=20, fg_color="#151b2b", border_width=1, border_color="#2a324b")
        self.card.grid(row=0, column=0, pady=20, padx=20)
        self.card.grid_propagate(False)
        
        # Typography & Aesthetics
        self.card.grid_columnconfigure(0, weight=1)
        
        logo_label = ctk.CTkLabel(self.card, text="OS", font=ctk.CTkFont(family="Inter", size=48, weight="bold"), text_color="#00ffcc")
        logo_label.pack(pady=(50, 10))
        
        title = ctk.CTkLabel(self.card, text="OneSmarter Quant", font=ctk.CTkFont(family="Inter", size=26, weight="bold"), text_color="#ffffff")
        title.pack(pady=(0, 5))
        
        subtitle = ctk.CTkLabel(self.card, text="Welcome back, Agent.", font=ctk.CTkFont(family="Inter", size=14), text_color="#8892b0")
        subtitle.pack(pady=(0, 40))
        
        # Inputs with modern styling
        self.username_entry = ctk.CTkEntry(
            self.card, 
            placeholder_text="Enter your Username", 
            width=300, 
            height=45, 
            font=ctk.CTkFont(family="Inter", size=14),
            corner_radius=8,
            fg_color="#1c2438",
            border_color="#3a4563",
            text_color="#ffffff"
        )
        self.username_entry.pack(pady=10, padx=20)
        
        self.password_entry = ctk.CTkEntry(
            self.card, 
            placeholder_text="Enter your Password", 
            show="*", 
            width=300, 
            height=45, 
            font=ctk.CTkFont(family="Inter", size=14),
            corner_radius=8,
            fg_color="#1c2438",
            border_color="#3a4563",
            text_color="#ffffff"
        )
        self.password_entry.pack(pady=10, padx=20)
        
        # Premium Neon Button
        self.login_btn = ctk.CTkButton(
            self.card, 
            text="INITIALIZE AGENT", 
            command=self.do_login, 
            width=300, 
            height=45,
            font=ctk.CTkFont(family="Inter", size=15, weight="bold"),
            corner_radius=8,
            fg_color="#00ccaa",
            hover_color="#00ffcc",
            text_color="#0b0f19"
        )
        self.login_btn.pack(pady=(30, 20), padx=20)
        
        # Footer text
        footer = ctk.CTkLabel(self.card, text="Secure AES-256 Encrypted Connection", font=ctk.CTkFont(family="Inter", size=11), text_color="#556080")
        footer.pack(side="bottom", pady=20)
        
    def do_login(self):
        username = self.username_entry.get()
        password = self.password_entry.get()
        
        if not username or not password:
            messagebox.showerror("Authentication Failed", "Username and Password are required.")
            return
            
        self.login_btn.configure(text="Authenticating...", state="disabled", fg_color="#3a4563")
        self.update()
        
        # Hit the real Django API
        success, message = self.auth_client.login(username, password)
        
        self.login_btn.configure(text="INITIALIZE AGENT", state="normal", fg_color="#00ccaa")
        
        if success:
            self.on_login_success()
        else:
            messagebox.showerror("Authentication Failed", message)
