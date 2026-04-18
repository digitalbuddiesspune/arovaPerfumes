import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaBolt, FaShoppingCart, FaSpinner } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { fetchSareeById, fetchPricingSettings } from "../services/api";
import { getProductPromoBadges } from "../utils/productBadges";
import { formatDiscountPercent } from "../utils/formatDiscountPercent";
import ProductSuggestions from "./ProductSuggestions";

const FALLBACK_IMAGE = "/no-image.png";
const normalizeImageEntries = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeImageEntries(item))
      .filter(Boolean);
  }
  if (typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => normalizeImageEntries(item))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });
  const [lowStockThreshold, setLowStockThreshold] = useState(8);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const s = await fetchPricingSettings();
        if (!ignore && typeof s.lowStockThreshold === "number") setLowStockThreshold(s.lowStockThreshold);
      } catch {
        /* default */
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const loadProduct = async () => {
      try {
        if (!id) {
          navigate("/", { replace: true });
          return;
        }
        setLoading(true);
        const data = await fetchSareeById(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  const images = useMemo(() => {
    const directImageSlots = [
      product?.image1,
      product?.image2,
      product?.image3,
      product?.image4,
      product?.image5,
      product?.image6,
      product?.image7,
      product?.image8,
    ];
    const imageGallery = normalizeImageEntries(product?.imageGallery);
    const imagesArray = normalizeImageEntries(product?.images);
    const imageUrls = normalizeImageEntries(product?.imageUrls);
    const slots = normalizeImageEntries(directImageSlots);

    // Use the first non-empty source to avoid duplicate/extra thumbnails.
    // This keeps UI count aligned with exactly what was added in admin.
    const selectedSource = imageGallery.length
      ? imageGallery
      : imagesArray.length
      ? imagesArray
      : imageUrls.length
      ? imageUrls
      : slots;

    return selectedSource.length ? selectedSource.slice(0, 8) : [FALLBACK_IMAGE];
  }, [product]);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [id, images.length]);

  const rating = Number(product?.rating || 0);
  const reviews = Number(product?.totalReviews || 0);
  const showReviews = reviews > 0 && rating > 0;
  const mrp = Number(product?.mrp || 0);
  const sellingPrice = Number(product?.price || product?.salePrice || Math.round(mrp - (mrp * Number(product?.discountPercent || 0)) / 100) || 0);
  const discountPercent = formatDiscountPercent(product?.discountPercent);

  const stockQty = Number(product?.quantity ?? 0);
  const maxBuyQty = stockQty > 0 ? stockQty : 99;
  const { showBestSeller, showFewLeft } = useMemo(
    () => (product ? getProductPromoBadges(product, lowStockThreshold) : { showBestSeller: false, showFewLeft: false }),
    [product, lowStockThreshold]
  );

  useEffect(() => {
    if (!product) return;
    const max = Number(product.quantity ?? 0) > 0 ? Number(product.quantity) : 99;
    setQuantity((q) => Math.min(Math.max(1, q), max));
  }, [product]);

  const notes = [
    ...(product?.topNotes || []),
    ...(product?.middleNotes || []),
    ...(product?.baseNotes || []),
  ].filter(Boolean);

  const whyYoullLoveIt = Array.isArray(product?.whyYoullLoveIt)
    ? product.whyYoullLoveIt.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const infoFields = [
    { label: "Brand", value: product?.product_info?.brand || product?.brand },
    { label: "Category", value: product?.category },
    { label: "Type", value: product?.type || product?.subcategory },
    { label: "Stock", value: product?.quantity != null ? `${product.quantity} available` : null },
    { label: "Secure Transaction", value: product?.secureTransaction ? "Yes" : "No" },
    { label: "Easy Tracking", value: product?.easyTracking ? "Yes" : "No" },
    { label: "Free Delivery", value: product?.freeDelivery ? "Yes" : "No" },
    {
      label: "Returns",
      value: product?.isReturnable !== false ? "Yes" : "No",
    },
  ].filter((f) => f.value !== null && f.value !== undefined && f.value !== "");

  const handleAddToCart = async () => {
    if (!product) return;
    const cartProductId = String(product?._id || id || "");
    if (!cartProductId) return;
    setIsAdding(true);
    try {
      const result = await addToCart({ ...product, _id: cartProductId }, quantity, null);
      if (result?.redirected) return;
      setToast({ show: true, text: "Added to cart", type: "success" });
      setTimeout(() => setToast({ show: false, text: "", type: "success" }), 1800);
    } catch (e) {
      console.error("Error adding to cart:", e);
      setToast({ show: true, text: e?.message || "Failed to add to cart", type: "error" });
      setTimeout(() => setToast({ show: false, text: "", type: "success" }), 1800);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--luxury-cream)]">
        <FaSpinner className="animate-spin text-4xl text-[var(--luxury-gold)]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[var(--luxury-cream)] py-12 text-center text-[var(--luxury-brown)]">
        <p className="text-rose-700">{error || "Product not found"}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 rounded border border-[var(--luxury-brown)] bg-[var(--luxury-brown)] px-4 py-2 text-sm text-[var(--luxury-cream)] transition-colors hover:bg-[#3d160c]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--luxury-cream)] pb-20 text-[var(--luxury-brown)] sm:pb-6">
      {toast.show && (
        <div className={`${toast.type === "error" ? "bg-rose-700" : "bg-emerald-700"} fixed bottom-4 right-4 z-[100] rounded px-4 py-2 text-white shadow-lg`}>
          {toast.text}
        </div>
      )}
      <div className="mx-auto max-w-7xl px-3 pt-20 sm:px-5 sm:pt-28 lg:px-6">
        <div className="mb-3 text-xs text-[var(--luxury-brown)]/55">
          Home <span className="mx-1 text-[var(--luxury-gold)]/80">›</span> {product.category || "Collection"}{" "}
          <span className="mx-1 text-[var(--luxury-gold)]/80">›</span> {product.title}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left image gallery */}
          <div>
            <div className="relative border border-[var(--luxury-gold)]/20 bg-[#f4ece8] p-2 shadow-sm">
              <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[min(90%,14rem)] flex-col items-start gap-1.5">
                {showBestSeller && (
                  <span className="inline-flex bg-[var(--luxury-brown)] px-2.5 py-1 font-[var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--luxury-gold)] shadow-md sm:text-xs">
                    Bestseller
                  </span>
                )}
                {showFewLeft && (
                  <span className="inline-flex border border-[var(--luxury-gold)]/40 bg-[rgba(44,16,8,0.85)] px-2.5 py-1 font-[var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.12em] leading-tight text-[var(--luxury-cream)] shadow-md sm:text-xs">
                    Few left — hurry
                  </span>
                )}
              </div>
              <img
                src={images[selectedImageIdx] || FALLBACK_IMAGE}
                alt={product.title}
                className="w-full aspect-square object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`border bg-[#f4ece8] p-1 transition-colors ${
                      idx === selectedImageIdx ? "border-[var(--luxury-brown)] ring-1 ring-[var(--luxury-gold)]/40" : "border-[var(--brand-border)] hover:border-[var(--luxury-gold)]/35"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right details panel */}
          <div className="border border-[rgba(44,16,8,0.08)] bg-[#f4ece8] p-4 shadow-sm sm:p-5">
            <div>
              <h1 className="font-[var(--font-cormorant)] text-3xl font-semibold leading-tight tracking-wide text-[var(--luxury-brown)] sm:text-4xl">
                {product.title}
              </h1>
              <p className="mt-1 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.28em] text-[var(--luxury-gold-dark)] sm:text-[11px]">
                Eau de Parfum
              </p>
            </div>

            {showReviews ? (
              <div className="mt-3 flex items-center gap-2">
                <div className="text-sm text-[var(--luxury-gold)]">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</div>
                <span className="text-xs text-[var(--luxury-brown)]/65">{reviews} reviews</span>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-end gap-2">
              <span className="font-[var(--font-cormorant)] text-3xl font-semibold text-[var(--luxury-brown)]">
                ₹ {sellingPrice.toLocaleString("en-IN")}
              </span>
              {mrp > sellingPrice && (
                <span className="text-sm text-[var(--luxury-brown)]/45 line-through">MRP ₹ {mrp.toLocaleString("en-IN")}</span>
              )}
              {discountPercent > 0 && (
                <span className="bg-[var(--luxury-cream)] px-2 py-1 font-[var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-brown)] ring-1 ring-[var(--luxury-gold)]/35">
                  Save {discountPercent}%
                </span>
              )}
            </div>
            {notes.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-3 font-[var(--font-cinzel)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--luxury-brown)]">
                  Notes
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {notes.slice(0, 8).map((note, idx) => (
                    <span
                      key={`${note}-${idx}`}
                      className="rounded-full border border-[var(--luxury-gold)]/35 bg-[var(--luxury-cream)] px-3 py-1.5 text-sm text-[var(--luxury-brown)] shadow-sm sm:px-4 sm:py-2"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.shortDescription ? (
              <div className="mt-4">
                <p className="mt-1 text-sm leading-relaxed text-[var(--luxury-brown)]/85">{product.shortDescription}</p>
              </div>
            ) : null}

            <div className="mt-5">
              <label className="mb-2 block font-[var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--luxury-brown)]">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[var(--luxury-brown)]/25 bg-[var(--luxury-cream)]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 text-[var(--luxury-brown)] transition-colors hover:bg-[rgba(201,169,110,0.15)]"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxBuyQty, q + 1))}
                    className="h-8 w-8 text-[var(--luxury-brown)] transition-colors hover:bg-[rgba(201,169,110,0.15)]"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || stockQty === 0}
                  className="flex flex-1 items-center justify-center gap-2 border border-[var(--luxury-brown)] py-2 text-sm font-medium text-[var(--luxury-brown)] transition-colors hover:bg-[var(--luxury-brown)] hover:text-[var(--luxury-cream)] disabled:opacity-60"
                >
                  <FaShoppingCart className="h-4 w-4" />
                  {isAdding ? "Adding..." : "Add to cart"}
                </button>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isAdding || stockQty === 0}
              className="mt-3 flex w-full items-center justify-center gap-2 bg-[var(--luxury-gold)] py-2.5 text-sm font-medium text-[var(--luxury-brown)] transition-colors hover:bg-[var(--luxury-gold-dark)] hover:text-[var(--luxury-cream)] disabled:opacity-60"
            >
              <FaBolt className="h-4 w-4" />
              Buy Now
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2 border-y border-[var(--luxury-gold)]/20 py-3 text-center font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.14em] text-[var(--luxury-brown)]/75">
              <div>Secure transaction</div>
              <div>Easy order tracking</div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--luxury-brown)]/70">
              {product.isReturnable !== false ? (
                <>
                  This product is eligible for return under our{" "}
                  <Link to="/returns" className="font-medium text-[var(--luxury-brown)] underline underline-offset-2 hover:text-[var(--luxury-gold-dark)]">
                    return policy
                  </Link>
                  .
                </>
              ) : (
                <>This product is not eligible for return (final sale).</>
              )}
            </p>

            <div className="mt-5 space-y-4 border-t border-[var(--luxury-gold)]/20 pt-4">
              {product.description ? (
                <div>
                  <h3 className="font-[var(--font-cinzel)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--luxury-brown)]">
                    Description
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--luxury-brown)]/85">{product.description}</p>
                </div>
              ) : null}

              {whyYoullLoveIt.length > 0 ? (
                <div>
                  <h3 className="font-[var(--font-cinzel)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--luxury-brown)]">
                    Why you&apos;ll love it
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--luxury-brown)]/85">
                    {whyYoullLoveIt.map((line, idx) => (
                      <li key={`${idx}-${line.slice(0, 32)}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* All Information */}
        <div className="mt-10 border border-[rgba(44,16,8,0.08)] bg-[#f4ece8] p-5 shadow-sm sm:mt-12 sm:p-7">
          <h3 className="mb-4 font-[var(--font-cinzel)] text-base font-semibold uppercase tracking-[0.18em] text-[var(--luxury-brown)]">
            All product information
          </h3>
          {infoFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {infoFields.map((field) => (
                <div key={field.label} className="flex justify-between gap-3 border-b border-[var(--brand-border)] py-1.5">
                  <span className="text-[var(--luxury-brown)]/65">{field.label}</span>
                  <span className="text-right font-medium text-[var(--luxury-brown)]">{String(field.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--luxury-brown)]/55">No additional information available.</p>
          )}
        </div>
      </div>

      {/* Product Suggestions */}
      {product && (
        <div className="mt-10 sm:mt-12">
          <ProductSuggestions
            currentProductId={product._id || id}
            category={product.category}
            maxProducts={8}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
