import customtkinter as ctk
from gui.login import LoginFrame
from gui.dashboard import DashboardFrame
from api.client import AuthClient

class SubscriberApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("OneSmarter - Subscriber Agent")
        self.geometry("800x600")
        
        self.auth_client = AuthClient()
        self.token = self.auth_client.get_token()
        
        self.current_frame = None
        
        if self.token:
            self.show_dashboard()
        else:
            self.show_login()

    def switch_frame(self, new_frame_class, **kwargs):
        if self.current_frame is not None:
            self.current_frame.destroy()
            
        self.current_frame = new_frame_class(self, **kwargs)
        self.current_frame.pack(fill="both", expand=True)

    def show_login(self):
        self.switch_frame(LoginFrame, on_login_success=self.on_login_success)

    def show_dashboard(self):
        # Refresh token in case it was just set
        self.token = self.auth_client.get_token()
        self.switch_frame(DashboardFrame, token=self.token, on_logout=self.logout)

    def on_login_success(self):
        self.show_dashboard()
        
    def logout(self):
        self.auth_client.logout()
        self.token = None
        self.show_login()
