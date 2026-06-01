import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { storeSettingsApi } from '../api/storeSettings';
import { FiPackage, FiCalendar, FiDollarSign, FiMapPin, FiUser, FiPhone, FiDownload, FiPrinter, FiArrowLeft, FiCheckCircle, FiClock, FiHome, FiTruck, FiCreditCard, FiLock, FiShield, FiX } from 'react-icons/fi';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSlip, setShowSlip] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [slipLoading, setSlipLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await ordersApi.getById(id);
      setOrder(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handlePrintSlip = async () => {
    setSlipLoading(true);
    try {
      const data = await storeSettingsApi.get();
      setStoreInfo(data?.settings || null);
    } catch {
      setStoreInfo(null);
    } finally {
      setSlipLoading(false);
      setShowSlip(true);
      setTimeout(() => window.print(), 300);
    }
  };

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiCheckCircle },
    processing: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FiPackage },
    shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: FiTruck },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: FiClock },
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <FiPackage className="w-16 h-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Order not found</h2>
        <Link to="/profile" className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">Go to Profile</Link>
      </div>
    );
  }

  const statusInfo = statusColors[order.status] || statusColors.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <>
      {/* Main Order Detail Content — hidden during slip print */}
      <div className={`min-h-screen bg-gray-50 ${showSlip ? 'print:hidden' : ''}`}>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link to="/profile" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-6">
            <FiArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}</h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                <StatusIcon className="w-4 h-4" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handlePrintSlip}
                disabled={slipLoading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <FiPrinter className="w-4 h-4" /> {slipLoading ? 'Loading...' : 'Print Slip'}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <FiDownload className="w-4 h-4" /> Print Invoice
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <FiDownload className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
                <div className="mt-4 divide-y divide-gray-100">
                  {(order.items || order.products || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        💊
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.name || item.product?.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">₹{(item.price || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Sub: ₹{((item.price || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Order Timeline</h2>
                <div className="mt-6 space-y-4">
                  {[
                    { status: 'Order Placed', time: order.createdAt, done: true },
                    { status: 'Order Confirmed', time: order.confirmedAt, done: !!order.confirmedAt },
                    { status: 'Processing', time: order.processingAt, done: !!order.processingAt },
                    { status: 'Shipped', time: order.shippedAt, done: !!order.shippedAt },
                    { status: 'Delivered', time: order.deliveredAt, done: !!order.deliveredAt },
                  ].map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          event.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {event.done && <FiCheckCircle className="w-3 h-3" />}
                        </div>
                        {idx < 4 && <div className={`w-0.5 flex-1 ${event.done ? 'bg-emerald-200' : 'bg-gray-200'}`} />}
                      </div>
                      <div className="pb-6">
                        <p className={`text-sm font-medium ${event.done ? 'text-gray-900' : 'text-gray-400'}`}>{event.status}</p>
                        {event.time && (
                          <p className="text-xs text-gray-500">{new Date(event.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Payment Summary</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST</span>
                    <span>₹{(order.totalGst || order.gst || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    {order.discount > 0 && (
                      <>
                        <span>Discount</span>
                        <span className="text-red-500">-₹{(order.discount || 0).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                    <hr />
                    <div className="flex justify-between font-bold text-gray-900 text-base">
                      <span>Grand Total</span>
                      <span>₹{(order.grandTotal || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  {order.payments?.length > 0 ? (
                    <div className="mt-4 p-3 rounded-lg bg-gray-50 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {order.razorpayPaymentId ? (
                          <>
                            <FiLock className="w-3.5 h-3.5 text-emerald-600" />
                            <p className="font-medium text-gray-900">Razorpay</p>
                          </>
                        ) : (
                          <FiDollarSign className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                      <p className="text-gray-500">{order.payments.map(p => p.method).join(', ').replace(/,([^,]*)$/, ' & $1')}</p>
                      {order.razorpayPaymentId && (
                        <div className="mt-1 text-xs text-gray-400">
                          <p>Payment ID: {order.razorpayPaymentId}</p>
                          {order.razorpayOrderId && <p>Order ID: {order.razorpayOrderId}</p>}
                        </div>
                      )}
                      <p className={`text-xs font-medium mt-1 ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                      </p>
                    </div>
                  ) : order.payment?.method ? (
                    <div className="mt-4 p-3 rounded-lg bg-gray-50 text-sm">
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="w-3.5 h-3.5 text-gray-500" />
                        <p className="font-medium text-gray-900 capitalize">{order.payment.method}</p>
                      </div>
                      {order.payment.status && (
                        <p className={`text-xs font-medium mt-1 ${order.payment.status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                          {order.payment.status === 'paid' ? '✓ Paid' : 'Pending'}
                        </p>
                      )}
                    </div>
                  ) : null}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {order.customers?.length > 0 ? order.customers.map((c, i) => (
                    <div key={i} className={i > 0 ? 'pt-3 border-t border-gray-100' : ''}>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiUser className="w-4 h-4 shrink-0" />
                        <span className="font-medium">
                          {c.customerId || c.customer?.customerId
                            ? `${c.customerId || c.customer?.customerId} - ${c.customerName || c.customer?.name || 'N/A'}`
                            : c.customerName || c.customer?.name || 'N/A'}
                        </span>
                      </div>
                      {c.customerPhone && (
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <FiPhone className="w-4 h-4 shrink-0" />
                          <span>Phone: {c.customerPhone}</span>
                        </div>
                      )}
                      {c.customer?.address && (
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <FiMapPin className="w-4 h-4 shrink-0" />
                          <span>{c.customer.address}</span>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUser className="w-4 h-4" />
                      <span>Walk-in</span>
                    </div>
                  )}
                </div>
              </div>

              {/* POS Host */}
              {order.orderType === 'pos' && (order.dealerName || order.dealer?.name) && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">POS Host</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiHome className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="font-medium">{order.dealerName || order.dealer?.name}</span>
                    </div>
                    {order.dealerPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-4 h-4 shrink-0 text-gray-400" />
                        <span>{order.dealerPhone}</span>
                      </div>
                    )}
                    {order.dealer?.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-4 h-4 shrink-0 text-gray-400" />
                        <span>{order.dealer.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.invoiceNumber && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Invoice</h2>
                  <p className="mt-2 text-sm text-gray-500">Invoice #{order.invoiceNumber}</p>
                </div>
              )}

              {/* Shipping / Blue Dart Tracking */}
              {order.shipping && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FiTruck className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">Blue Dart Delivery</h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                      <FiMapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p>{order.shipping.name}</p>
                        <p>{order.shipping.phone}</p>
                        <p>{[order.shipping.address, order.shipping.city, order.shipping.state, order.shipping.pincode].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                    {order.shipping.trackingNumber && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                        <p className="text-xs text-blue-600 font-medium">Tracking Number</p>
                        <p className="text-sm font-bold text-blue-800 mt-0.5 font-mono">{order.shipping.trackingNumber}</p>
                        <p className="text-xs text-blue-500 mt-1">Courier Partner: {order.shipping.courierPartner || 'Blue Dart'}</p>
                      </div>
                    )}
                    {order.shipping.estimatedDelivery && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        <span>Estimated Delivery: <strong>{new Date(order.shipping.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {order.shipping.shippingCost === 0 ? '✓ Free Shipping' : `Shipping: ₹${order.shipping.shippingCost}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      {showSlip && (
        <div className="fixed inset-0 z-50 bg-black/50 print:bg-white print:inset-auto print:relative print:z-0 flex items-center justify-center print:block">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] mx-4 print:w-[80mm] print:rounded-none print:shadow-none print:mx-auto print:p-2 overflow-y-auto max-h-[90vh] print:max-h-none">
            {/* Close button — hidden in print */}
            <div className="flex justify-end p-3 print:hidden">
              <button
                onClick={() => setShowSlip(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Slip */}
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
                <h3 className="text-base font-bold text-gray-900">
                  INVOICE
                </h3>
                <p className="text-xs text-gray-600">
                  #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  statusInfo.bg?.replace('bg-', 'bg-').replace('100', '200') + ' ' + statusInfo.text
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Dealer / Supplier */}
              {(order.dealerName || order.dealer?.name) && (
                <div className="mb-3 text-xs border-b border-dashed border-gray-200 pb-3">
                  <p className="font-semibold text-gray-700">Dealer / Supplier:</p>
                  <p className="text-gray-600">{order.dealerName || order.dealer?.name}</p>
                  {order.dealerPhone && <p className="text-gray-500">{order.dealerPhone}</p>}
                  {order.dealerAddress && <p className="text-gray-500">{order.dealerAddress}</p>}
                </div>
              )}

              {/* Customers */}
              {order.customers?.length > 0 && (
                <div className="mb-3 text-xs border-b border-dashed border-gray-200 pb-3">
                  <p className="font-semibold text-gray-700">Customer(s):</p>
                  {order.customers.map((c, i) => (
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
                  {(order.items || order.products || []).map((item, idx) => {
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
                  <span>₹{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span>₹{(order.totalGst || order.gst || 0).toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-sm border-t border-gray-300 pt-1 mt-1">
                  <span>Grand Total</span>
                  <span>₹{(order.grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="text-xs border-t border-dashed border-gray-200 pt-3 mb-4">
                <p className="font-semibold text-gray-700 mb-1">Payment:</p>
                {order.payments?.length > 0 ? order.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span className="capitalize">{p.method}</span>
                    <span>₹{(p.amount || 0).toLocaleString()}</span>
                  </div>
                )) : (
                  <p className="text-gray-500">{order.payment?.method ? order.payment.method : '—'}</p>
                )}
                <p className={`text-xs font-medium mt-1 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </p>
              </div>

              {/* Footer Message */}
              <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-300 pt-3">
                <p className="italic">{storeInfo?.footerMessage || 'Thank you for your business!'}</p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Powered by Prandhara ERP
                </p>
              </div>
            </div>

            {/* Action Buttons — hidden in print */}
            <div className="flex gap-3 p-4 border-t border-gray-100 print:hidden">
              <button
                onClick={() => {
                  setShowSlip(false);
                  setStoreInfo(null);
                }}
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

export default OrderDetail;
