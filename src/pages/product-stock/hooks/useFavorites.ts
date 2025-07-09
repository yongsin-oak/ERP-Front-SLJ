import { useState, useEffect } from "react";

// Hook for managing favorites
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorite-products") || "[]"
    );
    setFavorites(savedFavorites);
  }, []);

  const toggleFavorite = (productBarcode: string) => {
    const currentFavorites = JSON.parse(
      localStorage.getItem("favorite-products") || "[]"
    );

    if (currentFavorites.includes(productBarcode)) {
      const newFavorites = currentFavorites.filter(
        (code: string) => code !== productBarcode
      );
      localStorage.setItem("favorite-products", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      return false;
    } else {
      const newFavorites = [...currentFavorites, productBarcode];
      localStorage.setItem("favorite-products", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      return true;
    }
  };

  const isFavorite = (productBarcode: string) => {
    return favorites.includes(productBarcode);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
};
