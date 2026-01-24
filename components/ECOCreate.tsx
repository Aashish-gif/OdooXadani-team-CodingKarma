import { useState } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface ECOCreateProps {
  onNavigate: (page: Page) => void;
  productId?: string;
  role: Role;
}

const products = [
  { id: 'P001', name: 'Office Chair Deluxe' },
  { id: 'P002', name: 'Industrial Pump XR-500' },
  { id: 'P003', name: 'Smartphone Pro 12' },
  { id: 'P004', name: 'Laptop Ultrabook X1' },
  { id: 'P005', name: 'Automotive Dashboard Panel' },
];

const boms: Record<string, string[]> = {
  P001: ['BOM001 - Office Chair Deluxe v2.3'],
  P002: ['BOM002 - Industrial Pump XR-500 v1.8'],
  P003: ['BOM003 - Smartphone Pro 12 v4.2'],
  P004: ['BOM004 - Laptop Ultrabook X1 v3.1'],
  P005: ['BOM005 - Automotive Dashboard Panel v2.0'],
};

export function ECOCreate({ onNavigate, productId, role }: ECOCreateProps) {
  const [ecoTitle, setEcoTitle] = useState('');
  const [ecoType, setEcoType] = useState<'Product' | 'BoM'>('Product');
  const [selectedProduct, setSelectedProduct] = useState(productId || '');
  const [selectedBoM, setSelectedBoM] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('2024-02-01');
  const [versionUpdate, setVersionUpdate] = useState(true);
  const [description, setDescription] = useState('');

  const canSubmit = role === 'Engineer' || role === 'Admin';

  const handleSaveDraft = () => {
    alert('ECO saved as draft');
    onNavigate({ name: 'eco-list' });
  };

  const handleSubmitForApproval = () => {
    if (!ecoTitle || !selectedProduct) {
      alert('Please fill in all required fields');
      return;
    }
    alert('ECO submitted for approval');
    onNavigate({ name: 'eco-list' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate({ name: 'eco-list' })}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ECOs
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Create Engineering Change Order</h3>
          <p className="text-sm text-slate-600 mt-1">Fill in the details for the new ECO</p>
        </div>

        <div className="p-6 space-y-6">
          {/* ECO Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              ECO Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ecoTitle}
              onChange={(e) => setEcoTitle(e.target.value)}
              placeholder="e.g., Update Motor Housing Material"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ECO Type */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              ECO Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Product"
                  checked={ecoType === 'Product'}
                  onChange={(e) => setEcoType(e.target.value as 'Product')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-900">Product Change</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="BoM"
                  checked={ecoType === 'BoM'}
                  onChange={(e) => setEcoType(e.target.value as 'BoM')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-900">Bill of Materials Change</span>
              </label>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setSelectedBoM('');
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.id} - {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* BoM Selection - Conditional */}
          {ecoType === 'BoM' && selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Bill of Materials
              </label>
              <select
                value={selectedBoM}
                onChange={(e) => setSelectedBoM(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a BoM...</option>
                {boms[selectedProduct]?.map((bom, index) => (
                  <option key={index} value={bom}>
                    {bom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the changes and rationale..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Version Update Checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={versionUpdate}
                onChange={(e) => setVersionUpdate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-900">
                Increment version number upon approval
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-6">
              This will create a new version of the {ecoType === 'BoM' ? 'BoM' : 'product'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => onNavigate({ name: 'eco-list' })}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {canSubmit && (
            <>
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                onClick={handleSubmitForApproval}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit for Approval
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
