import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { useAuth, API_URL } from '../../context/AuthContext';
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";
import { CheckCircle, AlertCircle, Info, CalendarIcon, Plus, Edit2, Trash2, Image as ImageIcon, Eye } from 'lucide-react';

export default function AdminGallery() {
    const queryClient = useQueryClient();
    const { token } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [toast, setToast] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    // Enhanced Toast component with animations
    const Toast = ({ message, type }) => (
        <div className={`fixed top-6 right-6 z-[9999] p-4 rounded-xl shadow-2xl backdrop-blur-sm border ${
            type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400' 
                : type === 'info' 
                ? 'bg-blue-500/90 border-blue-400' 
                : 'bg-red-500/90 border-red-400'
            } text-white flex items-center gap-3 transform transition-all duration-500 ease-out animate-slide-in min-w-[300px]`}>
            <div className="flex-shrink-0">
                {type === 'success' ? (
                    <CheckCircle className="w-6 h-6" />
                ) : type === 'info' ? (
                    <Info className="w-6 h-6" />
                ) : (
                    <AlertCircle className="w-6 h-6" />
                )}
            </div>
            <span className="font-medium text-sm">{message}</span>
        </div>
    );

    const showToast = (error, type = 'success') => {
        let message = error;
        if (type === 'error' && error && typeof error === 'object') {
            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            } else {
                message = 'An unknown error occurred';
            }
        }
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const { data: galleryImages = [], isLoading } = useQuery({
        queryKey: ['gallery-images'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/gallery`);
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newImage) => {
            const formData = new FormData();
            formData.append('title', newImage.title);
            formData.append('category', newImage.category);
            formData.append('year', newImage.year);
            formData.append('month', newImage.month);
            if (newImage.image) {
                formData.append('image', newImage.image);
            }

            const res = await fetch(`http://localhost:5000/api/gallery`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to upload image');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['gallery-images']);
            setIsDialogOpen(false);
            setSelectedImage(null);
            showToast('Image uploaded successfully!', 'success');
        },
        onError: (error) => {
            showToast(error, 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedImage) => {
            const formData = new FormData();
            formData.append('title', updatedImage.title);
            formData.append('category', updatedImage.category);
            formData.append('year', updatedImage.year);
            formData.append('month', updatedImage.month);
            if (updatedImage.image && typeof updatedImage.image !== 'string') {
                formData.append('image', updatedImage.image);
            }

            const res = await fetch(`http://localhost:5000/api/gallery/${updatedImage._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to update image');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['gallery-images']);
            setIsDialogOpen(false);
            setSelectedImage(null);
            showToast('Image updated successfully!', 'success');
        },
        onError: (error) => {
            showToast(error, 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (imageId) => {
            const res = await fetch(`http://localhost:5000/api/gallery/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to delete image');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['gallery-images']);
            showToast('Image deleted successfully!', 'success');
        },
        onError: (error) => {
            showToast(error, 'error');
        }
    });

    const GalleryImageForm = ({ image, onSubmit }) => {
        const [formData, setFormData] = useState(image ? {
            title: image.title || '',
            category: image.category || '',
            date: image.year && image.month ? new Date(parseInt(image.year), parseInt(image.month) - 1, 1) : new Date(),
            image: image.image_url || null,
        } : {
            title: '',
            category: '',
            date: new Date(),
            image: null,
        });

        const [previewUrl, setPreviewUrl] = useState(image?.image_url || null);

        const handleSubmit = (e) => {
            e.preventDefault();
            const year = formData.date ? format(formData.date, "yyyy") : new Date().getFullYear().toString();
            const month = formData.date ? format(formData.date, "MM") : (new Date().getMonth() + 1).toString();

            onSubmit({ ...formData, year, month });
        };

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            if (file) {
                setPreviewUrl(URL.createObjectURL(file));
            }
        };

        const categories = ["Events", "Sports", "Cultural", "Academic", "Campus Life"];

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Preview */}
                {previewUrl && (
                    <div className="relative w-full h-48 bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-gray-200 font-medium">Title</Label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter image title..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-200 font-medium">Category</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                    >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                            {categories.map(category => (
                                <SelectItem key={category} value={category} className="text-white hover:bg-gray-800">
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-200 font-medium">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800 hover:border-purple-500 transition-all",
                                    !formData.date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                                {formData.date ? format(formData.date, "PPP") : <span className="text-gray-400">Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 z-[9999]">
                            <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={(date) => setFormData({ ...formData, date: date })}
                                initialFocus
                                captionLayout="dropdown-full"
                                fromYear={2000}
                                toYear={new Date().getFullYear()}
                                className="text-white"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-200 font-medium">Image Upload</Label>
                    <div className="relative">
                        <Input
                            type="file"
                            onChange={handleFileChange}
                            className="bg-gray-900/50 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer transition-all"
                            accept="image/*"
                        />
                    </div>
                    {image && image.image_url && typeof image.image_url === 'string' && !previewUrl.startsWith('blob:') && (
                        <p className="text-gray-400 text-xs mt-2 flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Current: <a href={image.image_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">{image.image_url.split('/').pop()}</a>
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    {createMutation.isPending || updateMutation.isPending ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            {image ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {image ? 'Update Image' : 'Upload Image'}
                        </span>
                    )}
                </Button>
            </form>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
            {toast && <Toast message={toast.message} type={toast.type} />}
            
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <Card className="glass-card border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl shadow-2xl">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                    Gallery Management
                                </h1>
                                <p className="text-gray-400 text-sm">Manage and organize your gallery images</p>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        onClick={() => setSelectedImage(null)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add New Image
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                            {selectedImage ? 'Edit Gallery Image' : 'Add New Gallery Image'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <GalleryImageForm 
                                        image={selectedImage} 
                                        onSubmit={selectedImage ? updateMutation.mutate : createMutation.mutate} 
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="glass-card border-gray-800 bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Total Images</p>
                                <p className="text-3xl font-bold text-white">{galleryImages.length}</p>
                            </div>
                            <ImageIcon className="w-10 h-10 text-purple-400 opacity-50" />
                        </div>
                    </Card>
                    
                    {["Events", "Sports", "Cultural"].map((cat, idx) => (
                        <Card key={cat} className={`glass-card border-gray-800 bg-gradient-to-br ${
                            idx === 0 ? 'from-blue-900/30 to-blue-800/30' :
                            idx === 1 ? 'from-green-900/30 to-green-800/30' :
                            'from-pink-900/30 to-pink-800/30'
                        } backdrop-blur-xl p-6`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">{cat}</p>
                                    <p className="text-3xl font-bold text-white">
                                        {galleryImages.filter(img => img.category === cat).length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Gallery Grid */}
                <Card className="glass-card border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl shadow-2xl">
                    <div className="p-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                                <p className="text-gray-400">Loading gallery images...</p>
                            </div>
                        ) : galleryImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <ImageIcon className="w-20 h-20 text-gray-600 mb-4" />
                                <p className="text-gray-400 text-lg mb-2">No images yet</p>
                                <p className="text-gray-500 text-sm">Add your first gallery image to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {galleryImages.map((image) => (
                                    <div 
                                        key={image._id} 
                                        className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
                                    >
                                        {/* Image */}
                                        <div className="relative h-56 bg-gray-900 overflow-hidden">
                                            {image.image_url ? (
                                                <img 
                                                    src={image.image_url} 
                                                    alt={image.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-16 h-16 text-gray-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                                                    {image.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-3">
                                            <h3 className="text-white font-semibold text-lg line-clamp-1">{image.title}</h3>
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    <span>{image.month}/{image.year}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => { setSelectedImage(image); setIsDialogOpen(true); }}
                                                    className="flex-1 bg-gray-700/50 border-gray-600 hover:bg-purple-600 hover:border-purple-500 text-white transition-all"
                                                >
                                                    <Edit2 className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => {
                                                        setImageToDelete(image._id);
                                                        setIsDeleteConfirmOpen(true);
                                                    }}
                                                    className="flex-1 bg-red-600/50 hover:bg-red-600 border-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}