from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
print("dotenv_path found:", dotenv_path)

load_dotenv(override=True)  # or ".env"
print("Current working directory:", os.getcwd())
print("MEFTEH:", os.getenv("MEFTEH"))


app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("MEFTEH"))

@app.route("/api/nutrition/recipes", methods=["POST"])
def generate_nutrition_advice():
    try:
        data = request.get_json(force=True)
        user_query = data.get("query", "").strip()
        conversation_history = data.get("conversationHistory", [])

        if not user_query:
            return jsonify({"response": "Pouvez-vous préciser votre question sur votre régime ou vos ingrédients."}), 400

        system_prompt = (
            "Remarque importante : ecrit de maniere professionnelle et bienveillante. sans emoji. sans tiret successif. et sous forme de paragraphe. "
            "ne pas trop détaillé. "
            "Tu es un nutritionniste expert et bienveillant. "
            "Ton rôle est d’analyser le régime alimentaire de l’utilisateur et de lui proposer un plan ou des recettes équilibrées selon ses objectifs et les ingrédients disponibles. "
            "Exprime-toi en français clair et structuré, avec des conseils pratiques et bienveillants."
        )

        messages = [{"role": "system", "content": system_prompt}]

        for msg in conversation_history:
            if msg.get("role") in ["user", "assistant"] and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": user_query})

        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            temperature=0.8,
            max_completion_tokens=800,
            top_p=1,
            reasoning_effort="medium"
        )

        response_text = completion.choices[0].message.content.strip()

        return jsonify({"response": response_text}), 200

    except Exception as e:
        print("MEFTEH:", os.getenv("MEFTEH"))
        print("Erreur serveur:",os.getenv("MEFTEH"), e)
        return jsonify({
            "response": (
                "Je n’ai pas pu générer de réponse pour le moment. "
                "Voici un conseil simple : privilégiez les aliments riches en fibres, buvez beaucoup d’eau et évitez les produits trop sucrés."
            )
        }), 500

if __name__ == "__main__":
    print("Serveur Flask du chatbot nutritionniste en cours d’exécution sur http://127.0.0.1:3000")
    app.run(host="0.0.0.0", port=9000, debug=True)
