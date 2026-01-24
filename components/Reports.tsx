import { useState, useEffect } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>('eco');
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reports = [
    { id: 'eco', name: 'ECO Report', description: 'All engineering change orders with status' },
    { id: 'product-version', name: 'Product Version History', description: 'Version tracking for all products' },
    { id: 'bom-changes', name: 'BoM Change History', description: 'Bill of materials modifications over time' },
    { id: 'archived', name: 'Archived Products', description: 'Products that have been archived' },
  ];

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/reports?type=${selectedReport}&timePeriod=${timePeriod}`);
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportData();
  }, [selectedReport, timePeriod]);

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
      {/* Report Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${selectedReport === report.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`w-5 h-5 mt-0.5 ${selectedReport === report.id ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                <div>
                  <div className={`font-medium ${selectedReport === report.id ? 'text-blue-900' : 'text-slate-900'
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1month">Last 1 Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-500">Loading...</span>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No data available for this report</div>
          ) : (
            <>
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
                    {reportData.map((eco) => (
                      <tr key={eco.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{eco.ecoId}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{eco.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{eco.product?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eco.status)}`}>
                            {eco.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(eco.createdAt).toLocaleDateString()}</td>
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
                    {reportData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{item.product?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {item.version}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.bomId}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.product?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {item.version}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(item.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.status}</td>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.productId}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {item.versions?.[0]?.version || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
