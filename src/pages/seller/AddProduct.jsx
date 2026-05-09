import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/index';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2Rounded';
import StyleIcon from '@mui/icons-material/StyleRounded';
import SellIcon from '@mui/icons-material/SellRounded';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    gender: 'unisex',
    description: '',
    isAvailableForRent: false,
    rentPricePerDay: '',
    discountPercent: '',
  });

  const [colorList, setColorList] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colorMedia, setColorMedia] = useState({}); // { "Blue": [File, File] }
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeStocks, setSizeStocks] = useState({}); // { 'S': 10, 'M': 5 }
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [existingProduct, setExistingProduct] = useState(null);
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      const loadProduct = async () => {
        setFetching(true);
        try {
          const res = await api.get(`/seller/dashboard/products/${id}`);
          const p = res.data.product;
          setExistingProduct(p);
          setFormData({
            name: p.name || '',
            brand: p.brand || '',
            category: p.category || '',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            stock: p.sizes?.reduce((a, s) => a + s.stock, 0) || 0,
            gender: p.gender || 'unisex',
            description: p.description || '',
            isAvailableForRent: p.isAvailableForRent || false,
            rentPricePerDay: p.rentPricePerDay || '',
            discountPercent: p.price && p.discountPrice 
              ? Math.round(((p.price - p.discountPrice) / p.price) * 100) 
              : '',
          });
          setColorList(p.colors || []);
          const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          const filteredSizes = p.sizes?.filter(s => standardSizes.includes(s.size)) || [];
          setSelectedSizes(filteredSizes.map(s => s.size));
          setSelectedTags(p.tags || []);
          setSelectedOccasions(p.occasion || []);
          setSelectedWeather(p.weather || []);
          
          const stocks = {};
          filteredSizes.forEach(s => {
            stocks[s.size] = s.stock;
          });
          setSizeStocks(stocks);

          const media = {};
          p.colors?.forEach(c => media[c] = []);
          setColorMedia(media);
        } catch (err) {
          setError('Failed to load product for editing');
        } finally {
          setFetching(false);
        }
      };
      loadProduct();
    }
  }, [id]);

  function handleManualColorAdd() {
    if (colorInput.trim()) {
      const newColor = colorInput.trim();
      if (!colorList.includes(newColor)) {
        setColorList([...colorList, newColor]);
        setColorMedia({ ...colorMedia, [newColor]: [] });
      }
      setColorInput('');
    }
  }

  function handleColorAdd(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualColorAdd();
    }
  }

  const removeColor = (color) => {
    setColorList(colorList.filter(c => c !== color));
    const newMedia = { ...colorMedia };
    delete newMedia[color];
    setColorMedia(newMedia);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7); // 70% quality
        };
      };
    });
  };

  const handleColorMediaChange = async (color, e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const compressedFiles = await Promise.all(newFiles.map(file => compressImage(file)));
      
      setColorMedia({
        ...colorMedia,
        [color]: [...(colorMedia[color] || []), ...compressedFiles].slice(0, 4)
      });
    }
  };

  const removeColorFile = (color, index) => {
    const updatedFiles = [...colorMedia[color]];
    updatedFiles.splice(index, 1);
    setColorMedia({ ...colorMedia, [color]: updatedFiles });
  };

  const allClothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['6', '7', '8', '9', '10', '11', '12'];
  const jeansSizes = ['28', '30', '32', '34', '36', '38', '40'];
  const accessorySizes = ['One Size'];
  
  const getActiveSizes = () => {
    const cat = formData.category?.toLowerCase();
    if (cat === 'shoes') return shoeSizes;
    if (cat === 'jeans') return jeansSizes;
    if (cat === 'accessory' || cat === 'bag' || cat === 'jewelry') return accessorySizes;
    return allClothingSizes;
  };
  const activeSizes = getActiveSizes();
  const allTags = ['casual', 'formal', 'party', 'wedding', 'sporty', 'bohemian', 'streetwear', 'vintage', 'minimalist', 'trendy', 'classic', 'layering', 'semi-formal'];
  const allOccasions = ['office', 'wedding', 'party', 'date-night', 'casual', 'gym', 'beach', 'festival', 'interview'];
  const allWeather = ['hot', 'cold', 'mild', 'rainy', 'all-season'];

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
      const newStocks = { ...sizeStocks };
      delete newStocks[size];
      setSizeStocks(newStocks);
    } else {
      setSelectedSizes(prev => [...prev, size]);
      setSizeStocks(prev => ({ ...prev, [size]: '' }));
    }
  };

  // Clear sizes if category changes between standard, shoes, jeans, and accessories
  useEffect(() => {
    const cat = formData.category?.toLowerCase();
    const isShoes = cat === 'shoes';
    const isJeans = cat === 'jeans';
    const isOneSize = cat === 'accessory' || cat === 'bag' || cat === 'jewelry';
    
    const hasClothing = selectedSizes.some(s => allClothingSizes.includes(s));
    const hasShoes = selectedSizes.some(s => shoeSizes.includes(s));
    const hasJeans = selectedSizes.some(s => jeansSizes.includes(s));
    const hasOneSize = selectedSizes.some(s => accessorySizes.includes(s));

    const mismatch = (isShoes && (hasClothing || hasJeans || hasOneSize)) ||
                     (isJeans && (hasClothing || hasShoes || hasOneSize)) ||
                     (isOneSize && (hasClothing || hasShoes || hasJeans)) ||
                     (!isShoes && !isJeans && !isOneSize && (hasShoes || hasJeans || hasOneSize));

    if (mismatch) {
      if (!fetching) {
        setSelectedSizes([]);
        setSizeStocks({});
      }
    }
  }, [formData.category]);

  const handleSizeStockChange = (size, value) => {
    setSizeStocks(prev => ({ ...prev, [size]: value }));
  };

  const toggleArrayItem = (item, setter) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'price' || name === 'discountPercent') {
      const basePrice = name === 'price' ? parseFloat(value) : parseFloat(formData.price);
      const percent = name === 'discountPercent' ? parseFloat(value) : parseFloat(formData.discountPercent);

      if (!isNaN(basePrice) && !isNaN(percent)) {
        const salePrice = basePrice - (basePrice * (percent / 100));
        newFormData.discountPrice = salePrice.toFixed(2);
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (colorList.length === 0) {
      setError('Please add at least one color variant.');
      return;
    }
    
    setLoading(true);
    setError('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    submitData.append('colors', JSON.stringify(colorList));
    submitData.append('tags', JSON.stringify(selectedTags));
    submitData.append('occasion', JSON.stringify(selectedOccasions));
    submitData.append('weather', JSON.stringify(selectedWeather));

    if (selectedSizes.length > 0) {
      const sizesData = selectedSizes.map(size => ({
        size,
        stock: parseInt(sizeStocks[size]) || 0
      }));
      submitData.append('sizes', JSON.stringify(sizesData));
    }

    // Append color-specific images
    colorList.forEach(color => {
      const filesForColor = colorMedia[color] || [];
      filesForColor.forEach(file => {
        submitData.append(`colorMedia_${color}`, file);
      });
    });

    try {
      if (isEdit) {
        await api.put(`/seller/dashboard/products/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Masterpiece updated successfully!');
      } else {
        await api.post('/seller/dashboard/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Masterpiece published successfully!');
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const inputStyles = {
    container: { display: 'grid', gap: '8px' },
    label: { fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginLeft: '4px' },
    field: {
      width: '100%', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
      background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
      color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: '0 24px 60px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '12px', marginTop: '0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-bg)', color: 'var(--accent-light)', fontSize: '9px', fontWeight: 800, marginBottom: '4px', letterSpacing: '0.5px' }}>
            <AutoAwesomeIcon sx={{ fontSize: 12 }} /> SELLER STUDIO
          </div>
          <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '0', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {isEdit ? 'Refine Your Product' : 'List Your Masterpiece'}
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '40px', alignItems: 'start' }}>

          {/* Left Column: Media & Quick Stats */}
          <div style={{ display: 'grid', gap: '30px', position: 'sticky', top: '100px', maxHeight: '80vh', overflowY: 'auto', paddingRight: '10px' }}>
            {colorList.length === 0 ? (
              <motion.div variants={itemVariants} className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '2px dashed var(--border)' }}>
                <Inventory2Icon sx={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Add colors to unlock media uploads</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Images are organized by color variant</p>
              </motion.div>
            ) : (
              colorList.map(color => (
                <motion.div key={color} variants={itemVariants} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.toLowerCase(), border: '1px solid var(--border)' }} />
                      <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{color} MEDIA</h3>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{colorMedia[color]?.length || 0}/4 IMAGES</span>
                  </div>

                  <div
                    onClick={() => document.getElementById(`file-input-${color}`).click()}
                    style={{
                      border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                      padding: '30px 10px', textAlign: 'center', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s',
                      marginBottom: '16px'
                    }}
                    className="hover-accent"
                  >
                    <input 
                      type="file" 
                      id={`file-input-${color}`}
                      onChange={(e) => handleColorMediaChange(color, e)} 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      multiple 
                    />
                    <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: 'var(--accent-light)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Upload for {color}</p>
                  </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <AnimatePresence mode="popLayout">
                      {/* Show existing images from database */}
                      {existingProduct?.colorImages?.find(ci => ci.color === color)?.images?.map((url, i) => (
                        <motion.div key={`existing-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', aspectRatio: '1', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '2px', left: '2px', background: 'var(--accent)', color: 'white', fontSize: '8px', padding: '2px 4px', borderRadius: '4px', fontWeight: 900 }}>EXISTING</div>
                        </motion.div>
                      ))}
                      
                      {/* Show new uploads */}
                      {(colorMedia[color] || []).map((file, i) => (
                        <motion.div key={`new-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', aspectRatio: '1', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                          <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeColorFile(color, i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <CloseIcon sx={{ fontSize: 10 }} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}

            <motion.div variants={itemVariants} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <AutoAwesomeIcon style={{ color: 'var(--accent)', fontSize: '20px' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>AI-Ready Listing</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                    Your styling tags and weather data will help the AI Stylist recommend this product to the right customers.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Form Sections */}
          <div style={{ display: 'grid', gap: '30px' }}>
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '16px 24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '14px', fontWeight: 600 }}>
                ⚠️ {error}
              </motion.div>
            )}

            {/* Section 1: Core Identity */}
            <motion.div variants={itemVariants} className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                <Inventory2Icon style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>PRODUCT IDENTITY</h3>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={inputStyles.container}>
                  <label style={inputStyles.label}>Product Title</label>
                  <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Midnight Silk Gala Gown" style={inputStyles.field} className="premium-input" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={inputStyles.container}>
                    <label style={inputStyles.label}>Brand Name</label>
                    <input required name="brand" value={formData.brand} onChange={handleChange} placeholder="LUXEMODE" style={inputStyles.field} />
                  </div>
                  <div style={inputStyles.container}>
                    <label style={inputStyles.label}>Category Segment</label>
                    <select required name="category" value={formData.category} onChange={handleChange} style={{ ...inputStyles.field, appearance: 'none' }}>
                      <option value="" disabled>Select Category</option>
                      {['dress', 'shirt', 'jeans', 'jacket', 'shoes', 'accessory', 'bag', 'jewelry'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={inputStyles.container}>
                      <label style={inputStyles.label}>Base Price (₹)</label>
                      <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" style={inputStyles.field} />
                    </div>
                    <div style={inputStyles.container}>
                      <label style={inputStyles.label}>Discount (%)</label>
                      <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleChange} placeholder="0" style={inputStyles.field} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={inputStyles.container}>
                      <label style={inputStyles.label}>Sale Price (₹)</label>
                      <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="Auto-calculated" style={inputStyles.field} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 2: AI & Styling */}
            <motion.div variants={itemVariants} className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                <StyleIcon style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>AI STYLING ATTRIBUTES</h3>
              </div>

              <div style={{ display: 'grid', gap: '32px' }}>
                <div style={inputStyles.container}>
                  <label style={inputStyles.label}>Product Variants (Colors)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      value={colorInput} 
                      onChange={(e) => setColorInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleManualColorAdd())}
                      placeholder="e.g. Navy, Silver, Gold" 
                      style={inputStyles.field} 
                    />
                    <button 
                      type="button"
                      onClick={handleManualColorAdd}
                      style={{ 
                        padding: '0 20px', borderRadius: 'var(--radius-md)', 
                        background: 'var(--accent-bg)', border: '1px solid rgba(168,85,247,0.3)', 
                        color: 'var(--accent-light)', fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ADD VARIANT
                    </button>
                  </div>
                  
                  {colorList.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {colorList.map(color => (
                        <motion.span 
                          initial={{ scale: 0.9, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }}
                          key={color} 
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                            padding: '6px 12px', borderRadius: 'var(--radius-md)', 
                            background: 'var(--accent-bg)', color: 'var(--accent-light)',
                            fontSize: '12px', fontWeight: 700, border: '1px solid var(--accent)'
                          }}
                        >
                          {color}
                          <CloseIcon 
                            onClick={() => removeColor(color)} 
                            sx={{ fontSize: 14, cursor: 'pointer', '&:hover': { color: 'white' } }} 
                          />
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={inputStyles.label}>Target Style Tags</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {allTags.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleArrayItem(tag, setSelectedTags)}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600,
                          background: selectedTags.includes(tag) ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.03)',
                          color: selectedTags.includes(tag) ? 'white' : 'var(--text-muted)',
                          border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: selectedTags.includes(tag) ? '0 4px 12px var(--accent-glow)' : 'none'
                        }}>{tag}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div>
                    <label style={inputStyles.label}>Best Occasions</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {allOccasions.map(occ => (
                        <button key={occ} type="button" onClick={() => toggleArrayItem(occ, setSelectedOccasions)}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 600,
                            background: selectedOccasions.includes(occ) ? 'var(--accent-bg)' : 'transparent',
                            color: selectedOccasions.includes(occ) ? 'var(--accent-light)' : 'var(--text-muted)',
                            border: `1px solid ${selectedOccasions.includes(occ) ? 'var(--accent)' : 'var(--border)'}`,
                            cursor: 'pointer'
                          }}>{occ}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={inputStyles.label}>Weather Suitability</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {allWeather.map(w => (
                        <button key={w} type="button" onClick={() => toggleArrayItem(w, setSelectedWeather)}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 600,
                            background: selectedWeather.includes(w) ? 'var(--accent-bg)' : 'transparent',
                            color: selectedWeather.includes(w) ? 'var(--accent-light)' : 'var(--text-muted)',
                            border: `1px solid ${selectedWeather.includes(w) ? 'var(--accent)' : 'var(--border)'}`,
                            cursor: 'pointer'
                          }}>{w}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Availability & Narrative */}
            <motion.div variants={itemVariants} className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                <SellIcon style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>LISTING LOGISTICS</h3>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div>
                    <label style={inputStyles.label}>Audience Segment</label>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', padding: '4px', border: '1px solid var(--border)', marginTop: '8px' }}>
                      {['men', 'women', 'kids', 'unisex'].map(g => (
                        <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: formData.gender === g ? 'var(--gradient-primary)' : 'transparent', color: formData.gender === g ? 'white' : 'var(--text-muted)', transition: 'all 0.2s', textTransform: 'uppercase' }}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={inputStyles.label}>Listing Model</label>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', padding: '4px', border: '1px solid var(--border)', marginTop: '8px' }}>
                      <button type="button" onClick={() => setFormData({ ...formData, isAvailableForRent: false })} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: !formData.isAvailableForRent ? 'var(--gradient-primary)' : 'transparent', color: !formData.isAvailableForRent ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>SALE ONLY</button>
                      <button type="button" onClick={() => setFormData({ ...formData, isAvailableForRent: true })} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: formData.isAvailableForRent ? 'var(--gradient-primary)' : 'transparent', color: formData.isAvailableForRent ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>SALE & RENT</button>
                    </div>

                    <AnimatePresence>
                      {formData.isAvailableForRent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={inputStyles.container}>
                            <label style={inputStyles.label}>Rent Price Per Day (₹)</label>
                            <input type="number" name="rentPricePerDay" value={formData.rentPricePerDay} onChange={handleChange} placeholder="e.g. 499" style={inputStyles.field} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div style={inputStyles.container}>
                  <label style={inputStyles.label}>
                    Select Available {formData.category?.toLowerCase() === 'shoes' ? 'Footwear' : formData.category?.toLowerCase() === 'jeans' ? 'Waist' : 'Standard'} Sizes
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {activeSizes.map(size => (
                      <button key={size} type="button" onClick={() => toggleSize(size)} style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: selectedSizes.includes(size) ? 'var(--accent)' : 'rgba(255, 255, 255, 0.03)', color: selectedSizes.includes(size) ? 'white' : 'var(--text-primary)', border: `1px solid ${selectedSizes.includes(size) ? 'var(--accent)' : 'var(--border)'}`, fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>{size}</button>
                    ))}
                  </div>

                  {selectedSizes.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Set Stock for Selected Sizes</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-light)' }}>TOTAL UNITS:</span>
                          <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>
                            {Object.values(sizeStocks).reduce((a, b) => a + (parseInt(b) || 0), 0)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                        {selectedSizes.map(size => (
                          <div key={size} style={inputStyles.container}>
                            <label style={{ ...inputStyles.label, fontSize: '10px' }}>{size} Units</label>
                            <input 
                              type="number" 
                              value={sizeStocks[size] || ''} 
                              onChange={(e) => handleSizeStockChange(size, e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyles.field, padding: '8px 12px' }}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div style={inputStyles.container}>
                  <label style={inputStyles.label}>Product Narrative</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Describe the soul of this piece... Fabric, fit, and feeling." rows="5" style={{ ...inputStyles.field, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '20px', paddingTop: '20px' }}>
              <button type="button" onClick={() => navigate('/seller/products')} className="btn btn-outline" style={{ flex: 1, padding: '18px' }}>Discard Draft</button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '18px', fontSize: '16px' }}>
                {loading ? 'Processing Masterpiece...' : (isEdit ? 'Update Masterpiece' : 'Publish to Collection')}
              </button>
            </motion.div>
          </div>
        </form>
      </motion.div>

      <style>{`
        .glass {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .premium-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 20px var(--accent-glow) !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .hover-accent:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 0 30px var(--accent-glow);
        }
        @media (max-width: 900px) {
          form { grid-template-columns: 1fr !important; }
          div[style*="top: 100px"] { position: relative !important; top: 0 !important; }
        }
      `}</style>
    </div>
  );
}
