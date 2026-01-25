import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface ECOCreateProps {
  onNavigate: (page: Page) => void;
  productId?: string;
  role: Role;
}

export function ECOCreate({ onNavigate, productId, role }: ECOCreateProps) {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ecoTitle, setEcoTitle] = useState('');
  const [ecoType, setEcoType] = useState<'Product' | 'BoM'>('Product');
  const [selectedProduct, setSelectedProduct] = useState(productId || '');
  const [selectedBoM, setSelectedBoM] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [versionUpdate, setVersionUpdate] = useState(true);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [changes, setChanges] = useState<Array<{ component?: string; field: string; oldValue?: string; newValue?: string; highlight?: string }>>([
    { component: '', field: '', oldValue: '', newValue: '', highlight: 'changed' }
  ]);
  const [productDetail, setProductDetail] = useState<any | null>(null);
  const [bomDetail, setBomDetail] = useState<any | null>(null);
  const [currentVersion, setCurrentVersion] = useState('');
  const [proposedVersion, setProposedVersion] = useState('');

  const parseVersionNumbers = (v: string): number[] => {
    const match = v.match(/([0-9]+(?:\.[0-9]+)*)/);
    if (!match) return [];
    return match[1].split('.').map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n));
  };

  const compareVersions = (a: string, b: string): number => {
    const pa = parseVersionNumbers(a);
    const pb = parseVersionNumbers(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const va = pa[i] ?? 0;
      const vb = pb[i] ?? 0;
      if (va > vb) return 1;
      if (va < vb) return -1;
    }
    return 0;
  };

  const incrementVersion = (v: string): string => {
    const prefix = v.startsWith('v') ? 'v' : '';
    const nums = parseVersionNumbers(v);
    if (nums.length === 0) return v || 'v1.0';
    nums[nums.length - 1] = nums[nums.length - 1] + 1;
    return `${prefix}${nums.join('.')}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProductsList(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Load selected product detail (versions, boms) to allow auto-fill of old values
  useEffect(() => {
    const loadProductDetail = async () => {
      if (!selectedProduct) {
        setProductDetail(null);
        setCurrentVersion('');
        setProposedVersion('');
        return;
      }
      try {
        const res = await fetch(`/api/products/${selectedProduct}`);
        if (res.ok) {
          const data = await res.json();
          setProductDetail(data);
          const curr = data.currentVersion || 'v1.0';
          setCurrentVersion(curr);
          setProposedVersion(incrementVersion(curr));
        }
      } catch (e) {
        console.error('Failed to load product detail', e);
      }
    };
    loadProductDetail();
  }, [selectedProduct]);

  // Load selected BoM detail (components, operations)
  useEffect(() => {
    const loadBomDetail = async () => {
      if (!selectedBoM) {
        setBomDetail(null);
        return;
      }
      try {
        const res = await fetch(`/api/bom/${selectedBoM}`);
        if (res.ok) {
          const data = await res.json();
          setBomDetail(data);
        }
      } catch (e) {
        console.error('Failed to load BoM detail', e);
      }
    };
    loadBomDetail();
  }, [selectedBoM]);

  const canSubmit = role === 'Engineer' || role === 'Admin';

  const handleSaveDraft = async () => {
    await submitECO('Draft');
  };

  const handleSubmitForApproval = async () => {
    if (!ecoTitle || !selectedProduct) {
      alert('Please fill in all required fields');
      return;
    }
    await submitECO('Pending Approval');
  };

  const submitECO = async (status: string) => {
    if (!proposedVersion) {
      alert('Please enter a proposed version');
      return;
    }
    if (currentVersion && compareVersions(proposedVersion, currentVersion) <= 0) {
      alert('Proposed version must be greater than the current version');
      return;
    }
    setIsLoading(true);
    try {
      // Find the internal DB ID for the selected product
      const product = productsList.find(p => p.productId === selectedProduct || p.id === selectedProduct);

      const response = await fetch('/api/eco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ecoId: `ECO-${Math.floor(1000 + Math.random() * 9000)}`, // Simple auto-gen
          title: ecoTitle,
          type: ecoType,
          productId: product?.id,
          description,
          currentVersion,
          proposedVersion,
          effectiveDate,
          status,
          createdBy: 'Current User', // Placeholder
          changes: changes
            .filter(c => (c.field && (c.oldValue || c.newValue)))
            .map(c => ({
              component: c.component?.trim() || undefined,
              field: c.field.trim(),
              oldValue: c.oldValue?.trim() || undefined,
              newValue: c.newValue?.trim() || undefined,
              highlight: c.highlight || 'changed',
            })),
        }),
      });

      if (response.ok) {
        alert(`ECO ${status === 'Draft' ? 'saved' : 'submitted'} successfully`);
        onNavigate({ name: 'eco-list' });
      } else {
        const data = await response.json();
        alert(`Failed to create ECO: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred while creating the ECO.');
    } finally {
      setIsLoading(false);
    }
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
                setBomDetail(null);
                // Reset changes on new product selection
                setChanges([{ component: '', field: '', oldValue: '', newValue: '', highlight: 'changed' }]);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product...</option>
              {productsList.map((product) => (
                <option key={product.id} value={product.productId}>
                  {product.productId} - {product.name}
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
                {productDetail?.boms?.map((bom: any) => (
                  <option key={bom.id} value={bom.bomId}>
                    {bom.bomId} - {bom.version}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Versioning */}
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Current Version</label>
                <input
                  type="text"
                  value={currentVersion || 'Not available'}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Proposed Next Version <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={proposedVersion}
                  onChange={(e) => setProposedVersion(e.target.value)}
                  placeholder={currentVersion ? `${incrementVersion(currentVersion)} (next)` : 'e.g., v1.1'}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Must be greater than the current version. Default is auto-incremented.</p>
              </div>
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

        {/* Proposed Changes */}
        <div className="p-6 pt-0 space-y-4">
          <h4 className="text-md font-semibold text-slate-900">Proposed Changes</h4>
          <p className="text-sm text-slate-600">Specify what is changing. Use rows like “change this → to this”. These will appear in comparison and summary.</p>
          <div className="space-y-3">
            {changes.map((change, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-900 mb-1">Component {ecoType === 'BoM' ? '' : '(optional)'}</label>
                  {ecoType === 'BoM' && bomDetail?.components?.length ? (
                    <select
                      value={change.component || ''}
                      onChange={(e) => {
                        const next = [...changes];
                        next[idx] = { ...next[idx], component: e.target.value };
                        // If field already chosen, auto-fill oldValue
                        const comp = bomDetail.components.find((c: any) => c.name === e.target.value);
                        if (comp && next[idx].field) {
                          if (next[idx].field === 'quantity') next[idx].oldValue = String(comp.quantity);
                          if (next[idx].field === 'unit') next[idx].oldValue = comp.unit || '';
                          if (next[idx].field === 'supplier') next[idx].oldValue = comp.supplier || '';
                        }
                        setChanges(next);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select component...</option>
                      {bomDetail.components.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={change.component || ''}
                      onChange={(e) => {
                        const next = [...changes];
                        next[idx] = { ...next[idx], component: e.target.value };
                        setChanges(next);
                      }}
                      placeholder={ecoType === 'BoM' ? 'e.g., Fastener M6' : 'e.g., Material'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-900 mb-1">Field *</label>
                  <select
                    value={change.field}
                    onChange={(e) => {
                      const next = [...changes];
                      next[idx] = { ...next[idx], field: e.target.value };
                      // Auto-fill oldValue from baseline
                      if (ecoType === 'BoM' && bomDetail?.components && next[idx].component) {
                        const comp = bomDetail.components.find((c: any) => c.name === next[idx].component);
                        if (comp) {
                          if (e.target.value === 'quantity') next[idx].oldValue = String(comp.quantity);
                          if (e.target.value === 'unit') next[idx].oldValue = comp.unit || '';
                          if (e.target.value === 'supplier') next[idx].oldValue = comp.supplier || '';
                        }
                      }
                      if (ecoType === 'Product' && productDetail) {
                        if (e.target.value === 'salePrice') next[idx].oldValue = String(productDetail.salePrice);
                        if (e.target.value === 'costPrice') next[idx].oldValue = String(productDetail.costPrice);
                        if (e.target.value === 'category') next[idx].oldValue = productDetail.category || '';
                        if (e.target.value === 'manufacturer') next[idx].oldValue = productDetail.manufacturer || '';
                        if (e.target.value === 'description') next[idx].oldValue = productDetail.description || '';
                        if (e.target.value === 'status') next[idx].oldValue = productDetail.status || '';
                      }
                      setChanges(next);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ecoType === 'BoM' ? (
                      <>
                        <option value="">Select field...</option>
                        <option value="quantity">Quantity</option>
                        <option value="unit">Unit</option>
                        <option value="supplier">Supplier</option>
                      </>
                    ) : (
                      <>
                        <option value="">Select field...</option>
                        <option value="salePrice">Sale Price</option>
                        <option value="costPrice">Cost Price</option>
                        <option value="category">Category</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="description">Description</option>
                        <option value="status">Status</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-900 mb-1">From (old)</label>
                  <input
                    type="text"
                    value={change.oldValue || ''}
                    onChange={(e) => {
                      const next = [...changes];
                      next[idx] = { ...next[idx], oldValue: e.target.value };
                      setChanges(next);
                    }}
                    placeholder="e.g., Steel, 2 pcs"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-900 mb-1">To (new)</label>
                  <input
                    type="text"
                    value={change.newValue || ''}
                    onChange={(e) => {
                      const next = [...changes];
                      next[idx] = { ...next[idx], newValue: e.target.value };
                      setChanges(next);
                    }}
                    placeholder="e.g., Aluminum, 3 pcs"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-900 mb-1">Impact</label>
                  <select
                    value={change.highlight || 'changed'}
                    onChange={(e) => {
                      const next = [...changes];
                      next[idx] = { ...next[idx], highlight: e.target.value };
                      setChanges(next);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="changed">Changed</option>
                    <option value="increased">Increased</option>
                    <option value="decreased">Decreased</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="md:col-span-5 flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const next = changes.filter((_, i) => i !== idx);
                      setChanges(next.length ? next : [{ component: '', field: '', oldValue: '', newValue: '', highlight: 'changed' }]);
                    }}
                    className="text-sm px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setChanges([...changes, { component: '', field: '', oldValue: '', newValue: '', highlight: 'changed' }])}
                className="text-sm px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                + Add Change Row
              </button>
            </div>
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
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={handleSubmitForApproval}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
