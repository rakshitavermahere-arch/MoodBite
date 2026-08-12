import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { MOODS, RESTAURANTS, TIFFIN } from "@/data/mockData";


const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({ moods: MOODS, foods: [], restaurants: RESTAURANTS, tiffin: TIFFIN });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/catalog")
      .then(({ data }) => { if (active) { setCatalog(data); setError(null); } })
      .catch(() => { if (active) setError("Live menu updates are unavailable. Food ordering is paused until the catalog reconnects."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    ...catalog,
    foodById: Object.fromEntries(catalog.foods.map((item) => [item.id, item])),
    restaurantById: Object.fromEntries(catalog.restaurants.map((item) => [item.id, item])),
    tiffinById: Object.fromEntries(catalog.tiffin.map((item) => [item.id, item])),
    loading,
    error,
  }), [catalog, loading, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within CatalogProvider");
  return value;
}
