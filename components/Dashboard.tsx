import { Package, Layers, FileEdit, CheckCircle, Clock, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Page = any;

interface DashboardProps {
  onNavigate: (page: Page) => void;
  role?: 'Engineer' | 'Approver' | 'Operations' | 'Admin';
}

const recentECOs = [
  {
    id: '2024-001',
    title: 'Update Motor Housing Material',
    type: 'BoM',
    product: 'Industrial Pump XR-500',
    status: 'Approval',
    lastUpdated: '2024-01-23',
  },
  {
    id: '2024-002',
    title: 'Price Adjustment - Q1 2024',
    type: 'Product',
    product: 'Office Chair Deluxe',
    status: 'Done',
    lastUpdated: '2024-01-22',
  },
  {
    id: '2024-003',
    title: 'Component Substitution - Chip Supplier Change',
    type: 'BoM',
    product: 'Smartphone Pro 12',
    status: 'New',
    lastUpdated: '2024-01-21',
  },
  {
    id: '2024-004',
    title: 'Add Mounting Bracket to Assembly',
    type: 'BoM',
    product: 'Automotive Dashboard Panel',
    status: 'Approval',
    lastUpdated: '2024-01-20',
  },
  {
    id: '2024-005',
    title: 'Cost Reduction Initiative - Cable Assembly',
    type: 'Product',
    product: 'USB-C Cable 2m',
    status: 'Done',
    lastUpdated: '2024-01-19',
  },
];

// Analytics Data
const ecoTrendData = [
  { month: 'Aug', created: 12, approved: 10, rejected: 1 },
  { month: 'Sep', created: 15, approved: 13, rejected: 2 },
  { month: 'Oct', created: 18, approved: 14, rejected: 2 },
  { month: 'Nov', created: 14, approved: 16, rejected: 1 },
  { month: 'Dec', created: 20, approved: 18, rejected: 2 },
  { month: 'Jan', created: 23, approved: 19, rejected: 3 },
];

const ecoStatusData = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Approval', value: 18, color: '#f59e0b' },
  { name: 'Draft', value: 12, color: '#64748b' },
  { name: 'Rejected', value: 8, color: '#ef4444' },
];

const productCategoryData = [
  { category: 'Furniture', count: 28 },
  { category: 'Electronics', count: 42 },
  { category: 'Industrial', count: 35 },
  { category: 'Automotive', count: 22 },
];

export function Dashboard({ onNavigate, role }: DashboardProps) {
  const stats = [
    {
      label: 'Total Products',
      value: '127',
      icon: Package,
      trend: '+12',
      trendUp: true,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active BoMs',
      value: '89',
      icon: Layers,
      trend: '+5',
      trendUp: true,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Open ECOs',
      value: '23',
      icon: FileEdit,
      trend: '-3',
      trendUp: false,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Pending Approvals',
      value: '8',
      icon: Clock,
      trend: '+2',
      trendUp: true,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-700';
      case 'Approval':
        return 'bg-amber-100 text-amber-700';
      case 'Done':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const canCreateActions = role === 'Engineer' || role === 'Admin';

  return (
    <div className="space-y-8">
      {/* Quick Access Actions */}
      {canCreateActions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate({ name: 'products' })}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-blue-900">Create Product</div>
              <div className="text-xs text-blue-700 mt-0.5">Add new product to catalog</div>
            </div>
            <Plus className="w-5 h-5 text-blue-600 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate({ name: 'bom-list' })}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-emerald-900">Create BoM</div>
              <div className="text-xs text-emerald-700 mt-0.5">Define bill of materials</div>
            </div>
            <Plus className="w-5 h-5 text-emerald-600 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate({ name: 'eco-create' })}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileEdit className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-purple-900">Create ECO</div>
              <div className="text-xs text-purple-700 mt-0.5">New engineering change order</div>
            </div>
            <Plus className="w-5 h-5 text-purple-600 ml-auto" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={`w-4 h-4 ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className={`text-sm ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.trend} this month
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ECO Trend Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">ECO Trend (Last 6 Months)</h3>
            <p className="text-sm text-slate-600 mt-1">Created vs. Approved ECOs over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ecoTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ECO Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">ECO Status Distribution</h3>
            <p className="text-sm text-slate-600 mt-1">Current status breakdown of all ECOs</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ecoStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ecoStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Products by Category</h3>
            <p className="text-sm text-slate-600 mt-1">Distribution of products across manufacturing categories</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent ECO Activity */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent ECO Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentECOs.map((eco) => (
                <tr
                  key={eco.id}
                  onClick={() => onNavigate({ name: 'eco-detail', id: eco.id })}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">ECO-{eco.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">{eco.title}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{eco.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{eco.product}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eco.status)}`}>
                      {eco.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {eco.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}