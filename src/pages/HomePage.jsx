import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { getCuratedPhotos, searchPhotos, getFavorites } from "../services/api";
import ImageCard from "../components/ImageCard";
import PhotoModal from "../components/PhotoModal";
import LoginModal from "../components/LoginModal";
import { addFavorite, removeFavorite } from "../services/api";
import { AuthContext } from "../context/authContext";

const HomePage = () => {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState("curated");
  const [favoritesMap, setFavoritesMap] = useState({});
  
  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { isAuthenticated } = useContext(AuthContext);

  // Load user's favorites from MongoDB when they login
  useEffect(() => {
    const loadUserFavorites = async () => {
      if (isAuthenticated) {
        try {
          const response = await getFavorites();
          const favMap = {};
          response.data.forEach((fav) => {
            favMap[fav.externalId] = fav._id;
          });
          setFavoritesMap(favMap);
          console.log("Loaded favorites from MongoDB:", favMap);
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      } else {
        setFavoritesMap({});
      }
    };

    loadUserFavorites();
  }, [isAuthenticated]);

  const observer = useRef();
  const lastPhotoRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const fetchPhotos = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      let response;

      if (filterType === "search" && searchQuery) {
        response = await searchPhotos(searchQuery, page, 30);
      } else {
        response = await getCuratedPhotos(page, 30);
      }

      const newPhotos = response.data.photos;

      if (page === 1) {
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }

      setHasMore(newPhotos.length > 0);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [page, filterType, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setFilterType("curated");
      setSearchQuery("");
      setPhotos([]);
      setPage(1);
      setHasMore(true);
      return;
    }

    setFilterType("search");
    setSearchQuery(searchInput);
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  };

  const handleFavoriteChange = (photoId, isFavorited, favoriteId) => {
    setFavoritesMap((prev) => ({
      ...prev,
      [photoId]: isFavorited ? favoriteId : null,
    }));
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handleNextPhoto = () => {
    const currentIndex = photos.findIndex(p => (p.id || p.pexelsId) === (selectedPhoto.id || selectedPhoto.pexelsId));
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  const handlePrevPhoto = () => {
    const currentIndex = photos.findIndex(p => (p.id || p.pexelsId) === (selectedPhoto.id || selectedPhoto.pexelsId));
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  const getCurrentPhotoIndex = () => {
    if (!selectedPhoto) return -1;
    return photos.findIndex(p => (p.id || p.pexelsId) === (selectedPhoto.id || selectedPhoto.pexelsId));
  };

  const handleLoginRequired = () => {
    setIsLoginModalOpen(true);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setIsPhotoModalOpen(false);
      setIsLoginModalOpen(true);
      return;
    }

    if (!selectedPhoto) return;

    const photoId = selectedPhoto.id || selectedPhoto.pexelsId;
    const isFavorited = !!favoritesMap[photoId];
    const favoriteId = favoritesMap[photoId];

    try {
      if (isFavorited && favoriteId) {
        await removeFavorite(favoriteId);
        handleFavoriteChange(photoId, false);
      } else {
        const favoriteData = {
          externalId: String(photoId),
          url: selectedPhoto.src?.large || selectedPhoto.src?.medium || selectedPhoto.url,
          photographerName: selectedPhoto.photographer,
          source: "Pixabay",
        };
        const response = await addFavorite(favoriteData);
        handleFavoriteChange(photoId, true, response.data._id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 border-b-4 border-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-6xl font-black text-center mb-4 tracking-tight">
            DISCOVER
          </h1>
          <p className="text-xl text-center mb-8 text-gray-300 font-light">
            Explore millions of high-quality photos
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search: computer, ocean, mountain, business..."
                className="flex-1 px-6 py-4 bg-white text-black border-2 border-white focus:outline-none focus:ring-4 focus:ring-gray-400 text-lg font-medium placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors border-2 border-white"
              >
                SEARCH
              </button>
            </div>
          </form>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleFilterChange("curated")}
              className={`px-6 py-2 font-bold uppercase text-sm tracking-wider transition-colors border-2 ${
                filterType === "curated"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white border-white hover:bg-white hover:text-black"
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => handleFilterChange("search")}
              disabled={!searchQuery}
              className={`px-6 py-2 font-bold uppercase text-sm tracking-wider transition-colors border-2 ${
                filterType === "search"
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white border-white hover:bg-white hover:text-black"
              } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white`}
            >
              Search Results
            </button>
          </div>

          {searchQuery && filterType === "search" && (
            <p className="text-center mt-4 text-gray-300 font-medium">
              Showing results for: <span className="font-bold text-white">"{searchQuery}"</span>
            </p>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto px-4 py-12">
        {photos.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-400 font-bold">NO PHOTOS FOUND</p>
          </div>
        )}

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => {
            const photoId = photo.id || photo.pexelsId;
            const isFavorited = !!favoritesMap[photoId];
            const favoriteId = favoritesMap[photoId];

            if (photos.length === index + 1) {
              return (
                <div key={photoId} ref={lastPhotoRef}>
                  <ImageCard
                    photo={photo}
                    isFavorited={isFavorited}
                    favoriteId={favoriteId}
                    onFavoriteChange={handleFavoriteChange}
                    onPhotoClick={handlePhotoClick}
                    onLoginRequired={handleLoginRequired}
                  />
                </div>
              );
            } else {
              return (
                <div key={photoId}>
                  <ImageCard
                    photo={photo}
                    isFavorited={isFavorited}
                    favoriteId={favoriteId}
                    onFavoriteChange={handleFavoriteChange}
                    onPhotoClick={handlePhotoClick}
                    onLoginRequired={handleLoginRequired}
                  />
                </div>
              );
            }
          })}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        )}

        {!hasMore && photos.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg font-bold uppercase">End of Results</p>
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
        hasNext={getCurrentPhotoIndex() < photos.length - 1}
        hasPrev={getCurrentPhotoIndex() > 0}
      />

      {/* Login Required Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
