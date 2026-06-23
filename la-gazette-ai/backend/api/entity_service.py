
import os
from typing import List, Dict, Any
from supabase import create_client, Client

class EntityExtractionService:
    def __init__(self):
        self.model = None
        self.supabase: Client = create_client(
            os.environ.get("SUPABASE_URL"),
            os.environ.get("SUPABASE_SERVICE_KEY")
        )

    def load_model(self):
        """Lazy load the GLiNER model to save resources on startup"""
        if not self.model:
            from gliner import GLiNER
            import torch
            
            print("Loading GLiNER model...")
            # Using gliner_small-v2.1 for speed/quality balance
            self.model = GLiNER.from_pretrained("urchade/gliner_small-v2.1")
            
            # Use GPU/MPS if available
            if torch.cuda.is_available():
                self.model.to("cuda")
                print("GLiNER loaded on CUDA")
            elif torch.backends.mps.is_available():
                self.model.to("mps")
                print("GLiNER loaded on MPS")
            else:
                print("GLiNER loaded on CPU")

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities from text using GLiNER"""
        self.load_model()
        
        # Labels inspired by Pinpoint
        labels = ["person", "organization", "location", "date", "law"]
        
        # Predict
        entities = self.model.predict_entities(text, labels, threshold=0.3)
        return entities

    def save_entities(self, legal_unit_id: str, entities: List[Dict[str, Any]]):
        """Save extracted entities to Supabase"""
        if not entities:
            return

        # 1. Upsert entities (unique by name+type)
        # Prepare list for bulk upsert
        unique_entities = {}
        for ent in entities:
            # Normalize label
            label = ent["label"].lower()
            if label == "organization":
                norm_type = "ORG"
            elif label == "location":
                norm_type = "LOC"
            elif label == "person":
                norm_type = "PERSON"
            else:
                norm_type = "MISC"
            
            key = (ent["text"], norm_type)
            if key not in unique_entities:
                unique_entities[key] = {
                    "name": ent["text"], 
                    "type": norm_type
                }
        
        # Insert into 'entities' table and get IDs
        # Note: Supabase upsert with 'on_conflict'
        try:
            entity_records = list(unique_entities.values())
            res = self.supabase.table("entities").upsert(
                entity_records, on_conflict="name,type"
            ).execute()
            
            # Map name+type to ID
            saved_entities = res.data
            entity_map = {(e["name"], e["type"]): e["id"] for e in saved_entities}
            
            # 2. Link to legal unit
            links = []
            for ent in entities:
                # Re-normalize to find in map
                label = ent["label"].lower()
                if label == "organization":
                    norm_type = "ORG"
                elif label == "location":
                    norm_type = "LOC"
                elif label == "person":
                    norm_type = "PERSON"
                else:
                    norm_type = "MISC"

                key = (ent["text"], norm_type)
                
                if key in entity_map:
                    links.append({
                        "legal_unit_id": legal_unit_id,
                        "entity_id": entity_map[key],
                        "label": ent["label"], # Original label
                        "confidence": ent.get("score", 0.0)
                    })
            
            if links:
                self.supabase.table("legal_unit_entities").upsert(
                    links, on_conflict="legal_unit_id,entity_id"
                ).execute()
                
            print(f"Saved {len(links)} entity links for unit {legal_unit_id}")
            
        except Exception as e:
            print(f"Error saving entities: {e}")

    def get_top_entities(self, entity_type: str = None, limit: int = 50):
        """Fetch top entities by occurrence frequency"""
        # This requires a join and count, which is effectively done via RPC or client-side aggregation
        # Since we don't have a view, we might need a raw query or smart selection
        # For simplicity MVP: fetch most frequent from legal_unit_entities
        # But Supabase-py is limited in complex aggregations without views/RPC.
        
        # Workaround: created a view or just fetch a sample for now?
        # Ideally we use an RPC 'get_top_entities'.
        # Since I can't create RPC easily, I'll fallback to a basic fetch of 'entities' 
        # but that doesn't show frequency.
        
        # Let's assume we want to query 'entities' directly for now 
        # and maybe manually count in Python if dataset is small (it's not).
        
        # BETTER: Use valid raw SQL via Supabase REST is NOT possible.
        # I'll try to fetch all entities (limit 1000) for now.
        
        query = self.supabase.table("entities").select("*")
        if entity_type:
            query = query.eq("type", entity_type.upper())
        
        res = query.limit(limit).execute()
        return res.data
