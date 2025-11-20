import { useEffect } from "react";

const PhotoModal = ({ 
  photo, 
  isOpen, 
  onClose, 
  isFavorited, 
  onToggleFavorite, 
  isAuthenticated,
  onNext,
  onPrev,
  hasNext = true,
  hasPrev = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!isOpen || !photo) return null;

  const imageUrl = photo.src?.large || photo.src?.medium || photo.url;
  const photographer = photo.photographer || photo.photographerName;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Button */}
      {hasPrev && onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/70 p-4 rounded-full hover:bg-black/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Button */}
      {hasNext && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/70 p-4 rounded-full hover:bg-black/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div 
        className="max-w-7xl w-full bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="lg:w-2/3 bg-black flex items-center justify-center">
          <img
            src={imageUrl}
            alt={photo.alt || photographer}
            className="max-h-[70vh] lg:max-h-[85vh] w-full object-contain"
          />
        </div>

        {/* Details Section */}
        <div className="lg:w-1/3 p-6 overflow-y-auto max-h-[30vh] lg:max-h-[85vh]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {photo.alt || "Beautiful Photo"}
              </h2>
              <p className="text-gray-600">by {photographer}</p>
            </div>
            <button
              onClick={onToggleFavorite}
              className={`p-3 rounded-full transition-all ${
                isFavorited
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill={isFavorited ? "white" : "none"}
                stroke={isFavorited ? "white" : "currentColor"}
                strokeWidth="2"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
            {photo.views && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{photo.views.toLocaleString()}</div>
                <div className="text-xs text-gray-500 uppercase">Views</div>
              </div>
            )}
            {photo.likes && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{photo.likes.toLocaleString()}</div>
                <div className="text-xs text-gray-500 uppercase">Likes</div>
              </div>
            )}
            {photo.downloads && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{photo.downloads.toLocaleString()}</div>
                <div className="text-xs text-gray-500 uppercase">Downloads</div>
              </div>
            )}
          </div>

          {/* Tags */}
          {photo.tags && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {photo.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase">Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Dimensions: {photo.width} × {photo.height} pixels</div>
              {photo.photographer_url && (
                <div>
                  <a
                    href={photo.photographer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:text-gray-700"
                  >
                    View Photographer Profile →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;

