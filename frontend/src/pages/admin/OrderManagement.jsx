import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orders';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { clearRequestCache } from '../../api/client';
import { FiEye, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiFileText, FiPrinter, FiClock, FiSearch, FiTruck, FiSave, FiPackage, FiX as FiClose } from 'react-icons/fi';

import { storeSettingsApi } from '../../api/storeSettings';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [slipLoading, setSlipLoading] = useState(false);

  // Debounce search input before triggering API
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Single effect to load orders when any filter or page changes
  useEffect(() => {
    loadOrders();
  }, [page, search, statusFilter, typeFilter]);

  const loadOrders = async (forceRefresh) => {
    setLoading(true);
    try {
      if (forceRefresh) clearRequestCache('/orders');
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const data = await orderApi.getAll(params);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      toast.success(`Order ${status}`);
      loadOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handlePrintSlip = async (order) => {
    const targetOrder = order || selectedOrder;
    if (!targetOrder) return;
    if (order) setSelectedOrder(order);
    setSlipLoading(true);
    try {
      const data = await storeSettingsApi.get();
      setStoreInfo(data?.settings || null);
    } catch {
      setStoreInfo(null);
    } finally {
      setSlipLoading(false);
      setShowPrintSlip(true);
      setTimeout(() => window.print(), 400);
    }
  };

  return (
    <>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-500 text-sm mt-1">{pagination?.total || orders.length} orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/pending-orders"
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
            >
              <FiClock className="w-4 h-4" /> Pending Orders
            </Link>
            <button
              onClick={() => loadOrders(true)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by customer name..."
              className="w-56 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Types</option>
            <option value="pos">POS Orders</option>
            <option value="online">Online Orders</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Invoice</th>
                    <th className="text-left px-4 py-3 font-medium">Customer</th>
                    <th className="text-left px-4 py-3 font-medium">Customer ID</th>
                    <th className="text-left px-4 py-3 font-medium">Dealer</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="text-center px-4 py-3 font-medium">Status</th>
                    <th className="text-center px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium mb-1">No orders found</p>
                        <p className="text-xs text-gray-400">
                          Orders will appear here after they are placed.{' '}
                          <Link to="/admin/pos" className="text-emerald-600 hover:underline">Create a new POS order</Link>
                        </p>
                      </td>
                    </tr>
                  ) : orders.map((order) => (
                    <tr key={order._id} className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?._id === order._id ? 'bg-emerald-50' : ''}`}
                      onClick={() => setSelectedOrder(order)}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-xs">{order.invoiceNumber}</p>
                        <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">
                          {order.customers?.length > 0
                            ? order.customers.map((c) => {
                                const name = c.customerName || c.customer?.name || 'N/A';
                                const id = c.customerId || c.customer?.customerId;
                                return id ? `${id} - ${name}` : name;
                              }).join(', ')
                            : 'Walk-in'}
                        </p>
                        <p className="text-xs text-gray-400">{order.orderType === 'pos' ? 'POS' : 'Online'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-mono">
                          {order.customers?.length > 0
                            ? order.customers.map((c) => c.customerId || c.customer?.customerId || '-').join(', ')
                            : '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{order.dealerName || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">₹{order.grandTotal?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handlePrintSlip(order); }} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Print Slip">
                            <FiPrinter className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View Details">
                            <FiEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
                <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {selectedOrder ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Order Details</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>{selectedOrder.status}</span>
                </div>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-500">Invoice</p>
                      <p className="font-medium text-gray-900">{selectedOrder.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dealer</p>
                      <p className="font-medium text-gray-900">{selectedOrder.dealerName || 'Walk-in'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dealer Phone</p>
                      <p className="font-medium text-gray-900">{selectedOrder.dealerPhone || '-'}</p>
                    </div>
                    {selectedOrder.customers?.length > 0 ? selectedOrder.customers.map((c, ci) => (
                      <div key={ci} className={`col-span-2 ${ci > 0 ? 'border-t border-gray-200 pt-2 mt-1' : ''}`}>
                        <p className="text-xs text-gray-500 mb-0.5">Customer {ci + 1}</p>
                        <p className="font-medium text-gray-900">
                          {c.customerId || c.customer?.customerId
                            ? `${c.customerId || c.customer?.customerId} - ${c.customerName || c.customer?.name || 'N/A'}`
                            : c.customerName || c.customer?.name || 'N/A'}
                        </p>
                        {c.customerPhone && (
                          <p className="text-xs text-gray-500 mt-0.5">Phone: {c.customerPhone}</p>
                        )}
                      </div>
                    )) : (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-0.5">Customer</p>
                        <p className="font-medium text-gray-900">Walk-in</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Products ({selectedOrder.items?.length})</p>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.sellingPrice}</p>
                          </div>
                          <span className="font-medium">₹{(item.quantity * item.sellingPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payments */}
                  {selectedOrder.payments?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Payments</p>
                      <div className="space-y-1">
                        {selectedOrder.payments.map((p, i) => (
                          <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                            <span className="capitalize text-gray-600">{p.method}</span>
                            <span className="font-medium">₹{p.amount?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">GST</span>
                      <span>₹{selectedOrder.totalGst?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-red-500">-₹{selectedOrder.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span>Grand Total</span>
                      <span className="text-emerald-600">₹{selectedOrder.grandTotal?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Print Slip Button */}
                <button
                  onClick={handlePrintSlip}
                  disabled={slipLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mb-3"
                >
                  <FiPrinter className="w-4 h-4" /> {slipLoading ? 'Loading...' : 'Print Slip'}
                </button>

                {/* Actions */}
                {selectedOrder.status === 'pending' && (
                  <div className="flex gap-3">
                    <button onClick={() => handleStatusUpdate(selectedOrder._id, 'confirmed')}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      <FiCheck className="w-4 h-4" /> Confirm
                    </button>
                    <button onClick={() => handleStatusUpdate(selectedOrder._id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                      <FiX className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <>
                    <button onClick={() => handleStatusUpdate(selectedOrder._id, 'shipped')}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors mb-2">
                      <FiTruck className="w-4 h-4" /> Mark as Shipped
                    </button>
                    <button onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Mark as Delivered
                    </button>
                  </>
                )}
                {selectedOrder.status === 'shipped' && (
                  <TrackingForm order={selectedOrder} onUpdate={loadOrders} />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FiFileText className="w-12 h-12 mx-auto mb-3" />
                <p>Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      {showPrintSlip && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 print:bg-white print:inset-auto print:relative print:z-0 flex items-center justify-center print:block">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] mx-4 print:w-[80mm] print:rounded-none print:shadow-none print:mx-auto print:p-2 overflow-y-auto max-h-[90vh] print:max-h-none">
            {/* Close button — hidden in print */}
            <div className="flex justify-end p-3 print:hidden">
              <button
                onClick={() => setShowPrintSlip(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FiClose className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="px-4 pb-6 print:p-0">
              {/* Shop Header */}
              <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {storeInfo?.shopName || 'Prandhara Pharmacy & Healthcare'}
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  {storeInfo?.shopAddress || '123, Medical Complex, Main Road, City - 123456'}
                </p>
                <p className="text-xs text-gray-600">
                  📞 {storeInfo?.shopPhone || '+91 98765 43210'}
                </p>
                {storeInfo?.shopEmail && (
                  <p className="text-xs text-gray-500">✉️ {storeInfo.shopEmail}</p>
                )}
                {storeInfo?.shopGstin && (
                  <p className="text-xs text-gray-500">GST: {storeInfo.shopGstin}</p>
                )}
                {storeInfo?.shopLicense && (
                  <p className="text-xs text-gray-500">Lic: {storeInfo.shopLicense}</p>
                )}
              </div>

              {/* Invoice Info */}
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-900">INVOICE</h3>
                <p className="text-xs text-gray-600">
                  #{selectedOrder.invoiceNumber || selectedOrder._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-gray-100 text-gray-700">
                  {selectedOrder.status}
                </span>
              </div>

              {/* Dealer / Supplier */}
              {(selectedOrder.dealerName || selectedOrder.dealer?.name) && (
                <div className="mb-3 text-xs border-b border-dashed border-gray-200 pb-3">
                  <p className="font-semibold text-gray-700">Dealer / Supplier:</p>
                  <p className="text-gray-600">{selectedOrder.dealerName || selectedOrder.dealer?.name}</p>
                  {selectedOrder.dealerPhone && <p className="text-gray-500">{selectedOrder.dealerPhone}</p>}
                  {selectedOrder.dealerAddress && <p className="text-gray-500">{selectedOrder.dealerAddress}</p>}
                </div>
              )}

              {/* Customers */}
              {selectedOrder.customers?.length > 0 && (
                <div className="mb-3 text-xs border-b border-dashed border-gray-200 pb-3">
                  <p className="font-semibold text-gray-700">Customer(s):</p>
                  {selectedOrder.customers.map((c, i) => (
                    <p key={i} className="text-gray-600">
                      {c.customerId || c.customer?.customerId
                        ? `${c.customerId || c.customer?.customerId} - ${c.customerName || c.customer?.name || 'N/A'}`
                        : c.customerName || c.customer?.name || 'Walk-in'}
                      {c.customerPhone ? ` (${c.customerPhone})` : ''}
                    </p>
                  ))}
                </div>
              )}

              {/* Items Table */}
              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-dashed border-gray-300">
                    <th className="text-left py-1.5 font-semibold text-gray-700">#</th>
                    <th className="text-left py-1.5 font-semibold text-gray-700">Product</th>
                    <th className="text-center py-1.5 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-1.5 font-semibold text-gray-700">Price</th>
                    <th className="text-right py-1.5 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || selectedOrder.products || []).map((item, idx) => {
                    const price = item.sellingPrice || item.price || 0;
                    const qty = item.quantity || 1;
                    const total = item.totalPrice || (price * qty);
                    return (
                      <tr key={idx} className="border-b border-dashed border-gray-100">
                        <td className="py-1.5 text-gray-500">{idx + 1}</td>
                        <td className="py-1.5 text-gray-700">{item.productName || item.name || item.product?.name}</td>
                        <td className="py-1.5 text-center text-gray-700">{qty}</td>
                        <td className="py-1.5 text-right text-gray-700">₹{price.toLocaleString()}</td>
                        <td className="py-1.5 text-right text-gray-700 font-medium">₹{total.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-dashed border-gray-300 pt-2 text-xs space-y-1 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span>₹{(selectedOrder.totalGst || 0).toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-sm border-t border-gray-300 pt-1 mt-1">
                  <span>Grand Total</span>
                  <span>₹{(selectedOrder.grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="text-xs border-t border-dashed border-gray-200 pt-3 mb-4">
                <p className="font-semibold text-gray-700 mb-1">Payment:</p>
                {selectedOrder.payments?.length > 0 ? selectedOrder.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span className="capitalize">{p.method}</span>
                    <span>₹{(p.amount || 0).toLocaleString()}</span>
                  </div>
                )) : (
                  <p className="text-gray-500">{selectedOrder.payment?.method ? selectedOrder.payment.method : '—'}</p>
                )}
                <p className={`text-xs font-medium mt-1 ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedOrder.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </p>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-300 pt-3">
                <p className="italic">{storeInfo?.footerMessage || 'Thank you for your business!'}</p>
                <p className="mt-1 text-[10px] text-gray-400">Powered by Prandhara ERP</p>
              </div>
            </div>

            {/* Action Buttons — hidden in print */}
            <div className="flex gap-3 p-4 border-t border-gray-100 print:hidden">
              <button
                onClick={() => setShowPrintSlip(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <FiPrinter className="w-4 h-4 inline mr-1" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Tracking Form for Blue Dart / Shipping
const TrackingForm = ({ order, onUpdate }) => {
  const [trackingNumber, setTrackingNumber] = useState(order.shipping?.trackingNumber || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.shipping?.estimatedDelivery
      ? new Date(order.shipping.estimatedDelivery).toISOString().split('T')[0]
      : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSaveTracking = async () => {
    if (!trackingNumber) {
      toast.error('Please enter a tracking number');
      return;
    }
    setSaving(true);
    try {
      await orderApi.updateShipping(order._id, {
        trackingNumber,
        estimatedDelivery,
        status: 'shipped',
      });
      toast.success('Tracking info saved! Blue Dart shipment updated.');
      onUpdate();
    } catch {
      toast.error('Failed to save tracking info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <FiTruck className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-indigo-800">Blue Dart Tracking</span>
      </div>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-indigo-700">Tracking Number</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Blue Dart AWB number"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-indigo-700">Estimated Delivery Date</label>
          <input
            type="date"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleSaveTracking}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save & Update Shipment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderManagement;
