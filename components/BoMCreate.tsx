import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

type Page = any;

interface BoMCreateProps {
  onNavigate: (page: Page) => void;
  productId?: string;
}

interface Component {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  supplier: string;
}

interface Operation {
  id: string;
  name: string;
  time: string;
  unit: string;
  workCenter: string;
}

export function BoMCreate({ onNavigate, productId }: BoMCreateProps) {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(productId || '');
  const [currentBomVersion, setCurrentBomVersion] = useState('');
  const [bomVersion, setBomVersion] = useState('');
  const [components, setComponents] = useState<Component[]>([
    { id: '1', name: '', quantity: '', unit: '', supplier: '' },
  ]);
  const [operations, setOperations] = useState<Operation[]>([
    { id: '1', name: '', time: '', unit: '', workCenter: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!selectedProduct) {
      setCurrentBomVersion('');
      setBomVersion(''); 
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${selectedProduct}`);
        const product = await response.json();
        
        // Find latest BoM version
        if (product.boms && Array.isArray(product.boms) && product.boms.length > 0) {
          const sortedBoms = product.boms.sort((a: any, b: any) => compareVersions(b.version, a.version));
          const latest = sortedBoms[0].version;
          setCurrentBomVersion(latest);
          setBomVersion(incrementVersion(latest));
        } else {
          setCurrentBomVersion('None');
          setBomVersion('v1.0');
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        setCurrentBomVersion('');
      }
    };

    fetchProductDetails();
  }, [selectedProduct]);

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { id: Date.now().toString(), name: '', quantity: '', unit: '', supplier: '' },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleComponentChange = (id: string, field: keyof Component, value: string) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleAddOperation = () => {
    setOperations([
      ...operations,
      { id: Date.now().toString(), name: '', time: '', unit: '', workCenter: '' },
    ]);
  };

  const handleRemoveOperation = (id: string) => {
    setOperations(operations.filter(o => o.id !== id));
  };

  const handleOperationChange = (id: string, field: keyof Operation, value: string) => {
    setOperations(operations.map(o =>
      o.id === id ? { ...o, [field]: value } : o
    ));
  };

  const handleCreateBoM = async () => {
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (!bomVersion) {
      alert('Please enter a BoM version');
      return;
    }

    const validComponents = components.filter(c => c.name && c.quantity && c.unit);
    const validOperations = operations.filter(o => o.name && o.time && o.unit);

    if (validComponents.length === 0) {
      alert('Please add at least one component');
      return;
    }

    setIsLoading(true);
    try {
      const product = productsList.find(p => p.productId === selectedProduct || p.id === selectedProduct);

      const response = await fetch('/api/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bomId: `BOM-${Math.floor(1000 + Math.random() * 9000)}`,
          productId: product?.id,
          version: bomVersion,
          components: validComponents.map(({ id, ...c }) => c),
          operations: validOperations.map(({ id, ...o }) => o),
        }),
      });

      if (response.ok) {
        alert('BoM created successfully');
        onNavigate({ name: 'bom-list' });
      } else {
        const data = await response.json();
        alert(`Failed to create BoM: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred while creating the BoM.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate({ name: 'bom-list' })}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to BoMs
        </button>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Create Bill of Materials</h2>
          <p className="text-sm text-slate-600 mt-1">Define components and operations for a product</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a product...</option>
              {productsList.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Current BoM Version</label>
                <input
                  type="text"
                  value={currentBomVersion || 'None'}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  New BoM Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                    value={bomVersion}
                    onChange={(e) => setBomVersion(e.target.value)}
                    placeholder="e.g. v1.0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
          </div>

          {/* Components Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-900">
                Components <span className="text-red-500">*</span>
              </label>
              <button
                onClick={handleAddComponent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Component
              </button>
            </div>

            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={component.id} className="grid grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) => handleComponentChange(component.id, 'name', e.target.value)}
                    placeholder="Component name"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={component.quantity}
                    onChange={(e) => handleComponentChange(component.id, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={component.unit}
                    onChange={(e) => handleComponentChange(component.id, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={component.supplier}
                    onChange={(e) => handleComponentChange(component.id, 'supplier', e.target.value)}
                    placeholder="Supplier"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveComponent(component.id)}
                    className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Operations Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-900">Operations</label>
              <button
                onClick={handleAddOperation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Operation
              </button>
            </div>

            <div className="space-y-3">
              {operations.map((operation) => (
                <div key={operation.id} className="grid grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    value={operation.name}
                    onChange={(e) => handleOperationChange(operation.id, 'name', e.target.value)}
                    placeholder="Operation name"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={operation.time}
                    onChange={(e) => handleOperationChange(operation.id, 'time', e.target.value)}
                    placeholder="Time"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={operation.unit}
                    onChange={(e) => handleOperationChange(operation.id, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={operation.workCenter}
                    onChange={(e) => handleOperationChange(operation.id, 'workCenter', e.target.value)}
                    placeholder="Work Center"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveOperation(operation.id)}
                    className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => onNavigate({ name: 'bom-list' })}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateBoM}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Creating...' : 'Create BoM'}
          </button>
        </div>
      </div>
    </div>
  );
}
