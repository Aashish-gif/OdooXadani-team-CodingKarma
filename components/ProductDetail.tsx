import { useState } from 'react';
import { ArrowLeft, FileText, History, Paperclip } from 'lucide-react';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: Page) => void;
  role: Role;
}

const productData: Record<string, any> = {
  P001: {
    name: 'Office Chair Deluxe',
    currentVersion: 'v2.3',
    category: 'Furniture',
    salePrice: '$459.99',
    costPrice: '$287.50',
    status: 'Active',
    description: 'Ergonomic office chair with lumbar support and adjustable armrests',
    sku: 'OC-DLX-2023',
    weight: '18.5 kg',
    dimensions: '68 x 68 x 122 cm',
    manufacturer: 'ErgoFurniture Inc.',
    versions: [
      { version: 'v2.3', date: '2024-01-15', changes: 'Updated fabric supplier, cost reduction' },
      { version: 'v2.2', date: '2023-11-20', changes: 'Improved lumbar support mechanism' },
      { version: 'v2.1', date: '2023-08-10', changes: 'Changed gas lift supplier' },
      { version: 'v2.0', date: '2023-05-01', changes: 'Major redesign - new base and armrests' },
    ],
  },
  P002: {
    name: 'Industrial Pump XR-500',
    currentVersion: 'v1.8',
    category: 'Industrial Equipment',
    salePrice: '$3,249.00',
    costPrice: '$2,150.00',
    status: 'Active',
    description: 'Heavy-duty centrifugal pump for industrial applications',
    sku: 'IP-XR500-2023',
    weight: '125 kg',
    dimensions: '45 x 35 x 60 cm',
    manufacturer: 'HydroTech Industries',
    versions: [
      { version: 'v1.8', date: '2024-01-10', changes: 'Motor housing material updated' },
      { version: 'v1.7', date: '2023-09-15', changes: 'Seal assembly improvement' },
      { version: 'v1.6', date: '2023-06-01', changes: 'Impeller design optimization' },
    ],
  },
};

export function ProductDetail({ productId, onNavigate, role }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'attachments'>('overview');
  const product = productData[productId] || productData.P001;

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
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
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
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Description</label>
                  <p className="text-slate-900">{product.description}</p>
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
                  <p className="text-slate-900">{product.manufacturer}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Sale Price</label>
                  <p className="text-2xl font-semibold text-slate-900">{product.salePrice}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Cost Price</label>
                  <p className="text-2xl font-semibold text-slate-900">{product.costPrice}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Weight</label>
                  <p className="text-slate-900">{product.weight}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Dimensions</label>
                  <p className="text-slate-900">{product.dimensions}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              {product.versions.map((version: any, index: number) => (
                <div
                  key={version.version}
                  className={`p-4 rounded-lg border ${
                    index === 0
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
                    <span className="text-sm text-slate-600">{version.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{version.changes}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="text-center py-12">
              <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No attachments available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
