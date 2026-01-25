import { ArrowLeft, Package, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface BoMDetailProps {
  bomId: string;
  onNavigate: (page: Page) => void;
  role: Role;
}

export function BoMDetail({ bomId, onNavigate, role }: BoMDetailProps) {
  const [activeView, setActiveView] = useState<'components' | 'operations'>('components');
  const [bom, setBom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchBoM = async () => {
      try {
        const response = await fetch(`/api/bom/${bomId}`);
        if (!response.ok) {
          setError('Failed to load BoM');
          setBom(null);
          return;
        }
        const data = await response.json();
        setBom(data);
      } catch (error) {
        console.error('Failed to fetch BoM:', error);
        setError('Failed to load BoM');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoM();
  }, [bomId]);

  const canCreateECO = role === 'Engineer' || role === 'Admin';
  const canChangeStatus = role === 'Engineer' || role === 'Admin';

  const handleStatusChange = async (newStatus: string) => {
    if (!bom || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/bom/${bomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedBoM = await response.json();
        setBom({ ...bom, status: updatedBoM.status });
        alert('Status updated successfully');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading BoM details...</div>;
  }

  if (error || !bom) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => onNavigate({ name: 'bom-list' })}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to BoMs
        </button>
        <div className="text-center py-12 text-red-500">{error || 'BoM not found'}</div>
      </div>
    );
  }

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
        {canCreateECO && (
          <button
            onClick={() => onNavigate({ name: 'eco-create', productId: bom.productId })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Raise BoM ECO
          </button>
        )}
      </div>

      {/* BoM Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">{bom.productName}</h3>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {bom.version}
              </span>
              {canChangeStatus ? (
                <select
                  value={bom.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                    bom.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                  {bom.status}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">BoM ID</div>
            <div className="text-lg font-semibold text-slate-900">{bomId}</div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveView('components')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'components'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Package className="w-4 h-4" />
          Components
        </button>
        <button
          onClick={() => setActiveView('operations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'operations'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Wrench className="w-4 h-4" />
          Operations
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading BoM details...</div>
        ) : !bom ? (
          <div className="text-center py-12 text-red-500">BoM not found</div>
        ) : (
          <>
            {activeView === 'components' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Component Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Supplier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bom.components?.map((component: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900">{component.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{component.quantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{component.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{component.supplier || 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                    {(!bom.components || bom.components.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                          No components defined for this BoM
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeView === 'operations' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Operation Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Work Center
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bom.operations?.map((operation: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900">{operation.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{operation.time}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{operation.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{operation.workCenter || 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                    {(!bom.operations || bom.operations.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                          No operations defined for this BoM
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
