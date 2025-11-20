import { useState, useContext } from "react";
import { addFavorite, removeFavorite } from "../services/api";
import { AuthContext } from "../context/authContext";

const ImageCard = ({ photo, isFavorited = false, favoriteId = null, onFavoriteChange, onPhotoClick, onLoginRequired }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [savedFavoriteId, setSavedFavoriteId] = useState(favoriteId);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite && savedFavoriteId) {
        // Remove from favorites
        await removeFavorite(savedFavoriteId);
        setIsFavorite(false);
        setSavedFavoriteId(null);
        if (onFavoriteChange) {
          onFavoriteChange(photo.id || photo.pexelsId, false);
        }
      } else {
        // Add to favorites
        const favoriteData = {
          externalId: String(photo.id || photo.pexelsId),
          url: photo.src?.large || photo.src?.medium || photo.url,
          photographerName: photo.photographer,
          source: "Pexels",
        };
        
        const response = await addFavorite(favoriteData);
        setIsFavorite(true);
        setSavedFavoriteId(response.data._id);
        if (onFavoriteChange) {
          onFavoriteChange(photo.id || photo.pexelsId, true, response.data._id);
        }
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      if (error.response?.status === 409) {
        alert("This image is already in your favorites!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = photo.src?.large || photo.src?.medium || photo.url;
  const photographer = photo.photographer || photo.photographerName;

  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPhotoClick && onPhotoClick(photo)}
    >
      <img
        src={imageUrl}
        alt={photo.alt || photographer}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-90"
      />

      {/* Overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="font-bold text-sm truncate">{photographer}</p>
          {photo.tags && (
            <p className="text-xs opacity-80 truncate mt-1">{photo.tags.split(',')[0]}</p>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all shadow-lg ${
            isFavorite
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white/90 hover:bg-white"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill={isFavorite ? "white" : "none"}
            stroke={isFavorite ? "white" : "#EF4444"}
            strokeWidth="2"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Click to view indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;

