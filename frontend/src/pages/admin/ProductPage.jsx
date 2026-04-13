import React, { useEffect, useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { api } from '../../utils/api';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

const MIN_IMAGES = 1;
const MAX_IMAGES = 8;

const INITIAL_FORM = {
  title: '',
  price: '',
  mrp: '',
  category: '',
  description: '',
  imageUrls: Array(MIN_IMAGES).fill(''),
  brand: '',
  stock: '',
  discountPercent: 0,
  freeDelivery: true,
  isReturnable: true,
  enableReviews: false,
  rating: '',
  totalReviews: '',
  isBestSeller: false,
};

const ProductPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    _id: '',
    title: '',
    price: '',
    mrp: '',
    category: '',
    description: '',
    imageUrls: [''],
    brand: '',
    stock: '',
    discountPercent: 0,
    freeDelivery: true,
    isReturnable: true,
    enableReviews: false,
    rating: '',
    totalReviews: '',
    isBestSeller: false,
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.admin.listProducts();
      setList(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2200);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'price' || name === 'mrp') {
        const mrp = Number(name === 'mrp' ? value : next.mrp) || 0;
        const price = Number(name === 'price' ? value : next.price) || 0;
        next.discountPercent = mrp > 0 && price > 0 && price < mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const onCheckboxChange = (name, checked) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const onBooleanChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => (i === index ? value : url)),
    }));
    setErrors((prev) => ({ ...prev, imageUrls: '' }));
  };

  const addImageField = () => {
    setForm((prev) => {
      if (prev.imageUrls.length >= MAX_IMAGES) return prev;
      return { ...prev, imageUrls: [...prev.imageUrls, ''] };
    });
  };

  const removeImageField = (index) => {
    setForm((prev) => {
      if (prev.imageUrls.length <= MIN_IMAGES) return prev;
      return { ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) };
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (!form.category.trim()) nextErrors.category = 'Category is required.';
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Enter valid price.';
    if (!form.mrp || Number(form.mrp) <= 0) nextErrors.mrp = 'Enter valid MRP.';
    if (Number(form.price) > Number(form.mrp)) nextErrors.price = 'Price cannot be greater than MRP.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (!form.brand.trim()) nextErrors.brand = 'Brand is required.';
    if (form.stock === '' || Number(form.stock) < 0) nextErrors.stock = 'Stock cannot be negative.';
    if (form.enableReviews) {
      const rating = Number(form.rating);
      const totalReviews = Number(form.totalReviews);
      if (Number.isNaN(rating) || rating < 0 || rating > 5) nextErrors.rating = 'Rating should be between 0 and 5.';
      if (Number.isNaN(totalReviews) || totalReviews < 0) nextErrors.totalReviews = 'Reviews should be 0 or more.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const mrp = Number(form.mrp);
    const price = Number(form.price);
    const inferredDiscount = mrp > 0 && price > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;
    const imageUrls = form.imageUrls.map((url) => String(url || '').trim()).filter(Boolean).slice(0, MAX_IMAGES);
    const stockQty = Number(form.stock || 0);

    const payload = {
      title: form.title.trim(),
      price,
      salePrice: price,
      mrp,
      pricing: {
        salePrice: price,
        mrp,
      },
      discountPercent: Number(inferredDiscount),
      description: form.description.trim(),
      category: form.category.trim(),
      stock: {
        quantity: stockQty,
      },
      quantity: stockQty,
      isBestSeller: Boolean(form.isBestSeller),
      images: imageUrls,
      services: {
        freeDelivery: Boolean(form.freeDelivery),
      },
      reviews: {
        rating: form.enableReviews ? Number(form.rating || 0) : 0,
        totalReviews: form.enableReviews ? Number(form.totalReviews || 0) : 0,
      },
      product_info: {
        brand: form.brand.trim(),
        manufacturer: '',
        SareeLength: '',
        SareeMaterial: '',
        SareeColor: '',
        IncludedComponents: '',
      },
      shippingAndReturns: { returns: { isReturnable: Boolean(form.isReturnable) } },
    };

    setSaving(true);
    try {
      await api.admin.createProduct(payload);
      setForm(INITIAL_FORM);
      setShowForm(false);
      showToast('Product created successfully.');
      await load();
    } catch (e2) {
      setError(e2.message || 'Failed to create product');
      showToast(e2.message || 'Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.admin.deleteProduct(id);
      showToast('Product deleted.');
      await load();
    } catch (e) {
      showToast(e.message || 'Failed to delete product', 'error');
    }
  };

  const openEdit = (product) => {
    const imageList = Array.isArray(product?.imageGallery)
      ? product.imageGallery
      : Array.isArray(product?.images)
      ? product.images
      : Object.values(product?.images || {}).filter(Boolean);
    const normalizedImages = imageList.length ? imageList.slice(0, MAX_IMAGES) : [''];

    setEditingProduct(product);
    setEditForm({
      _id: String(product._id || ''),
      title: product.title || '',
      price: Number(product.price ?? product.salePrice ?? 0) || '',
      mrp: Number(product.mrp) || '',
      category: product.category || '',
      description: product.description || '',
      imageUrls: normalizedImages,
      brand: product.product_info?.brand || product.brand || '',
      stock: Number(product.stock ?? product.quantity ?? 0) || 0,
      discountPercent: Number(product.discountPercent) || 0,
      freeDelivery: Boolean(product.freeDelivery),
      isReturnable: product.isReturnable !== false,
      enableReviews: Number(product.rating || 0) > 0 || Number(product.totalReviews || 0) > 0,
      rating: Number(product.rating || 0) || '',
      totalReviews: Number(product.totalReviews || 0) || '',
      isBestSeller: Boolean(product.isBestSeller),
    });
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm({
      _id: '',
      title: '',
      price: '',
      mrp: '',
      category: '',
      description: '',
      imageUrls: [''],
      brand: '',
      stock: '',
      discountPercent: 0,
      freeDelivery: true,
      isReturnable: true,
      enableReviews: false,
      rating: '',
      totalReviews: '',
      isBestSeller: false,
    });
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'price' || name === 'mrp') {
        const mrp = Number(name === 'mrp' ? value : next.mrp) || 0;
        const price = Number(name === 'price' ? value : next.price) || 0;
        next.discountPercent = mrp > 0 && price > 0 && price < mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
      }
      return next;
    });
  };

  const onEditBooleanChange = (name, value) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditImageChange = (index, value) => {
    setEditForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => (i === index ? value : url)),
    }));
  };

  const addEditImageField = () => {
    setEditForm((prev) => {
      if (prev.imageUrls.length >= MAX_IMAGES) return prev;
      return { ...prev, imageUrls: [...prev.imageUrls, ''] };
    });
  };

  const removeEditImageField = (index) => {
    setEditForm((prev) => {
      if (prev.imageUrls.length <= MIN_IMAGES) return prev;
      return { ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const mrp = Number(editForm.mrp) || 0;
      const salePrice = Number(editForm.price) || 0;
      const stockQty = Number(editForm.stock || 0);
      const imageUrls = editForm.imageUrls.map((url) => String(url || '').trim()).filter(Boolean).slice(0, MAX_IMAGES);

      await api.admin.updateProduct(editForm._id, {
        title: editForm.title.trim(),
        brand: editForm.brand.trim(),
        category: editForm.category.trim(),
        description: editForm.description.trim(),
        salePrice,
        mrp,
        pricing: {
          salePrice,
          mrp,
        },
        stock: {
          quantity: stockQty,
        },
        quantity: stockQty,
        images: imageUrls,
        services: {
          freeDelivery: Boolean(editForm.freeDelivery),
        },
        shippingAndReturns: {
          returns: { isReturnable: Boolean(editForm.isReturnable) },
        },
        reviews: {
          rating: editForm.enableReviews ? Number(editForm.rating || 0) : 0,
          totalReviews: editForm.enableReviews ? Number(editForm.totalReviews || 0) : 0,
        },
        isBestSeller: Boolean(editForm.isBestSeller),
      });
      closeEdit();
      showToast('Product updated.');
      await load();
    } catch (e) {
      showToast(e.message || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleBestSeller = async (product, checked) => {
    try {
      await api.admin.updateProduct(product._id, { isBestSeller: checked });
      setList((prev) => prev.map((item) => (item._id === product._id ? { ...item, isBestSeller: checked } : item)));
      showToast(`Best seller ${checked ? 'enabled' : 'disabled'}.`);
    } catch (e) {
      showToast(e.message || 'Unable to update best seller', 'error');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => `${item.title || ''} ${item.category || ''}`.toLowerCase().includes(q));
  }, [list, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {toast.show ? (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <h1 className="admin-title text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="admin-primary-btn rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          + Add Product
        </button>
      </div>

      <ProductTable
        loading={loading}
        products={pageItems}
        query={query}
        onQueryChange={setQuery}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        onEdit={openEdit}
        onDelete={remove}
        onToggleBestSeller={toggleBestSeller}
      />

      {showForm ? (
        <ProductForm
          form={form}
          errors={errors}
          saving={saving}
          submitError={error}
          onChange={onChange}
          onImageChange={onImageChange}
          addImageField={addImageField}
          removeImageField={removeImageField}
          minImages={MIN_IMAGES}
          maxImages={MAX_IMAGES}
          onBooleanChange={onBooleanChange}
          onCheckboxChange={onCheckboxChange}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowForm(false);
            setForm(INITIAL_FORM);
            setErrors({});
            setError('');
          }}
        />
      ) : null}

      {editingProduct ? (
        <div className="fixed inset-0 z-50 bg-black/50 p-0 sm:p-4">
          <div className="mx-auto flex h-full w-full items-end sm:items-center sm:justify-center">
            <div className="flex h-[94vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:w-[96%] sm:max-w-4xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              <button onClick={closeEdit} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                  <input name="title" value={editForm.title} onChange={onEditChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                  <select name="category" value={editForm.category} onChange={onEditChange} className="w-full rounded-lg border px-3 py-2">
                    <option value="">Select category</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                  <input name="price" type="number" min="0" value={editForm.price} onChange={onEditChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">MRP</label>
                  <input name="mrp" type="number" min="0" value={editForm.mrp} onChange={onEditChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Discount %</label>
                  <input value={editForm.discountPercent} readOnly className="w-full rounded-lg border bg-gray-50 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
                  <input name="stock" type="number" min="0" value={editForm.stock} onChange={onEditChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Free Delivery</label>
                  <select
                    value={editForm.freeDelivery ? 'yes' : 'no'}
                    onChange={(e) => onEditBooleanChange('freeDelivery', e.target.value === 'yes')}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Returns</label>
                  <select
                    value={editForm.isReturnable ? 'yes' : 'no'}
                    onChange={(e) => onEditBooleanChange('isReturnable', e.target.value === 'yes')}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                  <input name="brand" value={editForm.brand} onChange={onEditChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 pt-6">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.isBestSeller)}
                    onChange={(e) => onEditBooleanChange('isBestSeller', e.target.checked)}
                  />
                  Mark as Best Seller
                </label>
                <div className="md:col-span-2 rounded-lg border border-gray-200 p-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(editForm.enableReviews)}
                      onChange={(e) => onEditBooleanChange('enableReviews', e.target.checked)}
                    />
                    Show reviews on product detail
                  </label>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Rating (0 to 5)</label>
                      <input
                        name="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editForm.rating}
                        onChange={onEditChange}
                        disabled={!editForm.enableReviews}
                        className="w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Total Reviews</label>
                      <input
                        name="totalReviews"
                        type="number"
                        min="0"
                        value={editForm.totalReviews}
                        onChange={onEditChange}
                        disabled={!editForm.enableReviews}
                        className="w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Image URLs</label>
                    <button
                      type="button"
                      onClick={addEditImageField}
                      disabled={editForm.imageUrls.length >= MAX_IMAGES}
                      className="rounded-md border px-2.5 py-1 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      + Add Image
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {editForm.imageUrls.map((imageUrl, index) => (
                      <div key={`edit-image-${index}`} className="flex items-center gap-2">
                        <input
                          value={imageUrl}
                          onChange={(e) => onEditImageChange(index, e.target.value)}
                          placeholder={`Image URL ${index + 1}`}
                          className="w-full rounded-lg border px-3 py-2"
                        />
                        {editForm.imageUrls.length > MIN_IMAGES ? (
                          <button
                            type="button"
                            onClick={() => removeEditImageField(index)}
                            className="rounded-md border px-2 py-2 text-xs text-rose-600"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={editForm.description}
                    onChange={onEditChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-white px-4 pt-3 sm:static sm:mx-0 sm:bg-transparent sm:px-0">
                <button type="button" onClick={closeEdit} className="rounded-lg border px-4 py-2 text-sm text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn rounded-lg px-4 py-2 text-sm font-medium"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductPage;
