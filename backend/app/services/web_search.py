"""
WebSearchService — DuckDuckGo-powered web search tool for the Greenhouse AI assistant.

Uses the `duckduckgo_search` library (no API key required, free tier).
Automatically prepends agricultural context to raw queries for better relevance.
"""
from __future__ import annotations
import re
from typing import List, Dict

# Agricultural keywords that indicate the query is already domain-specific
_AGRI_KEYWORDS = {
    "plant", "crop", "leaf", "soil", "fertilizer", "pest", "disease",
    "greenhouse", "humidity", "temperature", "watering", "irrigation",
    "fungal", "bacterial", "mildew", "blight", "rot", "deficiency",
    "nitrogen", "phosphorus", "potassium", "organic", "seedling",
    "vegetative", "flowering", "fruiting", "harvest", "hydroponic",
    "tomato", "strawberry", "lettuce", "basil", "orchid"
}


def _enhance_query(query: str) -> str:
    """Optionally prepend greenhouse/plant context if query is not already domain-specific."""
    tokens = set(re.findall(r"\w+", query.lower()))
    if tokens & _AGRI_KEYWORDS:
        return query  # already agricultural
    return f"greenhouse plant care {query}"


class WebSearchService:
    """Lightweight DuckDuckGo search wrapper for greenhouse agricultural queries."""

    @staticmethod
    def search(query: str, max_results: int = 4) -> List[Dict[str, str]]:
        """
        Perform a web search and return a list of result dicts.

        Returns:
            List of {title, url, snippet} dicts, or empty list on failure.
        """
        enhanced = _enhance_query(query)
        results = []
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                for r in ddgs.text(enhanced, max_results=max_results):
                    results.append({
                        "title":   r.get("title", ""),
                        "url":     r.get("href", ""),
                        "snippet": r.get("body", "")[:300]
                    })
        except Exception as e:
            print(f"[WebSearch Error]: {str(e)}")
        return results

    @staticmethod
    def format_for_llm_context(results: List[Dict[str, str]]) -> str:
        """Format search results as a compact context block for LLM injection."""
        if not results:
            return ""
        lines = ["[Web Search Results]\n"]
        for i, r in enumerate(results, 1):
            lines.append(f"{i}. {r['title']}")
            lines.append(f"   {r['snippet']}")
            lines.append(f"   Source: {r['url']}\n")
        return "\n".join(lines)

    @staticmethod
    def is_search_intent(message: str) -> bool:
        """Detect if a user message implies a web search intent."""
        msg = message.lower()
        intent_phrases = [
            "search", "look up", "find out", "what is", "how to treat",
            "latest", "recent", "news about", "tell me about", "research",
            "online", "google", "web", "information on", "read about",
            "learn about", "best way to", "how do i", "what causes",
            "why is my", "help with"
        ]
        return any(p in msg for p in intent_phrases)
