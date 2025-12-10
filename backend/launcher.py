#!/usr/bin/env python3
"""
Unified backend launcher for the four services:
- Food image classifier (FastAPI)
- Medical RAG chatbot (Flask)
- Nutritionist chatbot (Flask + Groq)
- Real-time Chat/Messaging (Node.js + Socket.IO)
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def print_banner() -> None:
    print("\n" + "=" * 60)
    print("   MOTHER HEALTH BACKEND LAUNCHER".center(60))
    print("=" * 60 + "\n")


def print_menu() -> None:
    print("Select an option:")
    print("  1. Food classifier API (FastAPI, port 8000)")
    print("  2. Medical RAG API (Flask, port 5000)")
    print("  3. Nutritionist chatbot API (Flask, port 9000)")
    print("  4. Chat/Messaging API (Node.js, port 8081) ⭐ REQUIRED FOR MESSAGING")
    print("  5. Start ALL services (8000 + 5000 + 9000 + 8081)")
    print("  6. Exit")
    print()


def run_food_api() -> None:
    print("\n" + "=" * 60)
    print("Starting Food Classifier API...".center(60))
    print("=" * 60)
    print("Endpoint: http://localhost:8000/api/food\n")
    cmd = [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    try:
        subprocess.run(cmd, cwd=ROOT / "backend")
    except KeyboardInterrupt:
        print("\n\nFood API stopped.")


def run_rag_api() -> None:
    print("\n" + "=" * 60)
    print("Starting Medical RAG API...".center(60))
    print("=" * 60)
    print("Endpoint: http://localhost:5000/chat\n")
    cmd = [sys.executable, "app.py"]
    try:
        subprocess.run(cmd, cwd=ROOT / "Modele_rag")
    except KeyboardInterrupt:
        print("\n\nRAG API stopped.")


def run_nutritionist_api() -> None:
    print("\n" + "=" * 60)
    print("Starting Nutritionist Chatbot API...".center(60))
    print("=" * 60)
    print("Endpoint: http://localhost:9000/api/nutrition/recipes\n")
    cmd = [sys.executable, "Nutrutionist__backend.py"]
    try:
        subprocess.run(cmd, cwd=ROOT / "Nutritionist")
    except KeyboardInterrupt:
        print("\n\nNutritionist API stopped.")


def run_chat_api() -> None:
    print("\n" + "=" * 60)
    print("Starting Chat/Messaging API...".center(60))
    print("=" * 60)
    print("Endpoint: http://localhost:8081")
    print("WebSocket: ws://localhost:8081")
    print("\n⭐ This enables messaging for:")
    print("   - Mother/Doctor messaging")
    print("   - Teen messaging")
    print("   - Real-time chat with Socket.IO\n")
    cmd = ["npm", "run", "dev"]
    try:
        subprocess.run(cmd, cwd=ROOT / "chat-app-backend", shell=True)
    except KeyboardInterrupt:
        print("\n\nChat API stopped.")


def run_all_servers() -> None:
    print("\n" + "=" * 60)
    print("Starting ALL backend services...".center(60))
    print("=" * 60)
    services = [
        ("Food Classifier (FastAPI)", [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], ROOT / "backend"),
        ("Medical RAG (Flask)", [sys.executable, "app.py"], ROOT / "Modele_rag"),
        ("Nutritionist Chatbot (Flask)", [sys.executable, "Nutrutionist__backend.py"], ROOT / "Nutritionist"),
        ("Chat/Messaging (Node.js)", ["npm", "run", "dev"], ROOT / "chat-app-backend"),
    ]

    processes: list[tuple[str, subprocess.Popen]] = []
    try:
        for name, cmd, cwd in services:
            print(f"-> Launching {name}...")
            # Use shell=True on Windows for npm commands
            use_shell = "npm" in cmd[0] if cmd else False
            proc = subprocess.Popen(cmd, cwd=cwd, shell=use_shell)
            processes.append((name, proc))

        print("\nAll services started. Press Ctrl+C to stop everything.\n")
        for _, proc in processes:
            proc.wait()
    except KeyboardInterrupt:
        print("\nStopping all services...")
    finally:
        for name, proc in processes:
            if proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    proc.kill()
                print(f"Stopped {name}.")
        print("All services stopped.\n")


def main() -> None:
    print_banner()
    while True:
        print_menu()
        try:
            choice = input("Enter your choice (1-6): ").strip()
            if choice == "1":
                run_food_api()
            elif choice == "2":
                run_rag_api()
            elif choice == "3":
                run_nutritionist_api()
            elif choice == "4":
                run_chat_api()
            elif choice == "5":
                run_all_servers()
            elif choice == "6":
                print("\nExiting backend launcher. Goodbye!")
                break
            else:
                print("Invalid choice. Please select 1-6.\n")
        except KeyboardInterrupt:
            print("\n\nExiting backend launcher. Goodbye!")
            break
        except Exception as exc:
            print(f"Error: {exc}\n")


if __name__ == "__main__":
    main()
