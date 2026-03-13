import json
import os
import re
import numpy as np
from sentence_transformers import SentenceTransformer, util
import pickle


class IPCSuggester:
    """
    Hybrid IPC Suggester combining semantic embeddings with crime-keyword matching.
    This dual approach prevents semantic bleed (e.g., murder being suggested for theft)
    and produces highly accurate, context-aware IPC recommendations.
    """

    def __init__(
        self,
        data_path='ipc_data.json',
        model_name='all-MiniLM-L6-v2',
        cache_path='ipc_embeddings_cache.pkl'
    ):
        self.data_path = data_path
        self.cache_path = cache_path
        self.model = SentenceTransformer(model_name)
        self.ipc_data = self._load_data()
        self.ipc_embeddings = self._load_or_generate_embeddings()

    def _load_data(self):
        """Loads IPC section definitions from the JSON file."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"IPC data file not found at '{self.data_path}'")
        with open(self.data_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _load_or_generate_embeddings(self):
        """
        Loads cached embeddings if available to avoid recomputing.
        We encode 'title + description' together for richer semantic context,
        which reduces overlap between similarly-worded legal descriptions.
        """
        if os.path.exists(self.cache_path):
            print(f"Loading cached embeddings from '{self.cache_path}'...")
            with open(self.cache_path, 'rb') as f:
                return pickle.load(f)

        print("Generating fresh embeddings (this runs once and is then cached)...")
        # Encode TITLE + DESCRIPTION together for much better crime discrimination
        combined_texts = [
            f"{item['title']}: {item['description']}" for item in self.ipc_data
        ]
        embeddings = self.model.encode(combined_texts, convert_to_tensor=True)

        with open(self.cache_path, 'wb') as f:
            pickle.dump(embeddings, f)

        return embeddings

    def _keyword_score(self, incident_text: str, keywords: list) -> tuple:
        """
        Computes a keyword overlap score between the incident and the IPC section.
        Returns a (score, matched_keywords) tuple.
        - score: fraction of IPC keywords present in the incident text (0.0 to 1.0)
        - matched_keywords: list of keywords found in the incident
        """
        if not keywords:
            return 0.0, []

        incident_lower = incident_text.lower()
        matched = [kw for kw in keywords if re.search(r'\b' + re.escape(kw.lower()) + r'\b', incident_lower)]

        # Score = matched_keywords / total_keywords (capped meaningful weight)
        score = len(matched) / len(keywords)
        return score, matched

    def _build_reason(self, section: dict, matched_keywords: list, sem_score: float) -> str:
        """
        Constructs a clear, specific explanation of why this IPC section applies
        to the reported incident.
        """
        lines = []

        # Lead with what incident elements matched
        if matched_keywords:
            top_matches = list(dict.fromkeys(matched_keywords[:4]))  # deduplicated
            lines.append(
                f"The incident description contains key terms — **{', '.join(top_matches)}** — "
                f"that directly correspond to the legal definition of {section['section']} ({section['title']})."
            )
        else:
            lines.append(
                f"The overall context and intent described in the incident closely aligns with "
                f"the legal scope of {section['section']} ({section['title']})."
            )

        # Explain what this IPC actually covers
        lines.append(f"This section covers: {section['description']}")

        # Police procedural guidance
        if section['nature'] == "Cognizable":
            lines.append(
                "**Police Action**: This is a Cognizable offence. Police are empowered to "
                "arrest without a warrant and are legally required to register an FIR immediately."
            )
        else:
            lines.append(
                "**Police Action**: This is a Non-Cognizable offence. A Magistrate's order "
                "is typically required before the police can investigate or arrest."
            )

        return " ".join(lines)

    def suggest(self, incident_text: str, top_k: int = 3) -> list:
        """
        Suggests the top `top_k` IPC sections for a given incident description.

        Scoring method (Hybrid):
        - 50% weight: Semantic cosine similarity (sentence-transformer embedding match)
        - 50% weight: Keyword overlap score (crime-type-specific keywords from ipc_data.json)

        This combination prevents semantic bleed (e.g., preventing 'murder' from
        appearing for a 'theft' incident just because both use legal vocabulary).
        """
        if not isinstance(incident_text, str) or not incident_text.strip():
            return []

        incident_text = incident_text.strip()

        # --- Semantic Scoring ---
        query_embedding = self.model.encode(incident_text, convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, self.ipc_embeddings)[0]

        suggestions = []
        for i, section in enumerate(self.ipc_data):
            sem_score = cosine_scores[i].item()

            # --- Keyword Scoring ---
            keywords = section.get('keywords', [])
            kw_score, matched_keywords = self._keyword_score(incident_text, keywords)

            # --- Hybrid Score (50/50 blend) ---
            hybrid_score = (0.5 * sem_score) + (0.5 * kw_score)

            # --- Build detailed reasoning ---
            reason = self._build_reason(section, matched_keywords, sem_score)

            suggestions.append({
                "section": section['section'],
                "title": section['title'],
                "description": section['description'],
                "nature": section.get('nature', 'N/A'),
                "bailable": section.get('bailable', 'N/A'),
                "punishment": section.get('punishment', 'N/A'),
                "reason_for_application": reason,
                "_score": hybrid_score,
            })

        # Sort by hybrid score descending, return top K
        suggestions.sort(key=lambda x: x['_score'], reverse=True)

        final = []
        for s in suggestions[:top_k]:
            del s['_score']
            final.append(s)

        return final


if __name__ == "__main__":
    # Quick local test — run as: python suggester.py
    suggester = IPCSuggester()

    tests = [
        "Someone stole my bike from the parking lot last night.",
        "My husband and his family have been harassing me for dowry and threatening to kill me.",
        "A group of men attacked me with a knife on the road and stole my bag.",
        "I was cheated by an online seller who took my money but never delivered the product.",
    ]

    for incident in tests:
        print(f"\n{'='*60}")
        print(f"INCIDENT: {incident}")
        print(f"{'='*60}")
        results = suggester.suggest(incident)
        for r in results:
            print(f"\n  [{r['section']}] {r['title']}")
            print(f"  Nature: {r['nature']} | Bailable: {r['bailable']}")
            print(f"  Reason: {r['reason_for_application'][:120]}...")
