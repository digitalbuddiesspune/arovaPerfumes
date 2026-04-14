import React from 'react';

const ProductForm = ({
  form,
  errors,
  saving,
  submitError,
  onChange,
  onImageChange,
  addImageField,
  removeImageField,
  minImages,
  maxImages,
  onBooleanChange,
  onCheckboxChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-0 sm:p-4">
      <div className="mx-auto flex h-full w-full items-end sm:items-center sm:justify-center">
        <div className="flex h-[94vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:w-[96%] sm:max-w-4xl sm:rounded-2xl">
          <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Create Product</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>

          <form onSubmit={onSubmit} className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {submitError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p> : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input name="title" value={form.title} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              {errors.title ? <p className="mt-1 text-xs text-rose-600">{errors.title}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={form.category} onChange={onChange} className="w-full rounded-lg border px-3 py-2">
                <option value="">Select category</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>
              {errors.category ? <p className="mt-1 text-xs text-rose-600">{errors.category}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
              <input name="price" type="number" min="0" value={form.price} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              {errors.price ? <p className="mt-1 text-xs text-rose-600">{errors.price}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">MRP</label>
              <input name="mrp" type="number" min="0" value={form.mrp} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              {errors.mrp ? <p className="mt-1 text-xs text-rose-600">{errors.mrp}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Discount (%)</label>
              <input
                name="discountPercent"
                type="number"
                value={form.discountPercent}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">Auto calculated from MRP and Price.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              {errors.stock ? <p className="mt-1 text-xs text-rose-600">{errors.stock}</p> : null}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Top Notes (comma separated)</label>
                <input
                  name="topNotes"
                  value={form.topNotes}
                  onChange={onChange}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Citrus, Fresh"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Middle Notes (comma separated)</label>
                <input
                  name="middleNotes"
                  value={form.middleNotes}
                  onChange={onChange}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Floral, Spicy"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Base Notes (comma separated)</label>
                <input
                  name="baseNotes"
                  value={form.baseNotes}
                  onChange={onChange}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Woody, Musk"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Free Delivery</label>
              <select
                value={form.freeDelivery ? 'yes' : 'no'}
                onChange={(e) => onBooleanChange('freeDelivery', e.target.value === 'yes')}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Returns</label>
              <select
                value={form.isReturnable ? 'yes' : 'no'}
                onChange={(e) => onBooleanChange('isReturnable', e.target.value === 'yes')}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="md:col-span-2 rounded-lg border border-gray-200 p-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.enableReviews)}
                  onChange={(e) => onCheckboxChange('enableReviews', e.target.checked)}
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
                    value={form.rating}
                    onChange={onChange}
                    disabled={!form.enableReviews}
                    className="w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                  {errors.rating ? <p className="mt-1 text-xs text-rose-600">{errors.rating}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Total Reviews</label>
                  <input
                    name="totalReviews"
                    type="number"
                    min="0"
                    value={form.totalReviews}
                    onChange={onChange}
                    disabled={!form.enableReviews}
                    className="w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                  {errors.totalReviews ? <p className="mt-1 text-xs text-rose-600">{errors.totalReviews}</p> : null}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
              <input name="brand" value={form.brand} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              {errors.brand ? <p className="mt-1 text-xs text-rose-600">{errors.brand}</p> : null}
            </div>

            <div className="md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Image URLs</label>
                <button
                  type="button"
                  onClick={addImageField}
                  disabled={form.imageUrls.length >= maxImages}
                  className="rounded-md border px-2.5 py-1 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Add Image
                </button>
              </div>
              <p className="mb-2 text-xs text-gray-500">Image URLs are optional. You can add up to {maxImages}.</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {form.imageUrls.map((imageUrl, index) => (
                  <div key={`image-${index}`} className="flex items-center gap-2">
                    <input
                      value={imageUrl}
                      onChange={(e) => onImageChange(index, e.target.value)}
                      placeholder={`Image URL ${index + 1}`}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                    {form.imageUrls.length > minImages ? (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="rounded-md border px-2 py-2 text-xs text-rose-600"
                        title="Remove image"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {errors.imageUrls ? <p className="mt-1 text-xs text-rose-600">{errors.imageUrls}</p> : null}
            </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Short Description</label>
              <textarea
                name="shortDescription"
                rows="2"
                value={form.shortDescription}
                onChange={onChange}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Short summary for product details"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" rows="3" value={form.description} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description}</p> : null}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => onCheckboxChange('isBestSeller', e.target.checked)} />
              Mark as Best Seller
            </label>

            <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t bg-white px-4 pt-4 sm:static sm:mx-0 sm:bg-transparent sm:px-0">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
