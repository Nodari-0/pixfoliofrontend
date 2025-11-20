import { useState, useEffect, useContext } from "react";
import { getFavorites, addFavorite, removeFavorite } from "../services/api";
import ImageCard from "../components/ImageCard";
import PhotoModal from "../components/PhotoModal";
import { AuthContext } from "../context/authContext";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [favoritesMap, setFavoritesMap] = useState({});
  
  const { isAuthenticated } = useContext(AuthContext);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await getFavorites();
      setFavorites(response.data);
      console.log("Loaded favorites from MongoDB:", response.data);
      
      // Build favorites map
      const favMap = {};
      response.data.forEach((fav) => {
        favMap[fav.externalId] = fav._id;
      });
      setFavoritesMap(favMap);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleFavoriteChange = (photoId, isFavorited, favoriteId) => {
    if (!isFavorited) {
      // Remove from list when unfavorited
      setFavorites((prev) =>
        prev.filter((fav) => fav.externalId !== String(photoId))
      );
      setFavoritesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[photoId];
        return newMap;
      });
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handleNextPhoto = () => {
    const currentIndex = transformedFavorites.findIndex(p => (p.id || p.pexelsId) === (selectedPhoto.id || selectedPhoto.pexelsId));
    if (currentIndex < transformedFavorites.length - 1) {
      setSelectedPhoto(transformedFavorites[currentIndex + 1]);
    }
  };

  const handlePrevPhoto = () => {
    const currentIndex = transformedFavorites.findIndex(p => (p.id || p.pexelsId) === (selectedPhoto.id || selectedPhoto.pexelsId));
    if (currentIndex > 0) {
      setSelectedPhoto(transformedFavorites[currentIndex - 1]);
    }
  };

  const getCurrentPhotoIndex = () => {
    if (!selectedPhoto) return -1;
    return transformedFavorites.findIndex(p => (p.id || p.pexelsId) === (selectedPhoto.id || selectedPhoto.pexelsId));
  };

  const handleToggleFavorite = async () => {
    if (!selectedPhoto) return;

    const photoId = selectedPhoto.id || selectedPhoto.pexelsId;
    const isFavorited = !!favoritesMap[photoId];
    const favoriteId = favoritesMap[photoId];

    try {
      if (isFavorited && favoriteId) {
        await removeFavorite(favoriteId);
        handleFavoriteChange(photoId, false);
        setIsPhotoModalOpen(false); // Close modal after unfavoriting
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Transform saved images to photo format for ImageCard
  const transformedFavorites = favorites.map((fav) => ({
    id: fav.externalId,
    pexelsId: fav.externalId,
    photographer: fav.photographerName,
    photographerName: fav.photographerName,
    url: fav.url,
    src: {
      large: fav.url,
      medium: fav.url,
    },
    alt: fav.photographerName,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 border-b-4 border-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black text-center mb-2 uppercase tracking-tight">My Favorites</h1>
          <p className="text-center text-gray-300 text-lg font-medium">
            {favorites.length} {favorites.length === 1 ? "photo" : "photos"} saved in MongoDB
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase">
              No favorites yet
            </h2>
            <p className="text-gray-600 text-lg mb-6 font-medium">
              Start exploring and save your favorite photos to MongoDB!
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
            >
              Explore Photos
            </a>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {transformedFavorites.map((photo, index) => {
              const favorite = favorites[index];
              return (
                <div key={favorite._id}>
                  <ImageCard
                    photo={photo}
                    isFavorited={true}
                    favoriteId={favorite._id}
                    onFavoriteChange={handleFavoriteChange}
                    onPhotoClick={handlePhotoClick}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <PhotoModal
        photo={selectedPhoto}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        isFavorited={selectedPhoto ? !!favoritesMap[selectedPhoto.id || selectedPhoto.pexelsId] : false}
        onToggleFavorite={handleToggleFavorite}
        isAuthenticated={isAuthenticated}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        hasNext={getCurrentPhotoIndex() < transformedFavorites.length - 1}
        hasPrev={getCurrentPhotoIndex() > 0}
      />
    </div>
  );
};

export default Favorites;

