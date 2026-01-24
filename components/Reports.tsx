import { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>('eco');
  const [timePeriod, setTimePeriod] = useState<string>('6months');

  const reports = [
    { id: 'eco', name: 'ECO Report', description: 'All engineering change orders with status' },
    { id: 'product-version', name: 'Product Version History', description: 'Version tracking for all products' },
    { id: 'bom-changes', name: 'BoM Change History', description: 'Bill of materials modifications over time' },
    { id: 'archived', name: 'Archived Products', description: 'Products that have been archived' },
  ];

  const ecoReportData = [
    { ecoId: 'ECO-2024-001', title: 'Update Motor Housing Material', product: 'Industrial Pump XR-500', status: 'Pending Approval', date: '2024-01-18' },
    { ecoId: 'ECO-2024-002', title: 'Price Adjustment - Q1 2024', product: 'Office Chair Deluxe', status: 'Approved', date: '2024-01-05' },
    { ecoId: 'ECO-2024-003', title: 'Component Substitution', product: 'Smartphone Pro 12', status: 'Draft', date: '2024-01-21' },
    { ecoId: 'ECO-2024-004', title: 'Add Mounting Bracket', product: 'Automotive Dashboard Panel', status: 'Pending Approval', date: '2024-01-20' },
    { ecoId: 'ECO-2024-005', title: 'Cost Reduction Initiative', product: 'USB-C Cable 2m', status: 'Approved', date: '2024-01-10' },
  ];

  const productVersionData = [
    { product: 'Office Chair Deluxe', version: 'v2.3', date: '2024-01-15', changes: 'Price adjustment' },
    { product: 'Office Chair Deluxe', version: 'v2.2', date: '2023-11-20', changes: 'Lumbar support improvement' },
    { product: 'Industrial Pump XR-500', version: 'v1.8', date: '2024-01-10', changes: 'Motor housing material update' },
    { product: 'Smartphone Pro 12', version: 'v4.2', date: '2023-12-05', changes: 'Component updates' },
  ];

  const bomChangesData = [
    { bomId: 'BOM001', product: 'Office Chair Deluxe', version: 'v2.3', changeDate: '2024-01-15', changeType: 'Component Update' },
    { bomId: 'BOM002', product: 'Industrial Pump XR-500', version: 'v1.8', changeDate: '2024-01-10', changeType: 'Material Change' },
    { bomId: 'BOM003', product: 'Smartphone Pro 12', version: 'v4.2', changeDate: '2023-12-05', changeType: 'Supplier Change' },
  ];

  const archivedData = [
    { productId: 'P009', name: 'LED Monitor 27"', version: 'v1.0', archivedDate: '2023-12-31', reason: 'End of life' },
  ];

  // Analytics data - adjust based on time period
  const getApprovalTimeData = () => {
    switch (timePeriod) {
      case '3months':
        return [
          { month: 'Nov', avgDays: 4.5 },
          { month: 'Dec', avgDays: 5.8 },
          { month: 'Jan', avgDays: 4.2 },
        ];
      case '6months':
        return [
          { month: 'Aug', avgDays: 5.2 },
          { month: 'Sep', avgDays: 4.8 },
          { month: 'Oct', avgDays: 6.1 },
          { month: 'Nov', avgDays: 4.5 },
          { month: 'Dec', avgDays: 5.8 },
          { month: 'Jan', avgDays: 4.2 },
        ];
      case '1year':
        return [
          { month: 'Feb 23', avgDays: 5.5 },
          { month: 'Mar 23', avgDays: 6.2 },
          { month: 'Apr 23', avgDays: 5.0 },
          { month: 'May 23', avgDays: 4.8 },
          { month: 'Jun 23', avgDays: 5.3 },
          { month: 'Jul 23', avgDays: 5.1 },
          { month: 'Aug 23', avgDays: 5.2 },
          { month: 'Sep 23', avgDays: 4.8 },
          { month: 'Oct 23', avgDays: 6.1 },
          { month: 'Nov 23', avgDays: 4.5 },
          { month: 'Dec 23', avgDays: 5.8 },
          { month: 'Jan 24', avgDays: 4.2 },
        ];
      default:
        return [
          { month: 'Aug', avgDays: 5.2 },
          { month: 'Sep', avgDays: 4.8 },
          { month: 'Oct', avgDays: 6.1 },
          { month: 'Nov', avgDays: 4.5 },
          { month: 'Dec', avgDays: 5.8 },
          { month: 'Jan', avgDays: 4.2 },
        ];
    }
  };

  const approvalTimeData = getApprovalTimeData();

  const handleExport = () => {
    alert('Export functionality would download the report as CSV');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700';
      case 'Pending Approval':
        return 'bg-amber-100 text-amber-700';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Average ECO Approval Time</h3>
            <p className="text-sm text-slate-600 mt-1">Time from submission to approval (in days)</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 1 Year</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={approvalTimeData}>
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Area type="monotone" dataKey="avgDays" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTime)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Report Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedReport === report.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`w-5 h-5 mt-0.5 ${
                  selectedReport === report.id ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <div>
                  <div className={`font-medium ${
                    selectedReport === report.id ? 'text-blue-900' : 'text-slate-900'
                  }`}>
                    {report.name}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{report.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {reports.find(r => r.id === selectedReport)?.name}
          </h3>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === 'eco' && (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">ECO ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ecoReportData.map((eco) => (
                  <tr key={eco.ecoId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{eco.ecoId}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{eco.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{eco.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eco.status)}`}>
                        {eco.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{eco.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'product-version' && (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {productVersionData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{item.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'bom-changes' && (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">BoM ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Change Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Change Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bomChangesData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.bomId}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{item.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.changeDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.changeType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'archived' && (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Archived Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {archivedData.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.productId}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.archivedDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}