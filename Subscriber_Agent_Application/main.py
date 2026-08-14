import webview
import threading
from server import run_server

if __name__ == "__main__":
    # Start the FastAPI server in a background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Create Native Desktop Window using PyWebView
    # It points to the local FastAPI server which serves the compiled React app
    window = webview.create_window(
        'OneSmarter Quant', 
        'http://127.0.0.1:8001/', 
        width=1200, 
        height=800,
        background_color='#0b0f19',
        frameless=False
    )
    
    # Start the native window event loop
    webview.start()
