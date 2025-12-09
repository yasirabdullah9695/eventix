import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "../Components/ui/Tabs";
import { ImageIcon, Calendar, Search, X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn } from "lucide-react";
import { Input } from "../Components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "../Components/ui/Dialog";

const API_URL = "http://localhost:5000/api";

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images', selectedYear, selectedCategory],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/gallery?year=${selectedYear}&category=${selectedCategory}`);
      return await res.json();
    },
    initialData: [],
  });

  const filteredImages = images.filter(img => 
    img.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["all", "Events", "Sports", "Cultural", "Academic", "Campus Life"];
  const currentYear = new Date().getFullYear();
  const startYear = 2021;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const imagesByMonth = {};
  filteredImages.forEach(img => {
    const month = img.month;
    if (!imagesByMonth[month]) imagesByMonth[month] = [];
    imagesByMonth[month].push(img);
  });

  const navigateImage = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img._id === selectedImage._id);
    if (direction === 'next' && currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1]);
    }
  };

  const currentImageIndex = selectedImage ? filteredImages.findIndex(img => img._id === selectedImage._id) : -1;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center relative overflow-hidden rounded-3xl p-8 md:p-12"
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(59, 130, 246, 0.2)"
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Photo Gallery
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Relive the best moments from campus life through our curated collection
          </p>
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4 bg-gray-50 backdrop-blur-xl p-6 rounded-2xl border border-gray-300"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Search photos by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Year Filter */}
            <Tabs value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <TabsList className="bg-white border border-gray-300 p-1 rounded-xl">
                {years.map(year => (
                  <TabsTrigger 
                    key={year} 
                    value={year.toString()} 
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-gray-900"
                  >
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Category Filter */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-white flex-wrap h-auto p-1 rounded-xl gap-2 border border-gray-300">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="rounded-lg px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-gray-900"
                >
                  {category === "all" ? "All Photos" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-700">
              Showing <span className="text-blue-600 font-semibold">{filteredImages.length}</span> photos
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Gallery Grid by Month */}
        {!isLoading && (
          <div className="space-y-16">
            {Object.keys(imagesByMonth).sort((a, b) => b - a).map(month => (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{monthNames[month - 1]}</h2>
                    <p className="text-gray-600">{selectedYear} • {imagesByMonth[month].length} photos</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-600/50 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {imagesByMonth[month].map((image, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => setSelectedImage(image)}
                      className="cursor-pointer group relative"
                    >
                      <Card className="overflow-hidden border-gray-300 bg-white shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-500">
                        <div className="aspect-square overflow-hidden relative">
                          <img 
                            src={`http://localhost:5000${image.image_url}`} 
                            alt={image.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ZoomIn className="w-12 h-12 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white font-semibold text-lg mb-2">{image.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-xs rounded-full">
                                  {image.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-gray-50 backdrop-blur-xl rounded-3xl p-12 border border-gray-300 max-w-md mx-auto">
              <ImageIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-3">No Photos Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedYear(new Date().getFullYear());
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Image Viewer Dialog */}
        <AnimatePresence>
          {selectedImage && (
            <Dialog open={true} onOpenChange={() => setSelectedImage(null)}>
              <DialogContent className="max-w-6xl bg-white border-gray-300 p-0 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 z-50 p-2 bg-gray-200 backdrop-blur-sm rounded-full text-gray-900 hover:bg-gray-300 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Navigation Buttons */}
                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-gray-200 backdrop-blur-sm rounded-full text-gray-900 hover:bg-gray-300 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  
                  {currentImageIndex < filteredImages.length - 1 && (
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-gray-200 backdrop-blur-sm rounded-full text-gray-900 hover:bg-gray-300 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                  {/* Image */}
                  <div className="relative">
                    <img 
                      src={`http://localhost:5000${selectedImage.image_url}`} 
                      alt={selectedImage.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>

                  {/* Info Section */}
                  <div className="p-8 bg-gradient-to-t from-gray-100 to-transparent">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedImage.title}</h3>
                        <div className="flex items-center gap-4 text-gray-700">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {monthNames[selectedImage.month - 1]} {selectedImage.year}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 border border-blue-300 text-blue-700 text-sm rounded-full">
                            {selectedImage.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">
                          Photo {currentImageIndex + 1} of {filteredImages.length}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button className="p-3 bg-gray-300 hover:bg-gray-400 rounded-xl text-gray-900 transition-all">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-xl text-white transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
