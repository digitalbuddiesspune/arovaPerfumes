import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatDiscountPercent } from '../../utils/formatDiscountPercent';

const resolveImageSrc = (product) => {
  const raw =
    product?.images?.image1 ||
    (Array.isArray(product?.images) ? product.images[0] : '') ||
    product?.image ||
    product?.imageUrl ||
    '';

  const value = String(raw || '').trim();
  if (!value) return 'https://via.placeholder.com/56x56?text=Image';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `https://${value}`;
};

const ProductTable = ({
  loading,
  products,
  query,
  onQueryChange,
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPrevPage,
  onNextPage,
  onEdit,
  onDelete,
  onToggleBestSeller,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 px-0 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products List</h2>
          <p className="text-sm text-gray-500">Search, manage stock, and update bestseller products.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by title or category"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-72"
          />
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="border border-gray-200 bg-white px-4 py-8 text-sm text-gray-600">Loading products...</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="border-b px-4 py-3">Image</th>
                <th className="border-b px-4 py-3">Title</th>
                <th className="border-b px-4 py-3">Price</th>
                <th className="border-b px-4 py-3">MRP</th>
                <th className="border-b px-4 py-3">Discount %</th>
                <th className="border-b px-4 py-3">Stock</th>
                <th className="border-b px-4 py-3">Best Seller</th>
                <th className="border-b px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={8}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b transition hover:bg-gray-50">
                    <td className="px-4 py-3 align-middle">
                      <img
                        src={resolveImageSrc(product)}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/56x56?text=Image';
                        }}
                      />
                    </td>
                    <td className="max-w-[260px] px-4 py-3 align-middle">
                      <p className="truncate font-medium text-gray-900">{product.title}</p>
                      <p className="truncate text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
                    </td>
                    <td className="px-4 py-3 align-middle">₹{(Number(product.price) || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 align-middle">₹{(Number(product.mrp) || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 align-middle">{formatDiscountPercent(product.discountPercent)}%</td>
                    <td className="px-4 py-3 align-middle">{Number(product.stock ?? product.quantity ?? 0)}</td>
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={Boolean(product.isBestSeller)}
                        onChange={(e) => onToggleBestSeller(product, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="rounded p-2 text-rose-600 transition hover:bg-gray-100"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => onDelete(product._id)}
                          className="rounded p-2 text-rose-700 transition hover:bg-gray-100"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between px-0 py-2">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onPrevPage}
            disabled={page <= 1}
            className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={onNextPage}
            disabled={page >= totalPages}
            className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
