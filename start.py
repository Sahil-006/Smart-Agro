#!/usr/bin/env python3
"""
Smart-Agro Interactive Launcher & Controller
Run this script to start Smart-Agro locally on your laptop for offline or online demonstrations.
"""

import os
import sys
import subprocess
import time
import webbrowser
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "Frontend")
BACKEND_DIR = os.path.join(ROOT_DIR, "Backend")

# Detect Python executable in virtualenv or fallback to system python
VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable

processes = []

def cleanup(*args):
    """Cleanly terminate all spawned subprocesses."""
    print("\n🛑 Shutting down Smart-Agro services...")
    for p in processes:
        try:
            if sys.platform == "win32":
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                p.terminate()
        except Exception:
            pass
    print("✨ All services stopped. Goodbye!\n")
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def set_frontend_api_url(url):
    """Update Frontend/.env VITE_API_URL."""
    env_path = os.path.join(FRONTEND_DIR, ".env")
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    
    updated = False
    new_lines = []
    for line in lines:
        if line.startswith("VITE_API_URL="):
            new_lines.append(f"VITE_API_URL={url}\n")
            updated = True
        else:
            new_lines.append(line)
    if not updated:
        new_lines.append(f"VITE_API_URL={url}\n")

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print(f"🔧 Frontend API configured: {url}")

def run_backend():
    print(f"🚀 Starting Backend API server on http://localhost:5000 ...")
    p = subprocess.Popen(
        [VENV_PYTHON, "app1.py"],
        cwd=BACKEND_DIR,
        shell=False
    )
    processes.append(p)
    return p

def run_frontend(mode="development"):
    print(f"🚀 Starting Frontend Vite Dev Server on http://localhost:5173 ...")
    cmd = "npm run dev"
    if mode == "production":
        cmd = "npm run dev -- --mode production"
    p = subprocess.Popen(
        cmd,
        cwd=FRONTEND_DIR,
        shell=True
    )
    processes.append(p)
    return p

def print_banner():
    print("=" * 68)
    print("   🌱 SMART-AGRO : AUTONOMOUS AGRO-SOLAR PLATFORM (LOCAL LAUNCHER)")
    print("=" * 68)
    print("  [1] Full Local Offline Demo (Local Flask Backend + Local Vite UI)")
    print("      • Best for: Laptop presentations, offline college demos, full speed")
    print("      • UI: http://localhost:5173  |  API: http://localhost:5000")
    print()
    print("  [2] Hybrid Demo (Local Vite UI + Cloud Render Backend)")
    print("      • Best for: Testing frontend locally with cloud database")
    print("      • UI: http://localhost:5173  |  API: https://smart-agro-rogp.onrender.com")
    print()
    print("  [3] Backend API Only (Port 5000)")
    print("  [4] Frontend UI Only (Port 5173)")
    print("  [5] Build Production Bundle for Vercel (npm run build)")
    print("  [0] Exit")
    print("=" * 68)

def main():
    print_banner()
    try:
        choice = input("👉 Enter choice (0-5) [Default 1]: ").strip()
    except (EOFError, KeyboardInterrupt):
        cleanup()
        return

    if choice == "" or choice == "1":
        set_frontend_api_url("http://localhost:5000")
        run_backend()
        time.sleep(2)
        run_frontend("development")
        time.sleep(2)
        print("\n🌐 Opening http://localhost:5173 in your default browser...")
        try:
            webbrowser.open("http://localhost:5173")
        except Exception:
            pass
        print("\n✅ Smart-Agro is running locally! Press Ctrl+C at any time to stop.\n")
        while True:
            time.sleep(1)

    elif choice == "2":
        set_frontend_api_url("https://smart-agro-rogp.onrender.com")
        run_frontend("production")
        time.sleep(2)
        print("\n🌐 Opening http://localhost:5173 in your default browser...")
        try:
            webbrowser.open("http://localhost:5173")
        except Exception:
            pass
        print("\n✅ Smart-Agro Frontend is running (connected to Render)! Press Ctrl+C to stop.\n")
        while True:
            time.sleep(1)

    elif choice == "3":
        run_backend()
        print("\n✅ Smart-Agro Backend is running on http://localhost:5000! Press Ctrl+C to stop.\n")
        while True:
            time.sleep(1)

    elif choice == "4":
        run_frontend()
        time.sleep(2)
        webbrowser.open("http://localhost:5173")
        print("\n✅ Smart-Agro Frontend is running on http://localhost:5173! Press Ctrl+C to stop.\n")
        while True:
            time.sleep(1)

    elif choice == "5":
        print("📦 Building production bundle...")
        subprocess.run("npm --prefix Frontend run build", shell=True)
        print("\n✅ Build complete! Files are ready in Frontend/dist.\n")

    elif choice == "0":
        print("Goodbye!")
        sys.exit(0)
    else:
        print("Invalid choice. Exiting.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        cleanup()
