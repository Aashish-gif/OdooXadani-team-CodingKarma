import { ArrowLeft, FileText, History, Paperclip } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: Page) => void;
  role: Role;
}

export function ProductDetail({ productId, onNavigate, role }: ProductDetailProps) {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'attachments'>('overview');
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('[ProductDetail] Fetching product with ID:', productId);
        const response = await fetch(`/api/products/${productId}`);
        console.log('[ProductDetail] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('[ProductDetail] API error:', errorData);
          setProduct(null);
        } else {
          const data = await response.json();
          console.log('[ProductDetail] Product data received:', data);
          setProduct(data ?? null);
        }
      } catch (error) {
        console.error('[ProductDetail] Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);
  console.log('Product:', product);

  const canCreateECO = role === 'Engineer' || role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate({ name: 'products' })}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        {canCreateECO && (
          <button
            onClick={() => onNavigate({ name: 'eco-create', productId })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create ECO
          </button>
        )}
      </div>

      {/* Product Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="flex gap-3">
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>
          </div>
        ) : !product ? (
          <div className="text-slate-600">Product not found</div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {product.currentVersion}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                  {product.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Product ID</div>
              <div className="text-lg font-semibold text-slate-900">{productId}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'versions', label: 'Version History', icon: History },
              { id: 'attachments', label: 'Attachments', icon: Paperclip },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading product details...</div>
          ) : !product ? (
            <div className="text-center py-12 text-red-500">Product not found</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Description</label>
                      <p className="text-slate-900">{product.description || 'No description available'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Category</label>
                      <p className="text-slate-900">{product.category}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">SKU</label>
                      <p className="text-slate-900">{product.sku}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Manufacturer</label>
                      <p className="text-slate-900">{product.manufacturer || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Sale Price</label>
                      <p className="text-2xl font-semibold text-slate-900">{formatPrice(Number(product.salePrice))}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Cost Price</label>
                      <p className="text-2xl font-semibold text-slate-900">{formatPrice(Number(product.costPrice))}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Weight</label>
                      <p className="text-slate-900">{product.weight || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Dimensions</label>
                      <p className="text-slate-900">{product.dimensions || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'versions' && (
                <div className="space-y-4">
                  {product.versions?.map((version: any, index: number) => (
                    <div
                      key={version.id || version.version}
                      className={`p-4 rounded-lg border ${index === 0
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900">{version.version}</span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-600">
                          {new Date(version.date || version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{version.changes}</p>
                    </div>
                  ))}
                  {(!product.versions || product.versions.length === 0) && (
                    <div className="text-center py-12 text-slate-500">No version history available</div>
                  )}
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="text-center py-12">
                  <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No attachments available</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
