import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { formatDisplayOrderId } from '../../utils/orderId';
import DashboardCards from './DashboardCards';
import OrdersTable from './OrdersTable';
import ActivityFeed from './ActivityFeed';
import AdminButton from './ui/AdminButton';
import AdminCard from './ui/AdminCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: '₹0',
    totalOrders: 0,
    totalProducts: 0,
    activeOrders: 0,
    totalUsers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          api.admin.stats(),
          api.admin.listOrders(),
          api.admin.listProducts(),
        ]);
        const allOrders = Array.isArray(ordersData) ? ordersData : [];
        const activeOrders = allOrders.filter((o) => {
          const status = String(o.orderStatus || o.status || '').toLowerCase();
          return status === 'pending' || status === 'confirmed';
        }).length;
        if (mounted) {
          setStats({
            totalRevenue: `₹${Number(statsData?.totalRevenue || 0).toLocaleString('en-IN')}`,
            totalOrders: Number(statsData?.totalOrders || allOrders.length || 0),
            totalProducts: Number(statsData?.totalProducts || 0),
            activeOrders,
            totalUsers: Number(statsData?.totalUsers || 0),
          });
          setOrders(allOrders);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch (e) {
        setError(e.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

  const activities = useMemo(() => {
    const orderActivities = orders.slice(0, 6).map((order) => ({
      id: `order-${order._id}`,
      type: 'order',
      text: `${order.user?.name || 'User'} placed order #${formatDisplayOrderId(order)}`,
      time: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
    }));
    const productActivities = products.slice(0, 4).map((product) => ({
      id: `product-${product._id}`,
      type: 'product',
      text: `Product added: ${product.title || 'Untitled Product'}`,
      time: product.createdAt ? new Date(product.createdAt).toLocaleString() : '',
    }));
    const couponActivities = orders
      .filter((order) => Boolean(order.couponCode))
      .slice(0, 2)
      .map((order) => ({
        id: `coupon-${order._id}`,
        type: 'coupon',
        text: `Coupon used: ${order.couponCode}`,
        time: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
      }));
    return [...orderActivities, ...productActivities, ...couponActivities]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 12);
  }, [orders, products]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminCard className="sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="admin-title text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, Admin 👋</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/products"><AdminButton>Manage Products</AdminButton></Link>
            <Link to="/admin/orders"><AdminButton variant="secondary">View Orders</AdminButton></Link>
          </div>
        </div>
      </AdminCard>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-xl border bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <DashboardCards
            stats={stats}
            onCardClick={(key) => {
              if (key === 'totalProducts') navigate('/admin/products');
              if (key === 'totalOrders' || key === 'activeOrders') navigate('/admin/orders');
            }}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <OrdersTable orders={recentOrders} />
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
