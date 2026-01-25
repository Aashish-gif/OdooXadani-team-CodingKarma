import { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';

type Page = any;
type Role = 'Engineer' | 'ECO Manager' | 'Operations' | 'Admin';

interface ECOListProps {
  onNavigate: (page: Page) => void;
  role: Role;
}

export function ECOList({ onNavigate, role }: ECOListProps) {
  const [ecosList, setEcosList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchECOs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterStage !== 'all') params.append('stage', filterStage);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/eco?${params.toString()}`);
      const data = await response.json();
      setEcosList(data);
    } catch (error) {
      console.error('Failed to fetch ECOs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchECOs();
  }, [searchQuery, filterStage, filterStatus]);

  const canCreateECO = role === 'Engineer' || role === 'Admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700';
      case 'Pending Approval':
        return 'bg-amber-100 text-amber-700';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Archived':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };



  return (
    <div className="space-y-6">
      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ECOs by ID, title, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {canCreateECO && (
          <button
            onClick={() => onNavigate({ name: 'eco-create' })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create ECO
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-600">Filters:</span>
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Stages</option>
          <option value="Draft">Draft</option>
          <option value="Approval">Approval</option>
          <option value="Implementation">Implementation</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="Product">Product Change</option>
          <option value="BoM">BoM Change</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* ECO Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Engineering Change Orders</h3>
          <p className="text-sm text-slate-600 mt-1">
            Showing {ecosList.length} ECOs
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  ECO ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                    Loading ECOs...
                  </td>
                </tr>
              ) : ecosList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                    No ECOs found matching your criteria
                  </td>
                </tr>
              ) : (
                ecosList.map((eco) => (
                  <tr
                    key={eco.id}
                    onClick={() => onNavigate({ name: 'eco-detail', id: eco.id })}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{eco.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{eco.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        eco.type === 'Product' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {eco.type === 'Product' ? 'Product' : 'BoM'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{eco.product}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{eco.stage}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {eco.effectiveDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eco.status)}`}>
                        {eco.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}