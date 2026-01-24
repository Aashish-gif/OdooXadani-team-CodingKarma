import { Eye, Search, Filter } from 'lucide-react';
import { useState } from 'react';

type Page = any;

interface BoMListProps {
  onNavigate: (page: Page) => void;
}

const boms = [
  {
    id: 'BOM001',
    productName: 'Office Chair Deluxe',
    version: 'v2.3',
    status: 'Active',
    componentsCount: 23,
  },
  {
    id: 'BOM002',
    productName: 'Industrial Pump XR-500',
    version: 'v1.8',
    status: 'Active',
    componentsCount: 47,
  },
  {
    id: 'BOM003',
    productName: 'Smartphone Pro 12',
    version: 'v4.2',
    status: 'Active',
    componentsCount: 156,
  },
  {
    id: 'BOM004',
    productName: 'Laptop Ultrabook X1',
    version: 'v3.1',
    status: 'Active',
    componentsCount: 89,
  },
  {
    id: 'BOM005',
    productName: 'Automotive Dashboard Panel',
    version: 'v2.0',
    status: 'Active',
    componentsCount: 34,
  },
  {
    id: 'BOM006',
    productName: 'Conference Table Oak',
    version: 'v1.2',
    status: 'Active',
    componentsCount: 12,
  },
  {
    id: 'BOM007',
    productName: 'Electric Motor 5HP',
    version: 'v2.7',
    status: 'Active',
    componentsCount: 28,
  },
  {
    id: 'BOM008',
    productName: 'LED Monitor 27"',
    version: 'v1.0',
    status: 'Archived',
    componentsCount: 67,
  },
];

export function BoMList({ onNavigate }: BoMListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-600';
  };

  // Filter BoMs
  const filteredBoMs = boms.filter((bom) => {
    const matchesSearch = 
      bom.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bom.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Bills of Materials</h3>
          <p className="text-sm text-slate-600 mt-1">
            Component and operation definitions for products - Showing {filteredBoMs.length} of {boms.length} BoMs
          </p>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search BoMs by ID or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  BoM ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Components
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBoMs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No BoMs found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredBoMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{bom.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{bom.productName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {bom.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{bom.componentsCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bom.status)}`}>
                        {bom.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onNavigate({ name: 'bom-detail', id: bom.id })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
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