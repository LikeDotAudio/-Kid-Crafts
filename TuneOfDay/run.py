#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve from the script directory
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Route default requests or lowercase queries to Index.htm (with capital 'I')
        if self.path == '/' or self.path == '/index.html' or self.path == '/index.htm' or self.path == '/Index.html':
            self.path = '/Index.htm'
        return super().do_GET()

def run_server():
    port = PORT
    handler = CustomHTTPRequestHandler
    
    # Check for port conflicts and find the next available port
    while port < PORT + 100:
        try:
            # Allow reusing address to prevent "Address already in use" errors on restarts
            socketserver.TCPServer.allow_reuse_address = True
            with socketserver.TCPServer(("", port), handler) as httpd:
                url = f"http://localhost:{port}"
                print("======================================================")
                print("          🎵 Tune Of Day - Web Server 🎵              ")
                print("======================================================")
                print(f"  Server started successfully: {url}")
                print(f"  Serving files from: {DIRECTORY}")
                print("  Press Ctrl+C to terminate.")
                print("======================================================")
                
                # Attempt to open browser automatically
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nWeb server stopped. Goodbye!")
        sys.exit(0)
