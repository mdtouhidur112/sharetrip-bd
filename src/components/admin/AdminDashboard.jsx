import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Globe, 
  Settings, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  Menu, 
  X, 
  Sparkles, 
  Crown,
  Shield,
  Mail,
  Check,
  UserCog,
  MapPin,
  Camera,
  Upload,
  Link as LinkIcon,
  Save,
  Phone,
  Loader2,
  Palette,
  Plus,
  Minus,
  Hotel,
  Car,
  Ship,
  Plane,
  Users,
  UtensilsCrossed,
  FilePlus2,
  Trash2,
  Edit3,
  Layers,
  Building2,
  ShoppingBag,
  FileText,
  Search
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { AdminAuthService, ROOT_ADMIN_PROFILE_KEY } from '../../services/adminAuthService';
import { 
  supabase, 
  uploadMediaFile, 
  removeStorageFiles, 
  rowToAdminProfile 
} from '../../services/supabaseClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BannerControl } from './BannerControl';
import { LogoControl } from './LogoControl';
import { BrandLogoControl } from './BrandLogoControl';
import { AdminExecutiveDashboard } from './AdminExecutiveDashboard';
import { AdminContactControl } from './AdminContactControl';
import { AdminAboutControl } from './AdminAboutControl';
import { AdminFooterControl } from './AdminFooterControl';
import { AdminSeoControl } from './AdminSeoControl';
import { AdminControl } from './AdminControl';
import { DynamicReactIcon, parseReactIconInput } from '../../utils/reactIconParser';

export const AdminDashboard = ({ currentAdmin: propCurrentAdmin }) => {
  const { effectiveTheme, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();

  // Admin Role Context
  const currentAdmin = propCurrentAdmin || AdminAuthService.getCurrentAdmin();
  const isRoot = AdminAuthService.isRootAdmin() || currentAdmin?.role === 'root_admin' || currentAdmin?.isRoot === true;

  // Active navigation tab: 'dashboard' | 'customize-logo' | 'banner-control' | 'post-hotel-package' | 'post-transport' | 'post-restaurant' | 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem('aetheria_admin_active_tab_v1') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem('aetheria_admin_active_tab_v1', activeTab);
    } catch {
      // ignore
    }
  }, [activeTab]);
  
  // Web Control Accordion State (Drawer under Dashboard)
  const [isWebControlOpen, setIsWebControlOpen] = useState(false);

  // Post Update Accordion State (Drawer under Web Control)
  const [isPostUpdateOpen, setIsPostUpdateOpen] = useState(false);

  // Destination Management State for 'add destination' under post Update
  const [destinationsList, setDestinationsList] = useState(() => StorageService.getDestinations());

  // Restaurant & Dining Management State for 'Add restaurant-related updates'
  const [restaurantsList, setRestaurantsList] = useState(() => StorageService.getRestaurants());
  const [isAddRestaurantFormOpen, setIsAddRestaurantFormOpen] = useState(false);
  const [restForm, setRestForm] = useState({
    name: '',
    mealPlanType: 'AP (৩ বেলা সম্পূর্ণ খাবার)',
    badge: 'Buffet & Dining',
    ratePerPerson: '',
    tags: '১০০% হালাল, ভেজ অপশন আছে',
    breakfastMenu: '',
    lunchMenu: '',
    dinnerMenu: '',
    photo: ''
  });
  const [isAddDestFormOpen, setIsAddDestFormOpen] = useState(false);
  const [editingDestId, setEditingDestId] = useState(null);
  const [destFormData, setDestFormData] = useState({
    destinationName: '',
    title: '',
    subtitle: '',
    shortDescription: '',
    image: ''
  });
  const [isUploadingDestImg, setIsUploadingDestImg] = useState(false);

  useEffect(() => {
    const syncDestinations = () => setDestinationsList(StorageService.getDestinations());
    const syncRestaurants = () => setRestaurantsList(StorageService.getRestaurants());
    window.addEventListener('app:destinations-updated', syncDestinations);
    window.addEventListener('app:restaurants-updated', syncRestaurants);
    return () => {
      window.removeEventListener('app:destinations-updated', syncDestinations);
      window.removeEventListener('app:restaurants-updated', syncRestaurants);
    };
  }, []);

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    if (!destFormData.destinationName.trim() || !destFormData.title.trim()) {
      alert('অনুগ্রহ করে Destination Name এবং Title পূরণ করুন।');
      return;
    }
    const updated = await StorageService.saveDestination({
      ...(editingDestId ? { id: editingDestId } : {}),
      destinationName: destFormData.destinationName.trim(),
      title: destFormData.title.trim(),
      subtitle: destFormData.subtitle.trim(),
      shortDescription: destFormData.shortDescription.trim(),
      image: destFormData.image.trim()
    });
    setDestinationsList(updated);
    setDestFormData({
      destinationName: '',
      title: '',
      subtitle: '',
      shortDescription: '',
      image: ''
    });
    setEditingDestId(null);
    setIsAddDestFormOpen(false);
    setCmsToast({
      show: true,
      text: editingDestId ? 'Destination সফলভাবে আপডেট করা হয়েছে!' : 'নতুন Destination সফলভাবে যুক্ত করা হয়েছে!'
    });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  const handleEditDestination = (dest) => {
    setEditingDestId(dest.id);
    setDestFormData({
      destinationName: dest.destinationName || dest.title || '',
      title: dest.title || dest.destinationName || '',
      subtitle: dest.subtitle || dest.tagline || '',
      shortDescription: dest.shortDescription || dest.description || '',
      image: dest.image || ''
    });
    setIsAddDestFormOpen(true);
  };

  const handleDeleteDestination = async (destId) => {
    const updated = await StorageService.deleteDestination(destId);
    setDestinationsList(updated);
    setCmsToast({ show: true, text: 'Destination মুছে ফেলা হয়েছে।' });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  // Services Management State & Handlers for 'add new services' under post Update
  const [servicesList, setServicesList] = useState(() => StorageService.getServices());
  const [isAddServiceFormOpen, setIsAddServiceFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [isUploadingServicePhoto, setIsUploadingServicePhoto] = useState(false);
  const [servicePhotoLinkInput, setServicePhotoLinkInput] = useState('');
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    photo: '',
    icon: '',
    items: ['']
  });

  useEffect(() => {
    const syncServices = () => setServicesList(StorageService.getServices());
    window.addEventListener('app:services-updated', syncServices);
    return () => window.removeEventListener('app:services-updated', syncServices);
  }, []);

  const handleUploadServicePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingServicePhoto(true);
      let uploadedUrl = null;
      try {
        const res = await uploadMediaFile(file, 'services');
        if (res?.url) uploadedUrl = res.url;
      } catch (err) {
        console.warn('Supabase service photo upload error, falling back to base64', err);
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (uploadedUrl) {
        setServiceFormData((prev) => ({ ...prev, photo: uploadedUrl }));
      }
    } catch (error) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (error.message || 'Error'));
    } finally {
      setIsUploadingServicePhoto(false);
      e.target.value = '';
    }
  };

  const handleAddServicePhotoLink = () => {
    const trimmed = servicePhotoLinkInput.trim();
    if (!trimmed) return;
    setServiceFormData((prev) => ({ ...prev, photo: trimmed }));
    setServicePhotoLinkInput('');
  };

  const handleAddServiceItem = () => {
    setServiceFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), '']
    }));
  };

  const handleRemoveServiceItem = (itemIdx) => {
    setServiceFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== itemIdx)
    }));
  };

  const handleChangeServiceItem = (itemIdx, val) => {
    setServiceFormData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, idx) => (idx === itemIdx ? val : item))
    }));
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceFormData.name.trim()) {
      alert('অনুগ্রহ করে Services Name পূরণ করুন।');
      return;
    }

    const cleanedItems = (serviceFormData.items || [])
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter(Boolean);

    const payload = {
      ...(editingServiceId ? { id: editingServiceId } : {}),
      name: serviceFormData.name.trim(),
      title: serviceFormData.name.trim(),
      description: serviceFormData.description.trim(),
      photo: serviceFormData.photo || '',
      image: serviceFormData.photo || '',
      icon: serviceFormData.icon?.trim() || 'Sparkles',
      items: cleanedItems,
      perks: cleanedItems
    };

    const updated = await StorageService.saveService(payload);
    setServicesList(updated);
    setServiceFormData({
      name: '',
      description: '',
      photo: '',
      icon: '',
      items: ['']
    });
    setServicePhotoLinkInput('');
    setEditingServiceId(null);
    setIsAddServiceFormOpen(false);
    setCmsToast({
      show: true,
      text: editingServiceId ? 'সার্ভিস সফলভাবে আপডেট করা হয়েছে!' : 'নতুন সার্ভিস সফলভাবে যুক্ত করা হয়েছে!'
    });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  const handleEditService = (srv) => {
    setEditingServiceId(srv.id);
    const existingItems = Array.isArray(srv.items) && srv.items.length > 0
      ? srv.items
      : Array.isArray(srv.perks) && srv.perks.length > 0
      ? srv.perks
      : [''];

    setServiceFormData({
      name: srv.name || srv.title || '',
      description: srv.description || srv.desc || '',
      photo: srv.photo || srv.image || '',
      icon: srv.icon || '',
      items: existingItems
    });
    setServicePhotoLinkInput('');
    setIsAddServiceFormOpen(true);
  };

  const handleDeleteService = async (srvId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সার্ভিসটি মুছে ফেলতে চান?')) return;
    const updated = await StorageService.deleteService(srvId);
    setServicesList(updated);
    setCmsToast({ show: true, text: 'সার্ভিস সফলভাবে মুছে ফেলা হয়েছে।' });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  // =========================================================================
  // TRANSPORT MANAGEMENT STATE & HANDLERS ('add Transport-related Update')
  // =========================================================================
  const [transportsList, setTransportsList] = useState(() => StorageService.getTransports());
  const [transportCategories, setTransportCategories] = useState(() => StorageService.getTransportCategories());
  const [isAddTransportFormOpen, setIsAddTransportFormOpen] = useState(false);
  const [editingTransportId, setEditingTransportId] = useState(null);
  const [activeTransportFilter, setActiveTransportFilter] = useState('all');
  const [isUploadingTransportPhoto, setIsUploadingTransportPhoto] = useState(false);
  const [transportPhotoLinkInput, setTransportPhotoLinkInput] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState('');
  const [transportFormData, setTransportFormData] = useState({
    name: '',
    category: 'road',
    model: '',
    capacity: '',
    fare: '',
    description: '',
    photo: '',
    features: ['']
  });

  useEffect(() => {
    const syncTransports = () => setTransportsList(StorageService.getTransports());
    const syncCategories = () => setTransportCategories(StorageService.getTransportCategories());
    window.addEventListener('app:transports-updated', syncTransports);
    window.addEventListener('app:transport-categories-updated', syncCategories);
    return () => {
      window.removeEventListener('app:transports-updated', syncTransports);
      window.removeEventListener('app:transport-categories-updated', syncCategories);
    };
  }, []);

  const handleUploadTransportPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingTransportPhoto(true);
      let uploadedUrl = null;
      try {
        const res = await uploadMediaFile(file, 'transports');
        if (res?.url) uploadedUrl = res.url;
      } catch (err) {
        console.warn('Supabase transport photo upload error, falling back to base64', err);
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (uploadedUrl) {
        setTransportFormData((prev) => ({ ...prev, photo: uploadedUrl }));
      }
    } catch (error) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (error.message || 'Error'));
    } finally {
      setIsUploadingTransportPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddTransportPhotoLink = () => {
    const trimmed = transportPhotoLinkInput.trim();
    if (!trimmed) return;
    setTransportFormData((prev) => ({ ...prev, photo: trimmed }));
    setTransportPhotoLinkInput('');
  };

  const handleAddTransportFeature = () => {
    setTransportFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  const handleRemoveTransportFeature = (featIdx) => {
    setTransportFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, idx) => idx !== featIdx)
    }));
  };

  const handleChangeTransportFeature = (featIdx, val) => {
    setTransportFormData((prev) => ({
      ...prev,
      features: (prev.features || []).map((feat, idx) => (idx === featIdx ? val : feat))
    }));
  };

  const handleCreateCustomCategory = () => {
    const name = newCustomCategoryInput.trim();
    if (!name) return;
    const catId = `cat-custom-${Date.now()}`;
    const newCat = {
      id: catId,
      name,
      subtitle: 'কাস্টম ক্যাটাগরি',
      icon: 'Car',
      badge: name,
      description: `${name} এর সকল পরিবহন ও বাহনসমূহ`,
      photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    };
    StorageService.saveTransportCategory(newCat);
    setTransportFormData((prev) => ({ ...prev, category: catId }));
    setNewCustomCategoryInput('');
    setIsCustomCategoryMode(false);
  };

  const handleSaveTransport = async (e) => {
    e.preventDefault();
    if (!transportFormData.name.trim()) {
      alert('অনুগ্রহ করে Transport Name পূরণ করুন।');
      return;
    }

    const matchedCat = transportCategories.find((c) => c.id === transportFormData.category);
    const categoryName = matchedCat ? matchedCat.name : 'পরিবহন';

    const cleanedFeatures = (transportFormData.features || [])
      .map((f) => (typeof f === 'string' ? f.trim() : ''))
      .filter(Boolean);

    const payload = {
      ...(editingTransportId ? { id: editingTransportId } : {}),
      name: transportFormData.name.trim(),
      category: transportFormData.category,
      categoryName,
      model: transportFormData.model.trim(),
      capacity: transportFormData.capacity.trim() || '৪ জন যাত্রী',
      fare: transportFormData.fare.trim(),
      description: transportFormData.description.trim(),
      photo: transportFormData.photo || '',
      image: transportFormData.photo || '',
      features: cleanedFeatures
    };

    const updated = await StorageService.saveTransport(payload);
    setTransportsList(updated);
    setTransportFormData({
      name: '',
      category: 'road',
      model: '',
      capacity: '',
      fare: '',
      description: '',
      photo: '',
      features: ['']
    });
    setTransportPhotoLinkInput('');
    setEditingTransportId(null);
    setIsAddTransportFormOpen(false);
    setCmsToast({
      show: true,
      text: editingTransportId ? 'যানবাহন সফলভাবে আপডেট করা হয়েছে!' : 'নতুন যানবাহন সফলভাবে যুক্ত করা হয়েছে!'
    });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  const handleEditTransport = (item) => {
    setEditingTransportId(item.id);
    const feats = Array.isArray(item.features) && item.features.length > 0 ? item.features : [''];
    setTransportFormData({
      name: item.name || '',
      category: item.category || 'road',
      model: item.model || '',
      capacity: item.capacity || '',
      fare: item.fare || '',
      description: item.description || '',
      photo: item.photo || item.image || '',
      features: feats
    });
    setTransportPhotoLinkInput('');
    setIsAddTransportFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransport = async (transId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই যানবাহনটি মুছে ফেলতে চান?')) return;
    const updated = await StorageService.deleteTransport(transId);
    setTransportsList(updated);
    setCmsToast({ show: true, text: 'যানবাহন সফলভাবে মুছে ফেলা হয়েছে।' });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  // Single Hotel Form State & Handlers ('add hotel & package-related Update' -> 'add new Single hotel')
  const [isAddSingleHotelFormOpen, setIsAddSingleHotelFormOpen] = useState(false);
  const [editingSinglePostId, setEditingSinglePostId] = useState(null);
  const [adminTransportCatTab, setAdminTransportCatTab] = useState(null);
  const [adminTransports, setAdminTransports] = useState(() => StorageService.getTransports());
  const [adminHotels, setAdminHotels] = useState(() => StorageService.getHotels());
  const [adminRestaurants, setAdminRestaurants] = useState(() => StorageService.getRestaurants());

  useEffect(() => {
    const syncTransports = () => setAdminTransports(StorageService.getTransports());
    const syncHotels = () => setAdminHotels(StorageService.getHotels());
    const syncRestaurants = () => setAdminRestaurants(StorageService.getRestaurants());
    window.addEventListener('app:transports-updated', syncTransports);
    window.addEventListener('app:hotels-updated', syncHotels);
    window.addEventListener('app:restaurants-updated', syncRestaurants);
    return () => {
      window.removeEventListener('app:transports-updated', syncTransports);
      window.removeEventListener('app:hotels-updated', syncHotels);
      window.removeEventListener('app:restaurants-updated', syncRestaurants);
    };
  }, []);
  const [isUseIconModalOpen, setIsUseIconModalOpen] = useState(false);
  const [isUploadingHotelDefaultPhoto, setIsUploadingHotelDefaultPhoto] = useState(false);
  const [isUploadingHotelGalleryPhotos, setIsUploadingHotelGalleryPhotos] = useState(false);
  const [hotelGalleryLinkInput, setHotelGalleryLinkInput] = useState('');
  const [singleHotelForm, setSingleHotelForm] = useState({
    serviceType: 'hotel',
    transportCategory: 'road',
    name: '',
    shortDescription: '',
    checkInTime: '',
    checkOutTime: '',
    transportRoutes: [{ from: '', to: '', seats: '', price: '' }],
    breakfastMenu: [],
    lunchMenu: [],
    dinnerMenu: [],
    destinationId: '',
    bookingPrice: '',
    bookingDays: '',
    vatTaxPercentage: '5',
    shortInfoItems: [{ icon: '', text: '' }],
    details: '',
    defaultPhoto: '',
    galleryPhotos: [],
    youtubeLink: '',
    locationLink: ''
  });

  const handleAddShortInfoItem = () => {
    setSingleHotelForm((prev) => ({
      ...prev,
      shortInfoItems: [...prev.shortInfoItems, { icon: '', text: '' }]
    }));
  };

  const handleRemoveShortInfoItem = (idx) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      shortInfoItems: prev.shortInfoItems.filter((_, i) => i !== idx)
    }));
  };

  const handleChangeShortInfoItem = (idx, field, val) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      shortInfoItems: prev.shortInfoItems.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    }));
  };

  const [activeAdminMealTab, setActiveAdminMealTab] = useState('breakfastMenu');

  const handleAddMealMenuItem = (mealKey) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      [mealKey]: [...(prev[mealKey] || []), { name: '', price: '', photo: '' }]
    }));
  };

  const handleRemoveMealMenuItem = (mealKey, idx) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      [mealKey]: (prev[mealKey] || []).filter((_, i) => i !== idx)
    }));
  };

  const handleChangeMealMenuItem = (mealKey, idx, field, val) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      [mealKey]: (prev[mealKey] || []).map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    }));
  };

  const handleUploadMealMenuPhoto = (mealKey, idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChangeMealMenuItem(mealKey, idx, 'photo', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleAddTransportRoute = () => {
    setSingleHotelForm((prev) => ({
      ...prev,
      transportRoutes: [...(prev.transportRoutes || []), { from: '', to: '', seats: '', price: '' }]
    }));
  };

  const handleRemoveTransportRoute = (idx) => {
    setSingleHotelForm((prev) => {
      const current = prev.transportRoutes || [];
      if (current.length <= 1) {
        return { ...prev, transportRoutes: [{ from: '', to: '', seats: '', price: '' }] };
      }
      return {
        ...prev,
        transportRoutes: current.filter((_, i) => i !== idx)
      };
    });
  };

  const handleChangeTransportRoute = (idx, field, val) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      transportRoutes: (prev.transportRoutes || []).map((item, i) =>
        i === idx ? { ...item, [field]: val } : item
      )
    }));
  };

  const handleUploadHotelDefaultPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingHotelDefaultPhoto(true);
      const res = await uploadMediaFile(file, 'hotels');
      if (res?.url) {
        setSingleHotelForm((prev) => ({ ...prev, defaultPhoto: res.url }));
      }
    } catch (err) {
      alert('ছবি আপলোডে ত্রুটি: ' + (err.message || 'আবার চেষ্টা করুন'));
    } finally {
      setIsUploadingHotelDefaultPhoto(false);
      e.target.value = '';
    }
  };

  const handleUploadHotelGalleryPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setIsUploadingHotelGalleryPhotos(true);
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadMediaFile(file, 'hotels');
        if (res?.url) uploadedUrls.push(res.url);
      }
      if (uploadedUrls.length > 0) {
        setSingleHotelForm((prev) => ({
          ...prev,
          galleryPhotos: [...prev.galleryPhotos, ...uploadedUrls]
        }));
      }
    } catch (err) {
      alert('গ্যালারি ছবি আপলোডে ত্রুটি: ' + (err.message || 'আবার চেষ্টা করুন'));
    } finally {
      setIsUploadingHotelGalleryPhotos(false);
      e.target.value = '';
    }
  };

  const handleAddHotelGalleryLink = () => {
    const cleanUrl = hotelGalleryLinkInput.trim();
    if (!cleanUrl) return;
    setSingleHotelForm((prev) => ({
      ...prev,
      galleryPhotos: [...prev.galleryPhotos, cleanUrl]
    }));
    setHotelGalleryLinkInput('');
  };

  const handleRemoveHotelGalleryPhoto = (idx) => {
    setSingleHotelForm((prev) => ({
      ...prev,
      galleryPhotos: prev.galleryPhotos.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveSingleHotel = async (e) => {
    e.preventDefault();

    const svcType = singleHotelForm.serviceType || 'hotel';
    const cleanShortInfo = singleHotelForm.shortInfoItems.filter((x) => x.text.trim() || x.icon.trim());
    const priceNum = Number(singleHotelForm.bookingPrice || 0);

    if (svcType === 'transport') {
      const catMap = {
        road: 'রোড সার্ভিস',
        waterway: 'নদী পথের সার্ভিস',
        air: 'আকাশ পথের সার্ভিস'
      };
      const catId = singleHotelForm.transportCategory || 'road';
      const cleanRoutes = (singleHotelForm.transportRoutes || [])
        .filter((r) => r.from.trim() || r.to.trim() || String(r.seats).trim() || String(r.price).trim())
        .map((r) => ({
          from: r.from.trim(),
          to: r.to.trim(),
          seats: String(r.seats).trim(),
          price: Number(r.price || 0)
        }));
      const effectivePrice = priceNum > 0 ? priceNum : Number(cleanRoutes[0]?.price || 0);
      await StorageService.saveTransport({
        ...(editingSinglePostId ? { id: editingSinglePostId } : {}),
        name: singleHotelForm.name.trim(),
        category: catId,
        categoryName: catMap[catId] || 'রোড সার্ভিস',
        description: singleHotelForm.shortDescription.trim() || singleHotelForm.details.trim(),
        details: singleHotelForm.details.trim(),
        fare: `৳ ${effectivePrice.toLocaleString()} / ${singleHotelForm.bookingDays.trim() || 'দিন'}`,
        bookingPrice: effectivePrice,
        bookingDays: singleHotelForm.bookingDays.trim() || '১ দিন',
        destinationId: singleHotelForm.destinationId,
        routeFares: cleanRoutes,
        features: cleanShortInfo.map((x) => x.text.trim()).filter(Boolean),
        shortInfoItems: cleanShortInfo,
        photo: singleHotelForm.defaultPhoto.trim(),
        defaultPhoto: singleHotelForm.defaultPhoto.trim(),
        galleryPhotos: singleHotelForm.galleryPhotos,
        youtubeLink: singleHotelForm.youtubeLink.trim(),
        locationLink: singleHotelForm.locationLink.trim(),
        checkInTime: singleHotelForm.checkInTime.trim(),
        checkOutTime: singleHotelForm.checkOutTime.trim(),
        vatTaxPercentage: Number(singleHotelForm.vatTaxPercentage || 5)
      });
    } else if (svcType === 'restaurant') {
      const cleanMealList = (list) =>
        (Array.isArray(list) ? list : [])
          .filter((m) => m && (String(m.name || '').trim() || String(m.price || '').trim() || String(m.photo || '').trim()))
          .map((m) => ({
            name: String(m.name || '').trim(),
            price: Number(m.price || 0),
            photo: String(m.photo || '').trim()
          }));

      await StorageService.saveRestaurant({
        ...(editingSinglePostId ? { id: editingSinglePostId } : {}),
        name: singleHotelForm.name.trim(),
        mealPlanType: singleHotelForm.shortDescription.trim() || 'AP (৩ বেলা সম্পূর্ণ খাবার)',
        badge: singleHotelForm.destinationId || 'Buffet & Dining',
        ratePerPerson: priceNum,
        rateLabel: `৳ ${priceNum.toLocaleString()} / জন`,
        tags: cleanShortInfo.map((x) => x.text.trim()).filter(Boolean),
        shortInfoItems: cleanShortInfo,
        breakfastMenu: cleanMealList(singleHotelForm.breakfastMenu),
        lunchMenu: cleanMealList(singleHotelForm.lunchMenu),
        dinnerMenu: cleanMealList(singleHotelForm.dinnerMenu),
        photo: singleHotelForm.defaultPhoto.trim(),
        defaultPhoto: singleHotelForm.defaultPhoto.trim(),
        galleryPhotos: singleHotelForm.galleryPhotos,
        details: singleHotelForm.details.trim(),
        youtubeLink: singleHotelForm.youtubeLink.trim(),
        locationLink: singleHotelForm.locationLink.trim()
      });
    } else {
      await StorageService.saveHotel({
        ...(editingSinglePostId ? { id: editingSinglePostId } : {}),
        name: singleHotelForm.name.trim(),
        shortDescription: singleHotelForm.shortDescription.trim(),
        checkInTime: singleHotelForm.checkInTime.trim(),
        checkOutTime: singleHotelForm.checkOutTime.trim(),
        destinationId: singleHotelForm.destinationId,
        location: singleHotelForm.destinationId,
        bookingPrice: priceNum,
        pricePerNight: priceNum,
        bookingDays: singleHotelForm.bookingDays.trim() || '1',
        vatTaxPercentage: Number(singleHotelForm.vatTaxPercentage || 5),
        shortInfoItems: cleanShortInfo,
        details: singleHotelForm.details.trim(),
        description: singleHotelForm.details.trim(),
        defaultPhoto: singleHotelForm.defaultPhoto.trim(),
        image: singleHotelForm.defaultPhoto.trim(),
        galleryPhotos: singleHotelForm.galleryPhotos,
        youtubeLink: singleHotelForm.youtubeLink.trim(),
        locationLink: singleHotelForm.locationLink.trim()
      });
    }

    setSingleHotelForm({
      serviceType: 'hotel',
      transportCategory: 'road',
      name: '',
      shortDescription: '',
      checkInTime: '',
      checkOutTime: '',
      transportRoutes: [{ from: '', to: '', seats: '', price: '' }],
      breakfastMenu: [],
      lunchMenu: [],
      dinnerMenu: [],
      destinationId: '',
      bookingPrice: '',
      bookingDays: '',
      vatTaxPercentage: '5',
      shortInfoItems: [{ icon: '', text: '' }],
      details: '',
      defaultPhoto: '',
      galleryPhotos: [],
      youtubeLink: '',
      locationLink: ''
    });
    setHotelGalleryLinkInput('');
    setEditingSinglePostId(null);
    setIsAddSingleHotelFormOpen(false);
    setCmsToast({
      show: true,
      text: `${svcType === 'transport' ? 'Transport' : svcType === 'restaurant' ? 'Restaurant' : 'Hotel'} সফলভাবে সংরক্ষণ করা হয়েছে!`
    });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
  };

  useEffect(() => {
    if (
      activeTab === 'services-control' ||
      activeTab === 'customize-logo' ||
      activeTab === 'banner-control' ||
      activeTab === 'brand-logo-control' ||
      activeTab === 'contact-control' ||
      activeTab === 'about-control' ||
      activeTab === 'footer-control'
    ) {
      setIsWebControlOpen(true);
    }
    if (
      activeTab === 'post-hotel-package' ||
      activeTab === 'post-transport' ||
      activeTab === 'post-restaurant' ||
      activeTab === 'post-destination' ||
      activeTab === 'post-services'
    ) {
      setIsPostUpdateOpen(true);
    }
  }, [activeTab]);

  // Live Brand Info for Admin Sidebar Header
  const [adminBranding, setAdminBranding] = useState(() => StorageService.getBranding());
  useEffect(() => {
    const handleBrandingUpdate = () => {
      setAdminBranding(StorageService.getBranding());
    };
    window.addEventListener('app:branding-updated', handleBrandingUpdate);
    return () => window.removeEventListener('app:branding-updated', handleBrandingUpdate);
  }, []);

  // Live Services Control State (Enable / Disable Core Services)
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  useEffect(() => {
    const handleServicesControlUpdate = () => {
      setServicesControl(StorageService.getServicesControl());
    };
    window.addEventListener('app:services-control-updated', handleServicesControlUpdate);
    return () => window.removeEventListener('app:services-control-updated', handleServicesControlUpdate);
  }, []);

  const handleToggleServiceControl = async (serviceKey, serviceLabel) => {
    const nextEnabled = servicesControl?.[serviceKey] === false;
    const nextState = {
      ...servicesControl,
      [serviceKey]: nextEnabled
    };
    setServicesControl(nextState);
    await StorageService.saveServicesControl(nextState);
    setCmsToast({
      show: true,
      text: `${serviceLabel} ${nextEnabled ? 'Enable' : 'Disable'} করা হয়েছে!`
    });
    setTimeout(() => setCmsToast({ show: false, text: '' }), 3000);
  };
  
  // Mobile sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global CMS Action Toast
  const [cmsToast, setCmsToast] = useState({ show: false, text: '' });

  // Root Admin Profile Configuration States
  const [rootProfile, setRootProfile] = useState(() => AdminAuthService.getRootAdminProfile());
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [portfolioUrl, setPortfolioUrl] = useState(() => StorageService.getFooterSettings()?.developerPortfolioUrl || '');
  const [avatarInputMode, setAvatarInputMode] = useState('upload'); // 'upload' | 'link'
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingRootProfile, setIsSavingRootProfile] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    // Initial load of Root Admin profile
    const profile = AdminAuthService.getRootAdminProfile();
    setRootProfile(profile);
    setProfileFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      avatar: profile.avatar || ''
    });

    const handleProfileUpdate = () => {
      const updated = AdminAuthService.getRootAdminProfile();
      setRootProfile(updated);
      setProfileFormData({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone || '',
        address: updated.address || '',
        avatar: updated.avatar || ''
      });
    };

    window.addEventListener('app:root-admin-profile-updated', handleProfileUpdate);
    const handleFooterPortfolioSync = () => {
      setPortfolioUrl(StorageService.getFooterSettings()?.developerPortfolioUrl || '');
    };
    window.addEventListener('app:footer-settings-updated', handleFooterPortfolioSync);

    // Setup Supabase Realtime WebSocket listener for admin_profile table
    let adminProfileChannel = null;
    if (supabase) {
      adminProfileChannel = supabase
        .channel('admin-profile-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'admin_profile' },
          (payload) => {
            if (payload.new && payload.new.id === 'root') {
              const mapped = rowToAdminProfile(payload.new);
              localStorage.setItem(ROOT_ADMIN_PROFILE_KEY, JSON.stringify(mapped));
              setRootProfile(mapped);
              setProfileFormData({
                name: mapped.name || '',
                email: mapped.email || '',
                phone: mapped.phone || '',
                address: mapped.address || '',
                avatar: mapped.avatar || ''
              });
              window.dispatchEvent(new CustomEvent('app:root-admin-profile-updated', { detail: mapped }));
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (adminProfileChannel && supabase) {
        supabase.removeChannel(adminProfileChannel);
      }
      window.removeEventListener('app:root-admin-profile-updated', handleProfileUpdate);
      window.removeEventListener('app:footer-settings-updated', handleFooterPortfolioSync);
    };
  }, []);

  // Handle Photo File Upload (Uploads directly to Supabase Storage 'agency-media/admin/')
  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন।');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ 10MB হতে হবে।');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const res = await uploadMediaFile(file, 'admin');
      if (res?.url) {
        if (profileFormData.avatar && profileFormData.avatar.includes('/agency-media/')) {
          await removeStorageFiles(profileFormData.avatar).catch(err => console.warn('Old avatar cleanup:', err));
        }
        setProfileFormData(prev => ({ ...prev, avatar: res.url }));
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (err.message || 'ত্রুটি'));
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Handle Photo Removal
  const handleRemovePhoto = async () => {
    if (profileFormData.avatar && profileFormData.avatar.includes('/agency-media/')) {
      await removeStorageFiles(profileFormData.avatar).catch(err => console.warn('Avatar cleanup on remove:', err));
    }
    setProfileFormData(prev => ({ ...prev, avatar: '' }));
  };

  // Handle Save Root Admin Profile
  const handleSaveRootAdminProfile = async (e) => {
    if (e) e.preventDefault();
    if (!isRoot) {
      alert('শুধুমাত্র রুট অ্যাডমিন এই কনফিগারেশন পরিবর্তন করতে পারেন।');
      return;
    }

    setIsSavingRootProfile(true);
    setSettingsError('');
    try {
      await AdminAuthService.saveRootAdminProfile({
        name: (profileFormData.name || '').trim(),
        email: (profileFormData.email || '').trim(),
        phone: (profileFormData.phone || '').trim(),
        address: (profileFormData.address || '').trim(),
        avatar: (profileFormData.avatar || '').trim()
      });
      await StorageService.saveFooterSettings({
        ...StorageService.getFooterSettings(),
        developerPortfolioUrl: (portfolioUrl || '').trim()
      });
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 3500);
    } catch (err) {
      console.error('Error saving root admin profile:', err);
      const errMsg = err?.message || 'ডাটাবেজে সংরক্ষণ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      setSettingsError(errMsg);
      alert('সংরক্ষণ ত্রুটি: ' + errMsg);
    } finally {
      setIsSavingRootProfile(false);
    }
  };

  // Toggle theme between Light White and Dark Black
  const toggleAdminTheme = () => {
    setThemeMode(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  // Toggle language between Bengali and English
  const toggleAdminLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const isLight = effectiveTheme === 'light';

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      isLight 
        ? 'bg-[#F8FAFC] text-slate-800' 
        : 'bg-[#070B13] text-slate-100'
    }`}>
      
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR: MINIMAL CLEAN WEB CONTROL & DASHBOARD                    */}
      {/* ========================================================================= */}
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50
        w-64 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isLight 
          ? 'bg-white border-r border-slate-200/90 shadow-sm' 
          : 'bg-slate-900/95 border-r border-slate-800/90 backdrop-blur-2xl'
        }
      `}>
        {/* Sidebar Header with Brand */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {adminBranding?.logoUrl ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 bg-slate-950/20">
                  <img 
                    src={adminBranding.logoUrl} 
                    alt={adminBranding.brandName || 'Brand Logo'} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#69EBDA] to-cyan-400 p-[1px] shadow-md shadow-[#69EBDA]/20 shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                    <Compass className="w-5 h-5 text-[#69EBDA]" />
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider font-['Outfit',sans-serif] flex items-center gap-1 text-slate-900 dark:text-white">
                  {adminBranding?.brandName || 'AETHERIA'}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#69EBDA]" />
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#69EBDA] font-extrabold -mt-0.5">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean Sidebar Navigation: Only Dashboard & Web Control */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'en' ? 'Management Menu' : 'কন্ট্রোল ম্যানেজমেন্ট'}
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                <span>{language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}</span>
              </div>
            </button>

            {/* 2. Customer Order */}
            <button
              onClick={() => {
                setActiveTab('customer-order');
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${activeTab === 'customer-order'
                  ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className={`w-4 h-4 ${activeTab === 'customer-order' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                <span>{language === 'en' ? 'Customer Order' : 'কাস্টমার অর্ডার'}</span>
              </div>
            </button>

            {/* 3. Web Control Accordion (Directly after Customer Order) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setIsWebControlOpen(prev => !prev)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                  ${isWebControlOpen || activeTab === 'services-control' || activeTab === 'customize-logo' || activeTab === 'banner-control' || activeTab === 'brand-logo-control' || activeTab === 'contact-control' || activeTab === 'about-control' || activeTab === 'footer-control'
                    ? isLight ? 'bg-slate-100 text-slate-900 font-extrabold' : 'bg-slate-800/80 text-white font-extrabold'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`w-4 h-4 ${isWebControlOpen || activeTab === 'services-control' || activeTab === 'customize-logo' || activeTab === 'banner-control' || activeTab === 'brand-logo-control' || activeTab === 'contact-control' || activeTab === 'about-control' || activeTab === 'footer-control' ? 'text-[#69EBDA]' : 'text-slate-400'}`} />
                  <span>{language === 'en' ? 'Web Control' : 'ওয়েব কন্ট্রোল'}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isWebControlOpen ? 'rotate-180 text-[#69EBDA]' : 'text-slate-400'}`} />
              </button>

              {/* Accordion Drawer */}
              <AnimatePresence>
                {isWebControlOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#69EBDA]/40 ml-4 my-1"
                  >
                    {/* 1. Services Control */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('services-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'services-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className={`w-3.5 h-3.5 ${activeTab === 'services-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'Services Control' : 'সার্ভিসেস কন্ট্রোল'}</span>
                      </div>
                      {activeTab === 'services-control' && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    {/* 2. Customize Logo */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('customize-logo');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'customize-logo'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Palette className={`w-3.5 h-3.5 ${activeTab === 'customize-logo' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'Customize Logo' : 'কাস্টমাইজ লোগো'}</span>
                      </div>
                      {activeTab === 'customize-logo' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>

                    {/* 2. Banner Control */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('banner-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'banner-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'banner-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'Banner Control' : 'ব্যানার কন্ট্রোল'}</span>
                      </div>
                      {activeTab === 'banner-control' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>

                    {/* 3. Add Brand Logo */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('brand-logo-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'brand-logo-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${activeTab === 'brand-logo-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'Add Brand Logo' : 'ব্র্যান্ড লোগো যোগ করুন'}</span>
                      </div>
                      {activeTab === 'brand-logo-control' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>

                    {/* 4. Contact Control */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('contact-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'contact-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Phone className={`w-3.5 h-3.5 ${activeTab === 'contact-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'Contact Control' : 'কন্টাক্ট কন্ট্রোল'}</span>
                      </div>
                      {activeTab === 'contact-control' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>

                    {/* 5. About Control */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('about-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'about-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className={`w-3.5 h-3.5 ${activeTab === 'about-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'About Control' : 'অ্যাবাউট কন্ট্রোল'}</span>
                      </div>
                      {activeTab === 'about-control' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>

                    {/* 6. Footer Control */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('footer-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'footer-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className={`w-3.5 h-3.5 ${activeTab === 'footer-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'Footer Control' : 'ফুটার কন্ট্রোল'}</span>
                      </div>
                      {activeTab === 'footer-control' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>

                    {/* 7. SEO Control */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('seo-control');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                        ${activeTab === 'seo-control'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Search className={`w-3.5 h-3.5 ${activeTab === 'seo-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span>{language === 'en' ? 'SEO Control' : 'SEO কন্ট্রোল'}</span>
                      </div>
                      {activeTab === 'seo-control' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Post Update Accordion (Directly under Web Control) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setIsPostUpdateOpen(prev => !prev)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                  ${isPostUpdateOpen || activeTab === 'post-hotel-package' || activeTab === 'post-destination'
                    ? isLight ? 'bg-slate-100 text-slate-900 font-extrabold' : 'bg-slate-800/80 text-white font-extrabold'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <FilePlus2 className={`w-4 h-4 ${isPostUpdateOpen || activeTab === 'post-hotel-package' || activeTab === 'post-destination' ? 'text-[#69EBDA]' : 'text-slate-400'}`} />
                  <span>Post Update</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPostUpdateOpen ? 'rotate-180 text-[#69EBDA]' : 'text-slate-400'}`} />
              </button>

              {/* Post Update Accordion Drawer (Single Option: add post) */}
              <AnimatePresence>
                {isPostUpdateOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#69EBDA]/40 ml-4 my-1"
                  >
                    {/* Only Option: add post */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('post-hotel-package');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-left
                        ${activeTab === 'post-hotel-package'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FilePlus2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'post-hotel-package' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span className="truncate">Add Post</span>
                      </div>
                      {activeTab === 'post-hotel-package' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0 ml-1" />
                      )}
                    </button>

                    {/* Option 2: Add Destination */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('post-destination');
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-left
                        ${activeTab === 'post-destination'
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'post-destination' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                        <span className="truncate">{language === 'en' ? 'Add Destination' : 'অ্যাড ডেস্টিনেশন'}</span>
                      </div>
                      {activeTab === 'post-destination' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0 ml-1" />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Admin Control (Promote/Demote Normal Admin) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin-control');
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${activeTab === 'admin-control'
                  ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-md shadow-[#69EBDA]/25 font-black'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <UserCog className={`w-4 h-4 ${activeTab === 'admin-control' ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                <span>{language === 'en' ? 'Admin Control' : 'অ্যাডমিন কন্ট্রোল'}</span>
              </div>
              {activeTab === 'admin-control' && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT WRAPPER WITH FIXED TOP NAVBAR                             */}
      {/* ========================================================================= */}
      <div className="lg:pl-64 pt-16 flex flex-col min-h-screen">

        {/* ========================================================================= */}
        {/* TOP NAVBAR: Theme, Language, Profile, Settings                            */}
        {/* ========================================================================= */}
        <header className={`
          fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 px-4 sm:px-6 flex items-center
          transition-colors duration-300
          ${isLight 
            ? 'bg-white/95 border-b border-slate-200/90 backdrop-blur-xl shadow-xs' 
            : 'bg-slate-900/95 border-b border-slate-800/90 backdrop-blur-2xl'
          }
        `}>
          <div className="w-full flex items-center justify-between gap-3">
            
            {/* Left Zone: Mobile Menu Toggle & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#69EBDA] hidden sm:inline-block">
                  Admin Panel
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {activeTab === 'services-control'
                    ? (language === 'en' ? 'Services Control' : 'সার্ভিসেস কন্ট্রোল')
                    : activeTab === 'customize-logo'
                    ? (language === 'en' ? 'Customize Logo' : 'কাস্টমাইজ লোগো')
                    : activeTab === 'banner-control'
                      ? (language === 'en' ? 'Banner Control' : 'ব্যানার কন্ট্রোল')
                      : activeTab === 'post-hotel-package'
                        ? 'Add Post'
                        : activeTab === 'post-transport'
                          ? 'add Transport-related Update'
                          : activeTab === 'post-restaurant'
                            ? 'Add restaurant-related updates'
                            : activeTab === 'post-destination'
                              ? 'add destination'
                              : activeTab === 'post-services'
                                ? 'add new services'
                              : activeTab === 'customer-order'
                                ? (language === 'en' ? 'Customer Order' : 'কাস্টমার অর্ডার')
                                : activeTab === 'contact-control'
                                  ? (language === 'en' ? 'Contact Control' : 'কন্টাক্ট কন্ট্রোল')
                                  : activeTab === 'about-control'
                                    ? (language === 'en' ? 'About Control' : 'অ্যাবাউট কন্ট্রোল')
                                    : activeTab === 'footer-control'
                                      ? (language === 'en' ? 'Footer Control' : 'ফুটার কন্ট্রোল')
                                      : activeTab === 'seo-control'
                                        ? (language === 'en' ? 'SEO Control' : 'SEO কন্ট্রোল')
                                        : activeTab === 'admin-control'
                                        ? (language === 'en' ? 'Admin Control' : 'অ্যাডমিন কন্ট্রোল')
                                        : activeTab === 'settings'
                                  ? (language === 'en' ? 'Settings' : 'সিস্টেম কনফিগারেশন')
                                  : (language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড')}
                </h1>
              </div>
            </div>

            {/* Right Zone: Theme Toggle | Language Change | Admin Profile | Settings */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* 1. Theme Toggle Icon */}
              <button
                type="button"
                onClick={toggleAdminTheme}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isLight 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isLight ? 'ডার্ক ব্ল্যাক থিমে পরিবর্তন' : 'লাইট হোয়াইট থিমে পরিবর্তন'}
                aria-label="Toggle Theme"
              >
                {isLight ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-300" />
                )}
              </button>

              {/* 2. Language Change Icon */}
              <button
                type="button"
                onClick={toggleAdminLanguage}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="ভাষা পরিবর্তন করুন (Language Switch)"
                aria-label="Change Language"
              >
                <Globe className="w-4 h-4 text-[#69EBDA]" />
                <span className="text-[11px] font-extrabold">{language === 'en' ? 'EN' : 'বাং'}</span>
              </button>

              {/* 3. Admin Profile & Role Badge (Click opens Settings) */}
              <div 
                onClick={() => setActiveTab('settings')}
                className="relative pl-1 flex items-center gap-2 cursor-pointer group"
                title={language === 'en' ? 'Admin System Configuration' : 'অ্যাডমিন সিস্টেম কনফিগারেশন ওপেন করতে ক্লিক করুন'}
              >
                <div className="relative w-8 h-8 rounded-full ring-2 ring-[#69EBDA]/70 group-hover:ring-[#69EBDA] overflow-hidden shrink-0 transition-all">
                  <img
                    src={(isRoot ? rootProfile?.avatar : currentAdmin?.avatar) || (isRoot 
                      ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    )}
                    alt={(isRoot ? rootProfile?.name : currentAdmin?.name) || "Admin"}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-950 ${isRoot ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <div className="text-[11px] font-extrabold flex items-center gap-1">
                    <span className="truncate max-w-[110px] text-slate-800 dark:text-slate-100 group-hover:text-[#69EBDA] transition-colors">
                      {(isRoot ? rootProfile?.name : currentAdmin?.name) || (isRoot ? 'রুট অ্যাডমিন' : 'নরমাল অ্যাডমিন')}
                    </span>
                    {isRoot ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-500 dark:text-amber-300 text-[9px] font-black border border-amber-400/40 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> ROOT
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-600 dark:text-teal-300 text-[9px] font-black border border-teal-400/40 flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
                    {(isRoot ? rootProfile?.email : currentAdmin?.email) || (isRoot ? '.env credentials' : '')}
                  </span>
                </div>
              </div>

              {/* 4. Admin System Configuration Icon */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#69EBDA]/20 text-[#69EBDA] ring-1 ring-[#69EBDA]/40'
                    : isLight 
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={language === 'en' ? 'Admin System Configuration' : 'অ্যাডমিন সিস্টেম কনফিগারেশন'}
                aria-label="Admin System Configuration"
              >
                <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#69EBDA]' : 'text-slate-500 hover:text-[#69EBDA]'}`} />
              </button>

            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. DYNAMIC CONTENT AREA BASED ON ACTIVE TAB                               */}
        {/* ========================================================================= */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* TAB: WEB CONTROL - CUSTOMIZE LOGO & BRANDING                              */}
          {/* ========================================================================= */}
          {activeTab === 'customize-logo' && (
            <div className="animate-in fade-in duration-300">
              <LogoControl
                language={language}
                isLight={isLight}
                onShowToast={(text) => {
                  setCmsToast({ show: true, text });
                  setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: WEB CONTROL - HERO BANNER CONTROLLER                                 */}
          {/* ========================================================================= */}
          {activeTab === 'banner-control' && (
            <div className="animate-in fade-in duration-300">
              <BannerControl
                language={language}
                isLight={isLight}
                onShowToast={(text) => {
                  setCmsToast({ show: true, text });
                  setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: WEB CONTROL - PARTNER BRAND LOGO MANAGER                             */}
          {/* ========================================================================= */}
          {activeTab === 'brand-logo-control' && (
            <div className="animate-in fade-in duration-300">
              <BrandLogoControl
                language={language}
                isLight={isLight}
                onShowToast={(text) => {
                  setCmsToast({ show: true, text });
                  setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: POST UPDATE - 1. ADD HOTEL & PACKAGE-RELATED UPDATE                  */}
          {/* ========================================================================= */}
          {activeTab === 'post-hotel-package' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSinglePostId(null);
                    setIsAddSingleHotelFormOpen((prev) => !prev);
                  }}
                  className="px-6 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-[#69EBDA]/25 hover:shadow-[#69EBDA]/40 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Post</span>
                </button>
              </div>

              {/* 5 Service & Category Buttons below Add New Post */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {[
                  { id: 'road', label: 'Road Services', icon: Car },
                  { id: 'waterway', label: 'River Services', icon: Ship },
                  { id: 'air', label: 'Air Services', icon: Plane },
                  { id: 'hotel', label: 'Hotel Services', icon: Hotel },
                  { id: 'restaurant', label: 'Restaurant Services', icon: UtensilsCrossed }
                ].map((cat) => {
                  const Icon = cat.icon;
                  const count =
                    cat.id === 'hotel'
                      ? adminHotels.length
                      : cat.id === 'restaurant'
                        ? adminRestaurants.length
                        : adminTransports.filter((t) => (t.category || 'road') === cat.id).length;
                  const isActive = adminTransportCatTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAdminTransportCatTab((prev) => (prev === cat.id ? null : cat.id))}
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 border-transparent shadow-md shadow-[#69EBDA]/25'
                          : isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-[#69EBDA]'}`} />
                      <span>{cat.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          isActive
                            ? 'bg-slate-950/15 text-slate-950'
                            : isLight
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Single Hotel Inline Form */}
              <AnimatePresence>
                {isAddSingleHotelFormOpen && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveSingleHotel}
                    className={`p-6 rounded-3xl border max-w-3xl space-y-4 ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 shadow-2xl'
                    }`}
                  >
                    {/* 0. Select Services (Hotel, Transport, Restaurant) */}
                    <div className={`grid grid-cols-1 ${singleHotelForm.serviceType === 'transport' ? 'sm:grid-cols-2' : ''} gap-3.5`}>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Select Service
                        </label>
                        <select
                          value={singleHotelForm.serviceType}
                          onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                          className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all cursor-pointer ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        >
                          <option value="hotel">Hotel</option>
                          <option value="transport">Transport</option>
                          <option value="restaurant">Restaurant</option>
                        </select>
                      </div>

                      {singleHotelForm.serviceType === 'transport' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            Select Transport Category
                          </label>
                          <select
                            value={singleHotelForm.transportCategory}
                            onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, transportCategory: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all cursor-pointer ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          >
                            <option value="road">Road Services</option>
                            <option value="waterway">River Services</option>
                            <option value="air">Air Services</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* 1. Dynamic Name (Hotel Name / Transport Name / Restaurant Name) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {singleHotelForm.serviceType === 'transport'
                          ? 'Transport Name'
                          : singleHotelForm.serviceType === 'restaurant'
                            ? 'Restaurant Name'
                            : 'Hotel Name'}
                      </label>
                      <input
                        type="text"
                        value={singleHotelForm.name}
                        onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder={
                          singleHotelForm.serviceType === 'transport'
                            ? 'Transport Name'
                            : singleHotelForm.serviceType === 'restaurant'
                              ? 'Restaurant Name'
                              : 'Hotel Name'
                        }
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 2. Short Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={singleHotelForm.shortDescription}
                        onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                        placeholder="Short Description"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 3. Check-in & Check-out Time (OR Transport Route, Seat & Price for Transport) */}
                    {singleHotelForm.serviceType === 'transport' ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            Route, Seats & Per-Seat Price
                          </label>
                          <button
                            type="button"
                            onClick={handleAddTransportRoute}
                            className="w-8 h-8 rounded-xl bg-[#69EBDA] text-slate-950 flex items-center justify-center shadow-sm hover:opacity-90 transition-all cursor-pointer"
                            title="Add Route & Price"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(singleHotelForm.transportRoutes || []).map((routeItem, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <input
                                  type="text"
                                  value={routeItem.from}
                                  onChange={(e) => handleChangeTransportRoute(idx, 'from', e.target.value)}
                                  placeholder="From"
                                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                  }`}
                                />
                                <input
                                  type="text"
                                  value={routeItem.to}
                                  onChange={(e) => handleChangeTransportRoute(idx, 'to', e.target.value)}
                                  placeholder="To"
                                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                  }`}
                                />
                                <input
                                  type="number"
                                  min="1"
                                  value={routeItem.seats}
                                  onChange={(e) => handleChangeTransportRoute(idx, 'seats', e.target.value)}
                                  placeholder="Seats"
                                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                  }`}
                                />
                                <input
                                  type="number"
                                  min="0"
                                  value={routeItem.price}
                                  onChange={(e) => handleChangeTransportRoute(idx, 'price', e.target.value)}
                                  placeholder="Price (৳)"
                                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                  }`}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveTransportRoute(idx)}
                                className="w-9 h-9 shrink-0 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 flex items-center justify-center transition-all cursor-pointer self-end sm:self-center"
                                title="Remove Route"
                              >
                                <Minus className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : singleHotelForm.serviceType === 'restaurant' ? (
                      <div className={`p-4 rounded-2xl border space-y-3.5 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                            ৩ বেলার খাবারের মেনু (Breakfast / Lunch / Dinner)
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddMealMenuItem(activeAdminMealTab)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 text-xs font-black shadow-sm cursor-pointer hover:brightness-105"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Food</span>
                          </button>
                        </div>

                        {/* 3 Switching Buttons: Breakfast, Lunch, Dinner */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'breakfastMenu', label: 'Breakfast (সকাল)' },
                            { key: 'lunchMenu', label: 'Lunch (দুপুর)' },
                            { key: 'dinnerMenu', label: 'Dinner (রাত)' }
                          ].map((tab) => {
                            const active = activeAdminMealTab === tab.key;
                            const count = (singleHotelForm[tab.key] || []).length;
                            return (
                              <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveAdminMealTab(tab.key)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  active
                                    ? 'bg-slate-900 dark:bg-[#69EBDA] text-[#69EBDA] dark:text-slate-950 border-slate-900 dark:border-[#69EBDA]'
                                    : isLight
                                      ? 'bg-white text-slate-700 border-slate-200 hover:border-[#69EBDA]'
                                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-[#69EBDA]'
                                }`}
                              >
                                <span>{tab.label}</span>
                                {count > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-500/20">
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Items for Active Meal Tab */}
                        <div className="space-y-3">
                          {(singleHotelForm[activeAdminMealTab] || []).length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-3">
                              উপরের <strong>+ Add Food</strong> বাটনে ক্লিক করে খাবার, ছবি ও দাম যোগ করুন।
                            </p>
                          ) : (
                            (singleHotelForm[activeAdminMealTab] || []).map((mealItem, mIdx) => (
                              <div
                                key={mIdx}
                                className={`p-3 rounded-xl border space-y-2.5 ${
                                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-700/80'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-black text-teal-600 dark:text-[#69EBDA]">
                                    আইটেম #{mIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMealMenuItem(activeAdminMealTab, mIdx)}
                                    className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 flex items-center justify-center cursor-pointer"
                                    title="মুছে ফেলুন"
                                  >
                                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  <input
                                    type="text"
                                    value={mealItem.name}
                                    onChange={(e) => handleChangeMealMenuItem(activeAdminMealTab, mIdx, 'name', e.target.value)}
                                    placeholder="খাবারের নাম (Food Name)"
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden ${
                                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/70 border-slate-700 text-white'
                                    }`}
                                  />
                                  <input
                                    type="number"
                                    value={mealItem.price}
                                    onChange={(e) => handleChangeMealMenuItem(activeAdminMealTab, mIdx, 'price', e.target.value)}
                                    placeholder="দাম ৳ (Price)"
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden ${
                                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/70 border-slate-700 text-white'
                                    }`}
                                  />
                                </div>

                                {/* Photo Upload & Photo Link */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  {mealItem.photo && (
                                    <img
                                      src={mealItem.photo}
                                      alt={mealItem.name || 'food'}
                                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                                    />
                                  )}
                                  <input
                                    type="text"
                                    value={mealItem.photo}
                                    onChange={(e) => handleChangeMealMenuItem(activeAdminMealTab, mIdx, 'photo', e.target.value)}
                                    placeholder="খাবারের ছবির লিংক (Photo URL)"
                                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden ${
                                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/70 border-slate-700 text-white'
                                    }`}
                                  />
                                  <label className="px-3 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-[#69EBDA] text-xs font-extrabold cursor-pointer text-center shrink-0">
                                    Upload Photo
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadMealMenuPhoto(activeAdminMealTab, mIdx, f);
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            Check-in Time
                          </label>
                          <input
                            type="time"
                            value={singleHotelForm.checkInTime}
                            onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, checkInTime: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            Check-out Time
                          </label>
                          <input
                            type="time"
                            value={singleHotelForm.checkOutTime}
                            onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, checkOutTime: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. Destination Select Input Box */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Destination
                      </label>
                      <select
                        value={singleHotelForm.destinationId}
                        onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, destinationId: e.target.value }))}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all cursor-pointer ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      >
                        <option value="">Select Destination</option>
                        {destinationsList.map((dest) => (
                          <option key={dest.id} value={dest.id}>
                            {dest.destinationName || dest.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 5. Booking Price, Day & VAT/Tax (side by side) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Booking Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={singleHotelForm.bookingPrice}
                          onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, bookingPrice: e.target.value }))}
                          placeholder="0.00"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Day
                        </label>
                        <input
                          type="text"
                          value={singleHotelForm.bookingDays}
                          onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, bookingDays: e.target.value }))}
                          placeholder="1 Day"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          VAT & Tax (%)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          max="100"
                          value={singleHotelForm.vatTaxPercentage}
                          onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, vatTaxPercentage: e.target.value }))}
                          placeholder="5"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 6. short data type unlimited short info builder (+ and - icons, react-icons import support) */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            Short Info
                          </label>
                          <a
                            href="https://react-icons.github.io/react-icons/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#69EBDA] border border-[#69EBDA]/35 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>React Icons Website</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setIsUseIconModalOpen(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                            }`}
                          >
                            Use Icon System
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddShortInfoItem}
                          className="w-8 h-8 rounded-xl bg-[#69EBDA] text-slate-950 flex items-center justify-center shadow-sm hover:opacity-90 transition-all cursor-pointer"
                          title="Add short info"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {singleHotelForm.shortInfoItems.map((item, idx) => {
                          const parsedIcon = parseReactIconInput(item.icon);
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              {/* First: react-icons code input OR added icon preview with delete button */}
                              {parsedIcon ? (
                                <div
                                  className={`sm:w-56 shrink-0 px-3 py-2 rounded-xl border flex items-center justify-between gap-2 ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                                      : 'bg-slate-950 border-slate-800 text-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA] shrink-0">
                                      <DynamicReactIcon code={item.icon} className="w-4 h-4 text-[#69EBDA]" />
                                    </div>
                                    <span className="text-xs font-bold truncate" title={parsedIcon.iconName}>
                                      {parsedIcon.iconName}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeShortInfoItem(idx, 'icon', '')}
                                    className="w-6 h-6 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                                    title="Delete icon"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={item.icon}
                                  onChange={(e) => handleChangeShortInfoItem(idx, 'icon', e.target.value)}
                                  placeholder='import { Md... } from "react-icons/md";'
                                  className={`sm:w-56 shrink-0 px-3 py-2.5 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                  }`}
                                />
                              )}

                              {/* Second: short info input */}
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.text}
                                  onChange={(e) => handleChangeShortInfoItem(idx, 'text', e.target.value)}
                                  placeholder="Short Info"
                                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                    isLight
                                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                  }`}
                                />

                                {/* Third: - icon to delete box */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveShortInfoItem(idx)}
                                  className="w-9 h-9 shrink-0 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 flex items-center justify-center transition-all cursor-pointer"
                                  title="Remove"
                                >
                                  <Minus className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 7. details textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Details
                      </label>
                      <textarea
                        rows={4}
                        value={singleHotelForm.details}
                        onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, details: e.target.value }))}
                        placeholder="Enter full details..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all resize-y ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 8. default photo upload & link */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Default Photo
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <input
                          type="file"
                          id="single-hotel-default-photo"
                          accept="image/*"
                          onChange={handleUploadHotelDefaultPhoto}
                          className="hidden"
                        />
                        <label
                          htmlFor="single-hotel-default-photo"
                          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                          }`}
                        >
                          {isUploadingHotelDefaultPhoto ? (
                            <Loader2 className="w-4 h-4 text-[#69EBDA] animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-[#69EBDA]" />
                          )}
                          <span>Upload Photo</span>
                        </label>

                        <input
                          type="text"
                          value={singleHotelForm.defaultPhoto}
                          onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, defaultPhoto: e.target.value }))}
                          placeholder="Default Photo Link"
                          className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 9. Multiple Photos Upload & Link */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Multiple Photos
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <input
                          type="file"
                          id="single-hotel-gallery-photos"
                          accept="image/*"
                          multiple
                          onChange={handleUploadHotelGalleryPhotos}
                          className="hidden"
                        />
                        <label
                          htmlFor="single-hotel-gallery-photos"
                          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                          }`}
                        >
                          {isUploadingHotelGalleryPhotos ? (
                            <Loader2 className="w-4 h-4 text-[#69EBDA] animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-[#69EBDA]" />
                          )}
                          <span>Upload Photos</span>
                        </label>

                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={hotelGalleryLinkInput}
                            onChange={(e) => setHotelGalleryLinkInput(e.target.value)}
                            placeholder="Photo Link"
                            className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleAddHotelGalleryLink}
                            className="w-10 h-10 shrink-0 rounded-xl bg-[#69EBDA] text-slate-950 flex items-center justify-center shadow-sm hover:opacity-90 transition-all cursor-pointer"
                            title="Add photo link"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {singleHotelForm.galleryPhotos.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {singleHotelForm.galleryPhotos.map((photoUrl, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={photoUrl}
                                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border outline-hidden ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                                    : 'bg-slate-950/50 border-slate-800 text-slate-300'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveHotelGalleryPhoto(idx)}
                                className="w-8 h-8 shrink-0 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 flex items-center justify-center transition-all cursor-pointer"
                              >
                                <Minus className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 10. YouTube Video Link */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        YouTube Video Link
                      </label>
                      <input
                        type="text"
                        value={singleHotelForm.youtubeLink}
                        onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, youtubeLink: e.target.value }))}
                        placeholder="YouTube Video Link"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 11. Live Location Link */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Live Location Link
                      </label>
                      <input
                        type="text"
                        value={singleHotelForm.locationLink}
                        onChange={(e) => setSingleHotelForm((prev) => ({ ...prev, locationLink: e.target.value }))}
                        placeholder="Live Location Link"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* Submit / Cancel */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-xs shadow-md shadow-[#69EBDA]/25 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingSinglePostId ? 'Update Post' : 'Save'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSinglePostId(null);
                          setIsAddSingleHotelFormOpen(false);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          isLight
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Separate Service / Category View when a Button is Clicked */}
              {adminTransportCatTab && (
                <div
                  className={`p-5 sm:p-6 rounded-3xl border space-y-5 animate-in fade-in duration-200 ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-900/90 border-slate-800 shadow-2xl'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        {adminTransportCatTab === 'road'
                          ? 'Road Services'
                          : adminTransportCatTab === 'waterway'
                            ? 'River Services'
                            : adminTransportCatTab === 'air'
                              ? 'Air Services'
                              : adminTransportCatTab === 'hotel'
                                ? 'Hotel Services'
                                : 'Restaurant Services'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total{' '}
                        {adminTransportCatTab === 'hotel'
                          ? adminHotels.length
                          : adminTransportCatTab === 'restaurant'
                            ? adminRestaurants.length
                            : adminTransports.filter((t) => (t.category || 'road') === adminTransportCatTab).length}{' '}
                        posts in this section
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSinglePostId(null);
                          setSingleHotelForm((prev) => ({
                            ...prev,
                            serviceType:
                              adminTransportCatTab === 'hotel'
                                ? 'hotel'
                                : adminTransportCatTab === 'restaurant'
                                  ? 'restaurant'
                                  : 'transport',
                            transportCategory:
                              adminTransportCatTab === 'hotel' || adminTransportCatTab === 'restaurant'
                                ? prev.transportCategory
                                : adminTransportCatTab
                          }));
                          setIsAddSingleHotelFormOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#69EBDA] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Post Here</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminTransportCatTab(null)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                          isLight
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {adminTransportCatTab === 'hotel' ? (
                    adminHotels.length === 0 ? (
                      <div className="py-10 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                        No hotel posts found yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminHotels.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                              isLight
                                ? 'bg-slate-50/70 border-slate-200'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div>
                              {(item.defaultPhoto || item.image) && (
                                <img
                                  src={item.defaultPhoto || item.image}
                                  alt={item.name || 'Hotel'}
                                  className="w-full h-36 object-cover"
                                />
                              )}
                              <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                                    {item.name || 'Untitled Hotel'}
                                  </h4>
                                  <span className="text-xs font-extrabold text-[#0d9488] dark:text-[#69EBDA] shrink-0">
                                    ৳ {Number(item.bookingPrice ?? item.pricePerNight ?? 0).toLocaleString()}
                                  </span>
                                </div>
                                {(item.shortDescription || item.location) && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {item.shortDescription || item.location}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSinglePostId(item.id);
                                  setSingleHotelForm({
                                    serviceType: 'hotel',
                                    transportCategory: 'road',
                                    name: item.name || '',
                                    shortDescription: item.shortDescription || '',
                                    checkInTime: item.checkInTime || '',
                                    checkOutTime: item.checkOutTime || '',
                                    transportRoutes: [{ from: '', to: '', seats: '', price: '' }],
                                    destinationId: item.destinationId || item.location || '',
                                    bookingPrice:
                                      (item.bookingPrice ?? item.pricePerNight) != null
                                        ? String(item.bookingPrice ?? item.pricePerNight)
                                        : '',
                                    bookingDays: item.bookingDays || '1',
                                    vatTaxPercentage: item.vatTaxPercentage != null ? String(item.vatTaxPercentage) : '5',
                                    shortInfoItems:
                                      Array.isArray(item.shortInfoItems) && item.shortInfoItems.length > 0
                                        ? item.shortInfoItems
                                        : [{ icon: '', text: '' }],
                                    details: item.details || item.description || '',
                                    defaultPhoto: item.defaultPhoto || item.image || '',
                                    galleryPhotos: Array.isArray(item.galleryPhotos) ? item.galleryPhotos : [],
                                    youtubeLink: item.youtubeLink || '',
                                    locationLink: item.locationLink || ''
                                  });
                                  setIsAddSingleHotelFormOpen(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#0d9488] dark:text-[#69EBDA] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await StorageService.deleteHotel(item);
                                  setAdminHotels(StorageService.getHotels());
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : adminTransportCatTab === 'restaurant' ? (
                    adminRestaurants.length === 0 ? (
                      <div className="py-10 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                        No restaurant posts found yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminRestaurants.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                              isLight
                                ? 'bg-slate-50/70 border-slate-200'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div>
                              {(item.photo || item.defaultPhoto) && (
                                <img
                                  src={item.photo || item.defaultPhoto}
                                  alt={item.name || 'Restaurant'}
                                  className="w-full h-36 object-cover"
                                />
                              )}
                              <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                                    {item.name || 'Untitled Restaurant'}
                                  </h4>
                                  <span className="text-xs font-extrabold text-[#0d9488] dark:text-[#69EBDA] shrink-0">
                                    {item.rateLabel || `৳ ${Number(item.ratePerPerson || 0).toLocaleString()}`}
                                  </span>
                                </div>
                                {item.mealPlanType && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {item.mealPlanType}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSinglePostId(item.id);
                                  setSingleHotelForm({
                                    serviceType: 'restaurant',
                                    transportCategory: 'road',
                                    name: item.name || '',
                                    shortDescription: item.mealPlanType || '',
                                    checkInTime: '',
                                    checkOutTime: '',
                                    transportRoutes: [{ from: '', to: '', seats: '', price: '' }],
                                    breakfastMenu: Array.isArray(item.breakfastMenu)
                                      ? item.breakfastMenu.map((m) =>
                                          typeof m === 'object' ? { name: m.name || '', price: m.price ?? '', photo: m.photo || '' } : { name: String(m || ''), price: '', photo: '' }
                                        )
                                      : [],
                                    lunchMenu: Array.isArray(item.lunchMenu)
                                      ? item.lunchMenu.map((m) =>
                                          typeof m === 'object' ? { name: m.name || '', price: m.price ?? '', photo: m.photo || '' } : { name: String(m || ''), price: '', photo: '' }
                                        )
                                      : [],
                                    dinnerMenu: Array.isArray(item.dinnerMenu)
                                      ? item.dinnerMenu.map((m) =>
                                          typeof m === 'object' ? { name: m.name || '', price: m.price ?? '', photo: m.photo || '' } : { name: String(m || ''), price: '', photo: '' }
                                        )
                                      : [],
                                    destinationId: item.badge || '',
                                    bookingPrice: item.ratePerPerson != null ? String(item.ratePerPerson) : '',
                                    bookingDays: '1',
                                    vatTaxPercentage: '5',
                                    shortInfoItems:
                                      Array.isArray(item.shortInfoItems) && item.shortInfoItems.length > 0
                                        ? item.shortInfoItems
                                        : Array.isArray(item.tags) && item.tags.length > 0
                                          ? item.tags.map((t) => ({ icon: '', text: t }))
                                          : [{ icon: '', text: '' }],
                                    details: item.details || '',
                                    defaultPhoto: item.defaultPhoto || item.photo || '',
                                    galleryPhotos: Array.isArray(item.galleryPhotos) ? item.galleryPhotos : [],
                                    youtubeLink: item.youtubeLink || '',
                                    locationLink: item.locationLink || ''
                                  });
                                  setIsAddSingleHotelFormOpen(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#0d9488] dark:text-[#69EBDA] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await StorageService.deleteRestaurant(item);
                                  setAdminRestaurants(StorageService.getRestaurants());
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : adminTransports.filter((t) => (t.category || 'road') === adminTransportCatTab).length === 0 ? (
                    <div className="py-10 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                      No posts found in this transport category yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminTransports
                        .filter((t) => (t.category || 'road') === adminTransportCatTab)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                              isLight
                                ? 'bg-slate-50/70 border-slate-200'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div>
                              {(item.photo || item.defaultPhoto) && (
                                <img
                                  src={item.photo || item.defaultPhoto}
                                  alt={item.name || 'Transport'}
                                  className="w-full h-36 object-cover"
                                />
                              )}
                              <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                                    {item.name || 'Untitled Transport'}
                                  </h4>
                                  <span className="text-xs font-extrabold text-[#0d9488] dark:text-[#69EBDA] shrink-0">
                                    {item.fare || `৳ ${Number(item.bookingPrice || 0).toLocaleString()}`}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                                {Array.isArray(item.routeFares) && item.routeFares.length > 0 && (
                                  <div className="pt-1 space-y-1">
                                    {item.routeFares.slice(0, 3).map((rf, rIdx) => (
                                      <div
                                        key={rIdx}
                                        className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-[#69EBDA]/10 text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2"
                                      >
                                        <span className="truncate">
                                          {rf.from || 'From'} → {rf.to || 'To'}
                                        </span>
                                        <span className="shrink-0 font-bold">
                                          {rf.seats ? `${rf.seats} Seats • ` : ''}৳ {Number(rf.price || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSinglePostId(item.id);
                                  setSingleHotelForm({
                                    serviceType: 'transport',
                                    transportCategory: item.category || 'road',
                                    name: item.name || '',
                                    shortDescription: item.description || '',
                                    checkInTime: item.checkInTime || '',
                                    checkOutTime: item.checkOutTime || '',
                                    transportRoutes:
                                      Array.isArray(item.routeFares) && item.routeFares.length > 0
                                        ? item.routeFares.map((r) => ({
                                            from: r.from || '',
                                            to: r.to || '',
                                            seats: String(r.seats ?? ''),
                                            price: String(r.price ?? '')
                                          }))
                                        : [{ from: '', to: '', seats: '', price: '' }],
                                    destinationId: item.destinationId || '',
                                    bookingPrice: item.bookingPrice != null ? String(item.bookingPrice) : '',
                                    bookingDays: item.bookingDays || '',
                                    vatTaxPercentage: item.vatTaxPercentage != null ? String(item.vatTaxPercentage) : '5',
                                    shortInfoItems:
                                      Array.isArray(item.shortInfoItems) && item.shortInfoItems.length > 0
                                        ? item.shortInfoItems
                                        : Array.isArray(item.features) && item.features.length > 0
                                          ? item.features.map((f) => ({ icon: '', text: f }))
                                          : [{ icon: '', text: '' }],
                                    details: item.details || '',
                                    defaultPhoto: item.defaultPhoto || item.photo || '',
                                    galleryPhotos: Array.isArray(item.galleryPhotos) ? item.galleryPhotos : [],
                                    youtubeLink: item.youtubeLink || '',
                                    locationLink: item.locationLink || ''
                                  });
                                  setIsAddSingleHotelFormOpen(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#0d9488] dark:text-[#69EBDA] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await StorageService.deleteTransport(item.id);
                                  setAdminTransports(StorageService.getTransports());
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: POST UPDATE - 2. ADD TRANSPORT-RELATED UPDATE                        */}
          {/* ========================================================================= */}
          {activeTab === 'post-transport' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Action Button: add new Transport */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isAddTransportFormOpen && !editingTransportId) {
                      setIsAddTransportFormOpen(false);
                    } else {
                      setEditingTransportId(null);
                      setTransportFormData({
                        name: '',
                        category: 'road',
                        model: '',
                        capacity: '',
                        fare: '',
                        description: '',
                        photo: '',
                        features: ['']
                      });
                      setTransportPhotoLinkInput('');
                      setIsCustomCategoryMode(false);
                      setIsAddTransportFormOpen(true);
                    }
                  }}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-[#69EBDA]/25 hover:shadow-[#69EBDA]/40 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>add new Transport</span>
                </button>

                {/* Filter Tabs by Category */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTransportFilter('all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTransportFilter === 'all'
                        ? 'bg-[#69EBDA] text-slate-950 shadow-sm'
                        : isLight
                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    সকল বাহন ({transportsList.length})
                  </button>
                  {transportCategories.map((cat) => {
                    const count = transportsList.filter((t) => t.category === cat.id).length;
                    const isSelected = activeTransportFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveTransportFilter(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#69EBDA] text-slate-950 shadow-sm'
                            : isLight
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inline Form when 'add new Transport' is clicked */}
              <AnimatePresence>
                {isAddTransportFormOpen && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveTransport}
                    className={`p-6 rounded-3xl border max-w-2xl space-y-4 ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 shadow-2xl'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Car className="w-4 h-4 text-[#69EBDA]" />
                        <span>{editingTransportId ? 'Edit Transport' : 'add new Transport'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddTransportFormOpen(false);
                          setEditingTransportId(null);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 1. Transport Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Transport Name (বাহন / সার্ভিসের নাম)
                      </label>
                      <input
                        type="text"
                        required
                        value={transportFormData.name}
                        onChange={(e) => setTransportFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="যেমন: মার্সিডিজ-বেঞ্জ এস-ক্লাস / ভিআইপি রিভার ক্রুজ / প্রাইভেট হেলিকপ্টার..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 2. Transport Category Selection & Custom Category Creator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Transport Category (বাহন ক্যাটাগরি)
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomCategoryMode((prev) => !prev)}
                          className="text-[11px] font-bold text-teal-600 dark:text-[#69EBDA] hover:underline cursor-pointer"
                        >
                          {isCustomCategoryMode ? 'বিদ্যমান ক্যাটাগরি বেছে নিন' : '+ কাস্টম ক্যাটাগরি তৈরি করুন'}
                        </button>
                      </div>

                      {/* Standard / Existing Categories Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {transportCategories.map((cat) => {
                          const isSelected = transportFormData.category === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setTransportFormData((prev) => ({ ...prev, category: cat.id }))}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                isSelected
                                  ? 'bg-[#69EBDA]/15 border-[#69EBDA] text-slate-950 dark:text-white ring-2 ring-[#69EBDA]/40'
                                  : isLight
                                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#69EBDA] text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {cat.id === 'road' ? (
                                  <Car className="w-4 h-4" />
                                ) : cat.id === 'waterway' ? (
                                  <Ship className="w-4 h-4" />
                                ) : cat.id === 'air' ? (
                                  <Plane className="w-4 h-4" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-extrabold truncate">{cat.name}</span>
                                <span className="block text-[10px] text-slate-400 truncate">{cat.subtitle || 'ক্যাটাগরি'}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Category Inline Creator */}
                      {isCustomCategoryMode && (
                        <div className={`p-3.5 rounded-2xl border flex items-center gap-2 ${
                          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <input
                            type="text"
                            value={newCustomCategoryInput}
                            onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                            placeholder="নতুন ক্যাটাগরির নাম লিখুন (যেমন: স্পেশাল সাফারি / লাক্সারি ট্রেন)..."
                            className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-800 focus:border-[#69EBDA]'
                                : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleCreateCustomCategory}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs cursor-pointer shadow-sm hover:shadow-md shrink-0"
                          >
                            যোগ করুন
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. Model, Capacity & Fare */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          মডেল / সংস্করণ
                        </label>
                        <input
                          type="text"
                          value={transportFormData.model}
                          onChange={(e) => setTransportFormData((prev) => ({ ...prev, model: e.target.value }))}
                          placeholder="যেমন: S-Class 2024"
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          ধারণক্ষমতা (Capacity)
                        </label>
                        <input
                          type="text"
                          value={transportFormData.capacity}
                          onChange={(e) => setTransportFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                          placeholder="যেমন: ৪ জন যাত্রী"
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          ভাড়া / রেট (Fare)
                        </label>
                        <input
                          type="text"
                          value={transportFormData.fare}
                          onChange={(e) => setTransportFormData((prev) => ({ ...prev, fare: e.target.value }))}
                          placeholder="যেমন: ৳ ৮,০০০ / দিন"
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 4. Short Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        সংক্ষিপ্ত বিবরণ (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={transportFormData.description}
                        onChange={(e) => setTransportFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="যানবাহনটির সুযোগ-সুবিধা, ড্রাইভার ও রুট সম্পর্কিত বিবরণ..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all resize-none ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 5. Photo Upload & Link System */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        যানবাহনের ছবি (Photo Upload & Link)
                      </label>

                      {transportFormData.photo && (
                        <div className="relative w-full aspect-[16/9] max-h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group">
                          <img
                            src={transportFormData.photo}
                            alt="Transport Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setTransportFormData((prev) => ({ ...prev, photo: '' }))}
                            className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-950/80 hover:bg-rose-500 text-white backdrop-blur-md transition-all cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`
                          w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-dashed transition-all cursor-pointer
                          ${isLight
                            ? 'border-slate-300 hover:border-[#69EBDA] hover:bg-slate-50 text-slate-700'
                            : 'border-slate-700 hover:border-[#69EBDA] hover:bg-slate-800/60 text-slate-200'
                          }
                        `}>
                          {isUploadingTransportPhoto ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#69EBDA]" />
                              <span>আপলোড হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#69EBDA]" />
                              <span>Upload Photo File</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingTransportPhoto}
                            onChange={handleUploadTransportPhoto}
                            className="hidden"
                          />
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={transportPhotoLinkInput}
                            onChange={(e) => setTransportPhotoLinkInput(e.target.value)}
                            placeholder="বা ছবির লিংক পেস্ট করুন..."
                            className={`flex-1 min-w-0 px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleAddTransportPhotoLink}
                            className="px-3 py-2 rounded-xl bg-[#69EBDA]/20 hover:bg-[#69EBDA]/30 text-[#69EBDA] text-xs font-bold border border-[#69EBDA]/40 cursor-pointer shrink-0"
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 6. Vehicle Features (+ & - buttons) */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            ফিচার ও সুবিধাসমূহ (Features)
                          </label>
                          <span className="text-[10px] text-slate-400">
                            (+ ও - আইকন দিয়ে সুবিধাসমূহ যুক্ত করুন)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTransportFeature}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-95"
                          title="Add Feature"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add Feature</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {transportFormData.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#69EBDA]/15 text-[#69EBDA] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#69EBDA]/30">
                              {idx + 1}
                            </div>
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleChangeTransportFeature(idx, e.target.value)}
                              placeholder={`সুবিধা #${idx + 1} (যেমন: সম্পূর্ণ এসি / ওয়াইফাই / লাগেজ স্পেস)`}
                              className={`flex-1 min-w-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                isLight
                                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveTransportFeature(idx)}
                              className="w-8 h-8 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 flex items-center justify-center shrink-0 transition-all cursor-pointer border border-rose-500/20"
                              title="Remove this feature"
                            >
                              <Minus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-xs shadow-md shadow-[#69EBDA]/25 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingTransportId ? 'Update Transport' : 'Save Transport'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddTransportFormOpen(false);
                          setEditingTransportId(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          isLight
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Saved Transports Overview List in Admin */}
              {transportsList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {transportsList
                    .filter((t) => activeTransportFilter === 'all' || t.category === activeTransportFilter)
                    .map((item) => {
                      const photoSrc = item.photo || item.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                      const matchedCat = transportCategories.find((c) => c.id === item.category);

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                            isLight
                              ? 'bg-white border-slate-200 shadow-xs hover:border-[#69EBDA]/40'
                              : 'bg-slate-900/75 border-slate-800 hover:border-[#69EBDA]/40'
                          }`}
                        >
                          {/* Photo with Category Badge */}
                          <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                            <img
                              src={photoSrc}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-[#69EBDA] border border-[#69EBDA]/40 backdrop-blur-md">
                                {matchedCat?.name || item.categoryName || 'পরিবহন'}
                              </span>
                            </div>
                            {item.capacity && (
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white border border-white/20 backdrop-blur-md flex items-center gap-1">
                                  <Users className="w-3 h-3 text-[#69EBDA]" />
                                  <span>{item.capacity}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                                {item.name}
                              </h4>
                              {item.model && (
                                <p className="text-xs text-[#69EBDA] font-semibold mt-0.5 line-clamp-1">
                                  {item.model}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              {item.fare && (
                                <div className="mt-2 text-xs font-black text-teal-600 dark:text-[#69EBDA]">
                                  {item.fare}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditTransport(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#69EBDA] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransport(item.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: POST UPDATE - 3. ADD RESTAURANT-RELATED UPDATES                      */}
          {/* ========================================================================= */}
          {activeTab === 'post-restaurant' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddRestaurantFormOpen((prev) => !prev)}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-[#69EBDA]/25 hover:shadow-[#69EBDA]/40 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>add new restaurant</span>
                </button>
              </div>

              {isAddRestaurantFormOpen && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!restForm.name.trim()) return;
                    const rate = Number(restForm.ratePerPerson || 0);
                    await StorageService.saveRestaurant({
                      name: restForm.name.trim(),
                      mealPlanType: restForm.mealPlanType.trim(),
                      badge: restForm.badge.trim(),
                      ratePerPerson: rate,
                      rateLabel: `৳ ${rate.toLocaleString()} / জন`,
                      tags: restForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
                      breakfastMenu: restForm.breakfastMenu.split(',').map((t) => t.trim()).filter(Boolean),
                      lunchMenu: restForm.lunchMenu.split(',').map((t) => t.trim()).filter(Boolean),
                      dinnerMenu: restForm.dinnerMenu.split(',').map((t) => t.trim()).filter(Boolean),
                      photo: restForm.photo.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'
                    });
                    setRestForm({
                      name: '',
                      mealPlanType: 'AP (৩ বেলা সম্পূর্ণ খাবার)',
                      badge: 'Buffet & Dining',
                      ratePerPerson: '',
                      tags: '১০০% হালাল, ভেজ অপশন আছে',
                      breakfastMenu: '',
                      lunchMenu: '',
                      dinnerMenu: '',
                      photo: ''
                    });
                    setIsAddRestaurantFormOpen(false);
                    setCmsToast({ show: true, text: 'নতুন রেস্টুরেন্ট ডাইনিং প্ল্যান সংরক্ষণ করা হয়েছে!' });
                    setTimeout(() => setCmsToast({ show: false, text: '' }), 3500);
                  }}
                  className={`p-6 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/75 border-slate-800'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1">Restaurant / Dining Plan Name *</label>
                      <input
                        type="text"
                        required
                        value={restForm.name}
                        onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                        placeholder="যেমন: রয়্যাল সি-ফুড প্যাভিলিয়ন"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Meal Plan Type (AP / MAP / CP)</label>
                      <input
                        type="text"
                        value={restForm.mealPlanType}
                        onChange={(e) => setRestForm({ ...restForm, mealPlanType: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Badge (Buffet / Thali / Live BBQ)</label>
                      <input
                        type="text"
                        value={restForm.badge}
                        onChange={(e) => setRestForm({ ...restForm, badge: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Per Person Rate (৳)</label>
                      <input
                        type="number"
                        required
                        value={restForm.ratePerPerson}
                        onChange={(e) => setRestForm({ ...restForm, ratePerPerson: e.target.value })}
                        placeholder="1500"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={restForm.tags}
                        onChange={(e) => setRestForm({ ...restForm, tags: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Photo URL</label>
                      <input
                        type="url"
                        value={restForm.photo}
                        onChange={(e) => setRestForm({ ...restForm, photo: e.target.value })}
                        placeholder="https://..."
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Breakfast Menu (comma separated)</label>
                      <input
                        type="text"
                        value={restForm.breakfastMenu}
                        onChange={(e) => setRestForm({ ...restForm, breakfastMenu: e.target.value })}
                        placeholder="বুফে ব্রেকফাস্ট, কফি, ফল"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Lunch Menu (comma separated)</label>
                      <input
                        type="text"
                        value={restForm.lunchMenu}
                        onChange={(e) => setRestForm({ ...restForm, lunchMenu: e.target.value })}
                        placeholder="পোলাও, গ্রিলড চিকেন, সালাদ"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold block mb-1">Dinner Menu (comma separated)</label>
                      <input
                        type="text"
                        value={restForm.dinnerMenu}
                        onChange={(e) => setRestForm({ ...restForm, dinnerMenu: e.target.value })}
                        placeholder="লাইভ বারবিকিউ, নান, ডেজার্ট"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-[#69EBDA] text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Save Restaurant Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddRestaurantFormOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-500/40 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {restaurantsList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurantsList.map((rest) => (
                    <div
                      key={rest.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/75 border-slate-800'
                      }`}
                    >
                      <div>
                        <span className="text-[11px] font-extrabold text-[#69EBDA]">{rest.badge}</span>
                        <h4 className="text-sm font-extrabold mt-1">{rest.name}</h4>
                        <p className="text-xs opacity-75 mt-1">{rest.mealPlanType}</p>
                        <p className="text-xs font-black text-teal-500 mt-1">{rest.rateLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => StorageService.deleteRestaurant(rest)}
                        className="self-start px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/30 text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: POST UPDATE - 4. ADD DESTINATION (BUTTON + INLINE FORM)              */}
          {/* ========================================================================= */}
          {activeTab === 'post-destination' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Action Button: add new destination */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isAddDestFormOpen && !editingDestId) {
                      setIsAddDestFormOpen(false);
                    } else {
                      setEditingDestId(null);
                      setDestFormData({
                        destinationName: '',
                        title: '',
                        subtitle: '',
                        shortDescription: '',
                        image: ''
                      });
                      setIsAddDestFormOpen(true);
                    }
                  }}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-[#69EBDA]/25 hover:shadow-[#69EBDA]/40 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>add new destination</span>
                </button>
              </div>

              {/* Inline Form when 'add new destination' is clicked */}
              <AnimatePresence>
                {isAddDestFormOpen && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveDestination}
                    className={`p-6 rounded-3xl border max-w-2xl space-y-4 ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 shadow-2xl'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#69EBDA]" />
                        <span>{editingDestId ? 'Edit Destination' : 'add new destination'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddDestFormOpen(false);
                          setEditingDestId(null);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 1. destination Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        destination Name
                      </label>
                      <input
                        type="text"
                        required
                        value={destFormData.destinationName}
                        onChange={(e) => setDestFormData((prev) => ({ ...prev, destinationName: e.target.value }))}
                        placeholder="যেমন: সমুদ্র সৈকত / সাজেক ভ্যালি / কক্সবাজার..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 2. title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        title
                      </label>
                      <input
                        type="text"
                        required
                        value={destFormData.title}
                        onChange={(e) => setDestFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="যেমন: সমুদ্র সৈকত / মেঘের রাজ্য সাজেক..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 3. sub title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        sub title
                      </label>
                      <input
                        type="text"
                        value={destFormData.subtitle}
                        onChange={(e) => setDestFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="যেমন: নীল সমুদ্রের মোহনা ও বিলাসবহুল ওভারওয়াটার ভিলা..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 4. sort description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        sort description
                      </label>
                      <textarea
                        rows={3}
                        value={destFormData.shortDescription}
                        onChange={(e) => setDestFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                        placeholder="গন্তব্যের সংক্ষিপ্ত বিবরণ লিখুন..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all resize-none ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 5. Destination Card Photo (Upload or URL) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Destination Card Photo (Upload or Link)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="url"
                          value={destFormData.image}
                          onChange={(e) => setDestFormData((prev) => ({ ...prev, image: e.target.value }))}
                          placeholder="https://... (ছবির লিংক বা আপলোড করুন)"
                          className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                          }`}
                        />
                        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#69EBDA]/15 text-[#69EBDA] border border-[#69EBDA]/35 hover:bg-[#69EBDA]/25 cursor-pointer shrink-0">
                          <span className="inline-flex items-center">
                            {isUploadingDestImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          </span>
                          <span>{isUploadingDestImg ? 'Uploading...' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingDestImg}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingDestImg(true);
                              try {
                                const res = await uploadMediaFile(file, 'destinations');
                                if (res?.url) {
                                  setDestFormData((prev) => ({ ...prev, image: res.url }));
                                }
                              } catch (err) {
                                console.error('Destination image upload error:', err);
                              } finally {
                                setIsUploadingDestImg(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {destFormData.image && (
                        <div className="h-24 w-40 rounded-xl overflow-hidden border border-slate-700/60">
                          <img src={destFormData.image} alt="Destination preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-xs shadow-md shadow-[#69EBDA]/25 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingDestId ? 'Update Destination' : 'Save Destination'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddDestFormOpen(false);
                          setEditingDestId(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          isLight
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Saved Destinations Overview List */}
              {destinationsList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {destinationsList.map((dest) => {
                    return (
                      <div
                        key={dest.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                          isLight
                            ? 'bg-white border-slate-200 shadow-xs'
                            : 'bg-slate-900/75 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] border border-[#69EBDA]/30 text-[11px] font-extrabold">
                              {dest.destinationName || dest.title}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {dest.title}
                          </h4>
                          {dest.subtitle && (
                            <p className="text-xs text-[#69EBDA] font-semibold mt-0.5">
                              {dest.subtitle}
                            </p>
                          )}
                          {dest.shortDescription && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                              {dest.shortDescription}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditDestination(dest)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#69EBDA] text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDestination(dest.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: POST UPDATE - 5. ADD NEW SERVICES (BUTTON + INLINE FORM + OVERVIEW)  */}
          {/* ========================================================================= */}
          {activeTab === 'post-services' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Action Button: add new services */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isAddServiceFormOpen && !editingServiceId) {
                      setIsAddServiceFormOpen(false);
                    } else {
                      setEditingServiceId(null);
                      setServiceFormData({
                        name: '',
                        description: '',
                        photo: '',
                        icon: '',
                        items: ['']
                      });
                      setServicePhotoLinkInput('');
                      setIsAddServiceFormOpen(true);
                    }
                  }}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-[#69EBDA]/25 hover:shadow-[#69EBDA]/40 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>add new services</span>
                </button>
              </div>

              {/* Inline Form when 'add new services' is clicked */}
              <AnimatePresence>
                {isAddServiceFormOpen && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveService}
                    className={`p-6 rounded-3xl border max-w-2xl space-y-4 ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 shadow-2xl'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#69EBDA]" />
                        <span>{editingServiceId ? 'Edit Service' : 'add new services'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddServiceFormOpen(false);
                          setEditingServiceId(null);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 1. services name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        services name
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceFormData.name}
                        onChange={(e) => setServiceFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="যেমন: ফ্লাইট টিকিট বুকিং / বিলাসবহুল পরিবহন সেবা / রিসোর্ট রিজার্ভেশন..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 2. services decription */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        services decription
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={serviceFormData.description}
                        onChange={(e) => setServiceFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="সার্ভিসের আওতাভুক্ত সুবিধা ও বিস্তারিত বিবরণ লিখুন..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all resize-none ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                        }`}
                      />
                    </div>

                    {/* 3. React Icon Input with Live Preview */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          React Icon (সার্ভিস কার্ডের আইকন)
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (React Icons কোড বা নাম লিখুন)
                        </span>
                      </div>

                      {(() => {
                        const parsedIcon = parseReactIconInput(serviceFormData.icon);
                        if (parsedIcon) {
                          return (
                            <div className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800'
                                : 'bg-slate-950/80 border-slate-800 text-slate-100'
                            }`}>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-[#69EBDA]/40 flex items-center justify-center text-[#69EBDA] shrink-0 shadow-sm">
                                  <DynamicReactIcon code={serviceFormData.icon} className="w-[25px] h-[25px] text-[#69EBDA]" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold block truncate" title={parsedIcon.iconName}>
                                    {parsedIcon.iconName}
                                  </span>
                                  <span className="text-[10px] text-teal-600 dark:text-[#69EBDA] font-semibold">
                                    Pack: {parsedIcon.pack?.toUpperCase() || 'REACT-ICONS'} (25px)
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setServiceFormData((prev) => ({ ...prev, icon: '' }))}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 transition-all cursor-pointer"
                                title="Remove Icon"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        }

                        return (
                          <input
                            type="text"
                            value={serviceFormData.icon || ''}
                            onChange={(e) => setServiceFormData((prev) => ({ ...prev, icon: e.target.value }))}
                            placeholder='যেমন: import { FaPlane } from "react-icons/fa"; বা FaPlane / Plane'
                            className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                        );
                      })()}
                    </div>

                    {/* 4. services card photo: Upload & Link System */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        services card photo (Photo Upload & Link)
                      </label>

                      {/* Photo preview if present */}
                      {serviceFormData.photo && (
                        <div className="relative w-full aspect-[16/9] max-h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group">
                          <img
                            src={serviceFormData.photo}
                            alt="Service Card Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setServiceFormData((prev) => ({ ...prev, photo: '' }))}
                            className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-950/80 hover:bg-rose-500 text-white backdrop-blur-md transition-all cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option A: File Upload */}
                        <div>
                          <label className={`
                            w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-dashed transition-all cursor-pointer
                            ${isLight
                              ? 'border-slate-300 hover:border-[#69EBDA] hover:bg-slate-50 text-slate-700'
                              : 'border-slate-700 hover:border-[#69EBDA] hover:bg-slate-800/60 text-slate-200'
                            }
                          `}>
                            {isUploadingServicePhoto ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#69EBDA]" />
                                <span>আপলোড হচ্ছে...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-[#69EBDA]" />
                                <span>Upload Photo File</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingServicePhoto}
                              onChange={handleUploadServicePhoto}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Option B: Photo Link URL Input */}
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={servicePhotoLinkInput}
                            onChange={(e) => setServicePhotoLinkInput(e.target.value)}
                            placeholder="বা ছবির লিংক পেস্ট করুন..."
                            className={`flex-1 min-w-0 px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleAddServicePhotoLink}
                            className="px-3 py-2 rounded-xl bg-[#69EBDA]/20 hover:bg-[#69EBDA]/30 text-[#69EBDA] text-xs font-bold border border-[#69EBDA]/40 cursor-pointer shrink-0"
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 5. Unlimited Service Items / Features (+ & - buttons) */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            সার্ভিস আইটেমস / সুবিধাসমূহ (Unlimited Items)
                          </label>
                          <span className="text-[10px] text-slate-400">
                            (+ ও - আইকন ব্যবহার করে ইচ্ছামতো আইটেম টেক্সট যুক্ত করুন)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddServiceItem}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-95"
                          title="নতুন আইটেম যোগ করুন"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add Item</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {serviceFormData.items && serviceFormData.items.length > 0 ? (
                          serviceFormData.items.map((itemText, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-[#69EBDA]/15 text-[#69EBDA] text-[11px] font-black flex items-center justify-center shrink-0 border border-[#69EBDA]/30">
                                {idx + 1}
                              </div>
                              <input
                                type="text"
                                value={itemText}
                                onChange={(e) => handleChangeServiceItem(idx, e.target.value)}
                                placeholder={`আইটেম #${idx + 1} (যেমন: ফার্স্ট ও বিজনেস ক্লাস ডেস্ক / ভিআইপি ফাস্ট-ট্র্যাক)`}
                                className={`flex-1 min-w-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border outline-hidden transition-all ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceItem(idx)}
                                className="w-8 h-8 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 flex items-center justify-center shrink-0 transition-all cursor-pointer border border-rose-500/20"
                                title="Remove this item"
                              >
                                <Minus className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className={`p-4 rounded-xl border border-dashed text-center ${
                            isLight ? 'border-slate-300 text-slate-400' : 'border-slate-800 text-slate-500'
                          }`}>
                            <p className="text-xs font-medium">কোনো আইটেম নেই। উপরে "Add Item" এ ক্লিক করুন।</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-xs shadow-md shadow-[#69EBDA]/25 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingServiceId ? 'Update Service' : 'Save Service'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddServiceFormOpen(false);
                          setEditingServiceId(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          isLight
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Saved Services Overview List in Admin */}
              {servicesList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {servicesList.map((srv) => {
                    const photoSrc = srv.photo || srv.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
                    const sName = srv.name || srv.title || 'সার্ভিস';
                    const sDesc = srv.description || srv.desc || '';
                    const sItems = Array.isArray(srv.items) && srv.items.length > 0
                      ? srv.items
                      : Array.isArray(srv.perks)
                      ? srv.perks
                      : [];

                    return (
                      <div
                        key={srv.id}
                        className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                          isLight
                            ? 'bg-white border-slate-200 shadow-xs hover:border-[#69EBDA]/40'
                            : 'bg-slate-900/75 border-slate-800 hover:border-[#69EBDA]/40'
                        }`}
                      >
                        {/* Service Card Photo with Icon Badge */}
                        <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                          <img
                            src={photoSrc}
                            alt={sName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-[#69EBDA] border border-[#69EBDA]/40 backdrop-blur-md">
                              Active Service
                            </span>
                          </div>

                          {/* Icon Overlay (25px) */}
                          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#69EBDA] shadow-md">
                            <DynamicReactIcon code={srv.icon} className="w-[25px] h-[25px] text-[#69EBDA]" />
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {sName}
                            </h4>
                            {srv.subtitle && (
                              <p className="text-xs text-[#69EBDA] font-semibold mt-0.5 line-clamp-1">
                                {srv.subtitle}
                              </p>
                            )}
                            {sDesc && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                                {sDesc}
                              </p>
                            )}

                            {/* Items count / list snippet */}
                            {sItems.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 dark:text-slate-400 font-bold">সুবিধাসমূহ:</span>
                                <span className="px-2 py-0.5 rounded-md bg-[#69EBDA]/15 text-[#69EBDA] font-bold">
                                  {sItems.length} টি আইটেম
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 mt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditService(srv)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#69EBDA] text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(srv.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: DASHBOARD (BUSINESS OVERVIEW, ANALYTICS & EXPENSE LEDGER)            */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <AdminExecutiveDashboard
              mode="dashboard"
              language={language}
              isLight={isLight}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: CUSTOMER ORDER (ORDERS, CALENDAR, PAYMENTS, INVOICES & CRM)          */}
          {/* ========================================================================= */}
          {activeTab === 'customer-order' && (
            <AdminExecutiveDashboard
              mode="customer-order"
              language={language}
              isLight={isLight}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: CONTACT CONTROL (WEBSITE WHATSAPP, PHONE & CONTACT SETTINGS)         */}
          {/* ========================================================================= */}
          {activeTab === 'contact-control' && (
            <AdminContactControl
              language={language}
              isLight={isLight}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: ABOUT CONTROL (ABOUT PAGE REALTIME CMS)                              */}
          {/* ========================================================================= */}
          {activeTab === 'about-control' && (
            <AdminAboutControl
              language={language}
              isLight={isLight}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: FOOTER CONTROL (FOOTER, SOCIAL MEDIA & PAYMENT LOGOS CMS)            */}
          {/* ========================================================================= */}
          {activeTab === 'footer-control' && (
            <AdminFooterControl
              language={language}
              isLight={isLight}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: SERVICES CONTROL (ENABLE / DISABLE CORE SERVICES REALTIME)           */}
          {/* ========================================================================= */}
          {activeTab === 'services-control' && (
            <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border animate-in fade-in duration-300 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                    <Layers className="w-6 h-6 text-teal-500" />
                    <span>{language === 'en' ? 'Services Control' : 'সার্ভিসেস কন্ট্রোল'}</span>
                  </h2>
                  <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {language === 'en'
                      ? 'Enable or disable the 3 core website services in real time. Disabled services still appear on the homepage, and clicking them displays a notice modal.'
                      : 'ওয়েবসাইটের ৩টি মূল সার্ভিস রিয়েল-টাইমে Enable বা Disable করুন। Disable থাকলে হোমপেজে কার্ড দেখাবে, তবে ক্লিক করলে সার্ভিসটি বন্ধ থাকার নোটিশ মডাল ওপেন হবে।'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    id: 'hotels',
                    title: 'Hotels & Resorts',
                    subtitle: language === 'en' ? 'Luxury stays & room booking' : 'হোটেল ও রিসোর্ট বুকিং সার্ভিস',
                    icon: Hotel,
                    accent: 'from-teal-500 to-emerald-500'
                  },
                  {
                    id: 'transport',
                    title: 'Transport & Vehicles',
                    subtitle: language === 'en' ? 'Private cars & tourist vehicles' : 'ট্রান্সপোর্ট ও যানবাহন সার্ভিস',
                    icon: Car,
                    accent: 'from-cyan-500 to-blue-500'
                  },
                  {
                    id: 'restaurant',
                    title: 'Restaurant & Dining',
                    subtitle: language === 'en' ? '3-time meal plans & dining' : 'রেস্টুরেন্ট ও ডাইনিং সার্ভিস',
                    icon: UtensilsCrossed,
                    accent: 'from-amber-500 to-orange-500'
                  }
                ].map((svc) => {
                  const IconComp = svc.icon;
                  const isEnabled = servicesControl?.[svc.id] !== false;
                  return (
                    <div
                      key={svc.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-5 ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 hover:border-teal-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-teal-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${svc.accent} flex items-center justify-center text-white shadow-lg shrink-0`}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-black tracking-tight">{svc.title}</h3>
                            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {svc.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                            isEnabled
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleServiceControl(svc.id, svc.title)}
                          aria-pressed={isEnabled}
                          className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                            isEnabled
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/25'
                              : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/25'
                          }`}
                        >
                          <span
                            className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                              isEnabled ? 'bg-white/30 justify-end' : 'bg-black/25 justify-start'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full bg-white shadow" />
                          </span>
                          <span>{isEnabled ? 'Enable' : 'Disable'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transport Sub-Services Control (Road, River, Airline) */}
              <div className="mt-8 pt-7 border-t border-slate-200 dark:border-slate-800">
                <div className="mb-5">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <Car className="w-5 h-5 text-cyan-500" />
                    <span>{language === 'en' ? 'Transport Sub-Services Control' : 'ট্রান্সপোর্ট সাব-সার্ভিসেস কন্ট্রোল'}</span>
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {language === 'en'
                      ? 'Individually enable or disable Road Service, River Service, and Airline Services.'
                      : 'Road Service, River Service এবং Airline Services আলাদাভাবে Enable বা Disable করুন।'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      id: 'road',
                      title: 'Road Service',
                      subtitle: language === 'en' ? 'Cars, Jeeps & Microbuses' : 'সড়ক পথের যানবাহন সার্ভিস',
                      icon: Car,
                      accent: 'from-cyan-500 to-teal-500'
                    },
                    {
                      id: 'waterway',
                      title: 'River Service',
                      subtitle: language === 'en' ? 'Cruises, Boats & Speedboats' : 'নদী পথের নৌযান সার্ভিস',
                      icon: Ship,
                      accent: 'from-blue-500 to-indigo-500'
                    },
                    {
                      id: 'air',
                      title: 'Airline Services',
                      subtitle: language === 'en' ? 'Flights, Helicopters & Jets' : 'আকাশ পথের এয়ারলাইন সার্ভিস',
                      icon: Plane,
                      accent: 'from-violet-500 to-purple-500'
                    }
                  ].map((subSvc) => {
                    const SubIcon = subSvc.icon;
                    const isSubEnabled = servicesControl?.[subSvc.id] !== false;
                    const itemCount = transportsList.filter((t) => t.category === subSvc.id).length;
                    return (
                      <div
                        key={subSvc.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-5 ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 hover:border-cyan-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subSvc.accent} flex items-center justify-center text-white shadow-lg shrink-0`}>
                              <SubIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-black tracking-tight">
                                {subSvc.title} ({itemCount})
                              </h4>
                              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {subSvc.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                              isSubEnabled
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSubEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {isSubEnabled ? 'Enabled' : 'Disabled'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleServiceControl(subSvc.id, subSvc.title)}
                            aria-pressed={isSubEnabled}
                            className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                              isSubEnabled
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/25'
                                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/25'
                            }`}
                          >
                            <span
                              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                                isSubEnabled ? 'bg-white/30 justify-end' : 'bg-black/25 justify-start'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full bg-white shadow" />
                            </span>
                            <span>{isSubEnabled ? 'Enable' : 'Disable'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SEO CONTROL (REALTIME SEO & META TAGS CMS)                           */}
          {/* ========================================================================= */}
          {activeTab === 'seo-control' && (
            <AdminSeoControl
              language={language}
              isLight={isLight}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: ADMIN CONTROL (PROMOTE USER TO NORMAL ADMIN / DEMOTE TO USER)       */}
          {/* ========================================================================= */}
          {activeTab === 'admin-control' && (
            <AdminControl
              language={language}
              isLight={isLight}
              isRoot={isRoot}
              onShowToast={(text) => {
                setCmsToast({ show: true, text });
                setTimeout(() => setCmsToast({ show: false, text: '' }), 4000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: SETTINGS (ADMIN SYSTEM CONFIGURATION)                                */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border animate-in fade-in duration-300 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-500 shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === 'en' ? 'Admin System Configuration' : 'অ্যাডমিন সিস্টেম কনফিগারেশন'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[10px] font-black border border-amber-400/30">
                        ROOT
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'en' 
                        ? 'Root Admin Profile & Credentials Settings' 
                        : 'রুট অ্যাডমিন প্রোফাইল সেটিংস ও কনফিগারেশন'}
                    </p>
                  </div>
                </div>

                {settingsSavedToast && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>কনফিগারেশন সংরক্ষিত হয়েছে</span>
                  </div>
                )}
              </div>

              {/* Minimal Clean Standard Configuration Form */}
              <form onSubmit={handleSaveRootAdminProfile} className="space-y-5 max-w-2xl">
                
                {/* Photo Management: Upload & Web Link */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
                }`}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    {language === 'en' ? 'Admin Photo' : 'অ্যাডমিন ছবি'}
                  </label>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Live Preview */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-[#69EBDA]/70 overflow-hidden shrink-0 bg-slate-800 shadow-inner group">
                      {profileFormData.avatar ? (
                        <img 
                          src={profileFormData.avatar} 
                          alt="Admin Avatar Preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Mode Selection & Photo Inputs */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setAvatarInputMode('upload')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              avatarInputMode === 'upload'
                                ? 'bg-white dark:bg-slate-900 text-[#69EBDA] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>ফাইল আপলোড</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarInputMode('link')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              avatarInputMode === 'link'
                                ? 'bg-white dark:bg-slate-900 text-[#69EBDA] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>ছবির লিংক</span>
                          </button>
                        </div>

                        {profileFormData.avatar && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-[11px] font-bold transition-all cursor-pointer"
                            title="ছবি রিমুভ করুন"
                          >
                            ছবি মুছুন
                          </button>
                        )}
                      </div>

                      {avatarInputMode === 'upload' ? (
                        <div>
                          <input
                            type="file"
                            id="admin-photo-file-upload"
                            accept="image/*"
                            disabled={isUploadingPhoto}
                            onChange={handlePhotoFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="admin-photo-file-upload"
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 ${
                              isUploadingPhoto
                                ? 'opacity-70 cursor-wait bg-slate-200 dark:bg-slate-800 text-slate-400'
                                : 'bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer'
                            }`}
                          >
                            {isUploadingPhoto ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 text-[#69EBDA] animate-spin" />
                                <span>Supabase বাকেটে আপলোড হচ্ছে...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-[#69EBDA]" />
                                <span>ছবি আপলোড করুন</span>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="url"
                            value={profileFormData.avatar}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, avatar: e.target.value }))}
                            placeholder="ছবির ওয়েব লিংক (URL) লিখুন..."
                            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border outline-hidden transition-all ${
                              isLight 
                                ? 'bg-white border-slate-200 text-slate-800 focus:border-[#69EBDA]' 
                                : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-[#69EBDA]'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Minimal Input Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCog className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>{language === 'en' ? 'Admin Name' : 'অ্যাডমিন নাম'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">ঐচ্ছিক</span>
                    </label>
                    <input
                      type="text"
                      value={profileFormData.name}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="অ্যাডমিন নাম"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>{language === 'en' ? 'Admin Phone No' : 'অ্যাডমিন ফোন নম্বর'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">ঐচ্ছিক</span>
                    </label>
                    <input
                      type="tel"
                      value={profileFormData.phone}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+880 1XXXXXXXXX"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>{language === 'en' ? 'Admin Gmail' : 'অ্যাডমিন জিমেইল'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">ঐচ্ছিক</span>
                    </label>
                    <input
                      type="email"
                      value={profileFormData.email}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@gmail.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>{language === 'en' ? 'Address' : 'ঠিকানা'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">ঐচ্ছিক</span>
                    </label>
                    <input
                      type="text"
                      value={profileFormData.address}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="ঢাকা, বাংলাদেশ"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>{language === 'en' ? 'Developer Portfolio Link (Footer)' : 'ডেভেলপার পোর্টফোলিও লিংক (ফুটারের Developer By MD.Touhid)'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">ঐচ্ছিক</span>
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://your-portfolio-link.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingRootProfile || isUploadingPhoto}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-[#69EBDA]/25 hover:shadow-lg hover:shadow-[#69EBDA]/35 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingRootProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'en' ? 'Saving to Supabase...' : 'Supabase-এ সেভ হচ্ছে...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{language === 'en' ? 'Save Settings' : 'সংরক্ষণ করুন'}</span>
                      </>
                    )}
                  </button>
                  {settingsError && (
                    <span className="text-xs text-rose-500 font-semibold animate-in fade-in">
                      {settingsError}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

        </main>

      </div>

      {/* Use Icon System Guide Modal */}
      <AnimatePresence>
        {isUseIconModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#69EBDA]" />
                  <span>use icon system (আইকন ব্যবহারের নিয়ম)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUseIconModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold">
                  ১. প্রথমে পাশে থাকা{' '}
                  <a
                    href="https://react-icons.github.io/react-icons/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#69EBDA] underline font-bold"
                  >
                    react-icons website
                  </a>{' '}
                  লিংকে ক্লিক করে ওয়েবসাইটে যান।
                </p>
                <p className="font-semibold">
                  ২. আপনার পছন্দের যেকোনো আইকন সার্চ করে আইকনটির ওপর ক্লিক করুন এবং উপরের <strong>import</strong> কোডটি কপি করুন:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 text-[#69EBDA] font-mono text-xs overflow-x-auto border border-[#69EBDA]/30">
                  import &#123; MdSignalWifiStatusbarConnectedNoInternet &#125; from &quot;react-icons/md&quot;;
                </div>
                <p className="font-semibold">
                  ৩. এরপর ফর্মের <strong>short info</strong>-এর বাম পাশের আইকন ইনপুট বক্সে কোডটি পেস্ট করলেই সাথে সাথে আইকনটি যুক্ত হয়ে যাবে।
                </p>
                <p className="font-semibold">
                  ৪. যুক্ত হওয়া আইকনটির ডান পাশের <strong>✕</strong> বাটনে ক্লিক করে যেকোনো সময় আইকনটি ডিলিট বা পরিবর্তন করতে পারবেন।
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsUseIconModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#69EBDA] text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  বুঝেছি (Close)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CMS Live Feedback Toast */}
      <AnimatePresence>
        {cmsToast?.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-[#69EBDA]/50 shadow-2xl text-xs font-bold text-white max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{cmsToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
