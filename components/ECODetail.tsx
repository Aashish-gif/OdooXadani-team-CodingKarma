import { useState } from 'react';
import { ArrowLeft, Check, X, CheckCircle2, Clock, FileText, GitCompare, History, ScrollText } from 'lucide-react';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface ECODetailProps {
  ecoId: string;
  onNavigate: (page: Page) => void;
  role: Role;
}

const ecoData: Record<string, any> = {
  '2024-001': {
    title: 'Update Motor Housing Material',
    type: 'BoM',
    product: 'Industrial Pump XR-500',
    productId: 'P002',
    stage: 'Approval',
    status: 'Pending Approval',
    effectiveDate: '2024-02-01',
    createdBy: 'Sarah Chen',
    createdDate: '2024-01-18',
    description: 'Switching motor housing material from standard aluminum to aluminum alloy 6061-T6 for improved strength and corrosion resistance. This change will reduce warranty claims and extend product lifetime.',
    proposedChanges: {
      type: 'bom',
      changes: [
        {
          component: 'Motor Housing - Aluminum Alloy',
          field: 'Material',
          oldValue: 'Aluminum 5052',
          newValue: 'Aluminum Alloy 6061-T6',
          highlight: 'changed',
        },
        {
          component: 'Motor Housing - Aluminum Alloy',
          field: 'Supplier',
          oldValue: 'CastMetal Industries',
          newValue: 'PremiumAlloy Corp',
          highlight: 'changed',
        },
        {
          component: 'Motor Housing - Aluminum Alloy',
          field: 'Unit Cost',
          oldValue: '$145.00',
          newValue: '$168.00',
          highlight: 'increased',
        },
      ],
    },
    approvals: [
      { role: 'Engineering Lead', name: 'Michael Torres', status: 'Approved', date: '2024-01-19', comment: 'Material specification is appropriate' },
      { role: 'Quality Assurance', name: 'Jennifer Liu', status: 'Pending', date: null, comment: null },
      { role: 'Operations Manager', name: 'David Park', status: 'Pending', date: null, comment: null },
    ],
    auditLog: [
      { date: '2024-01-19 14:23', user: 'Michael Torres', action: 'Approved ECO (Engineering Lead)' },
      { date: '2024-01-18 16:45', user: 'Sarah Chen', action: 'Submitted ECO for approval' },
      { date: '2024-01-18 15:12', user: 'Sarah Chen', action: 'Created ECO' },
    ],
  },
  '2024-002': {
    title: 'Price Adjustment - Q1 2024',
    type: 'Product',
    product: 'Office Chair Deluxe',
    productId: 'P001',
    stage: 'Completed',
    status: 'Approved',
    effectiveDate: '2024-01-15',
    createdBy: 'Alex Johnson',
    createdDate: '2024-01-05',
    description: 'Quarterly price adjustment to reflect market conditions and updated supplier costs. Maintaining competitive margin while accounting for 3% material cost increase.',
    proposedChanges: {
      type: 'product',
      changes: [
        {
          field: 'Sale Price',
          oldValue: '$449.99',
          newValue: '$459.99',
          highlight: 'increased',
        },
        {
          field: 'Cost Price',
          oldValue: '$279.50',
          newValue: '$287.50',
          highlight: 'increased',
        },
        {
          field: 'Version',
          oldValue: 'v2.2',
          newValue: 'v2.3',
          highlight: 'changed',
        },
      ],
    },
    approvals: [
      { role: 'Engineering Lead', name: 'Michael Torres', status: 'Approved', date: '2024-01-06', comment: 'Pricing structure is reasonable' },
      { role: 'Finance Manager', name: 'Robert Kim', status: 'Approved', date: '2024-01-08', comment: 'Margins are acceptable' },
      { role: 'Operations Manager', name: 'David Park', status: 'Approved', date: '2024-01-10', comment: 'Approved for implementation' },
    ],
    auditLog: [
      { date: '2024-01-15 09:00', user: 'System', action: 'ECO changes applied automatically' },
      { date: '2024-01-10 11:30', user: 'David Park', action: 'Approved ECO (Operations Manager)' },
      { date: '2024-01-08 14:15', user: 'Robert Kim', action: 'Approved ECO (Finance Manager)' },
      { date: '2024-01-06 10:45', user: 'Michael Torres', action: 'Approved ECO (Engineering Lead)' },
      { date: '2024-01-05 16:20', user: 'Alex Johnson', action: 'Submitted ECO for approval' },
      { date: '2024-01-05 15:00', user: 'Alex Johnson', action: 'Created ECO' },
    ],
  },
};

export function ECODetail({ ecoId, onNavigate, role }: ECODetailProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'comparison' | 'approvals' | 'audit'>('changes');
  const [approvalComment, setApprovalComment] = useState('');
  
  const eco = ecoData[ecoId] || ecoData['2024-001'];

  const canApprove = role === 'Approver' && eco.status === 'Pending Approval';
  const canValidate = role === 'Operations';

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
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStageIndex = () => {
    const stages = ['Draft', 'Approval', 'Implementation', 'Completed'];
    return stages.indexOf(eco.stage);
  };

  const handleApprove = () => {
    alert(`ECO approved with comment: ${approvalComment || 'No comment'}`);
  };

  const handleReject = () => {
    if (!approvalComment) {
      alert('Please provide a reason for rejection');
      return;
    }
    alert(`ECO rejected with comment: ${approvalComment}`);
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

      {/* ECO Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-slate-600 mb-1">ECO-{ecoId}</div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">{eco.title}</h3>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(eco.status)}`}>
                {eco.status}
              </span>
              <span className="text-sm text-slate-600">
                {eco.type} Change • {eco.product}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Effective Date</div>
            <div className="text-lg font-semibold text-slate-900">{eco.effectiveDate}</div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="flex items-center gap-2">
          {['Draft', 'Approval', 'Implementation', 'Completed'].map((stage, index) => {
            const currentIndex = getStageIndex();
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div className={`w-full h-1 rounded-full ${
                    isCompleted || isActive ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-blue-600 text-white' :
                      isActive ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                  </div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-blue-600 font-medium' :
                    isCompleted ? 'text-slate-900' :
                    'text-slate-400'
                  }`}>
                    {stage}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-8 px-6">
            {[
              { id: 'changes', label: 'Proposed Changes', icon: FileText },
              { id: 'comparison', label: 'Change Comparison', icon: GitCompare },
              { id: 'approvals', label: 'Approval History', icon: CheckCircle2 },
              { id: 'audit', label: 'Audit Log', icon: ScrollText },
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
          {activeTab === 'changes' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                <p className="text-slate-700">{eco.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Created By</h4>
                <p className="text-slate-700">{eco.createdBy} on {eco.createdDate}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Change Summary</h4>
                <div className="space-y-2">
                  {eco.proposedChanges.changes.map((change: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      {eco.proposedChanges.type === 'bom' && (
                        <div className="font-medium text-slate-900 mb-1">{change.component}</div>
                      )}
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">{change.field}:</span>{' '}
                        <span className={change.highlight === 'increased' ? 'text-red-700' : change.highlight === 'decreased' ? 'text-emerald-700' : ''}>
                          {change.oldValue} → {change.newValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Side-by-Side Comparison</h4>
              <div className="grid grid-cols-2 gap-6">
                {/* Old Version */}
                <div>
                  <div className="bg-slate-100 px-4 py-2 rounded-t-lg border border-slate-200">
                    <h5 className="font-medium text-slate-900">Current Version</h5>
                  </div>
                  <div className="border border-t-0 border-slate-200 rounded-b-lg divide-y divide-slate-200">
                    {eco.proposedChanges.changes.map((change: any, index: number) => (
                      <div key={index} className="p-4">
                        {eco.proposedChanges.type === 'bom' && (
                          <div className="text-sm font-medium text-slate-900 mb-2">{change.component}</div>
                        )}
                        <div className="text-sm text-slate-600 mb-1">{change.field}</div>
                        <div className={`text-sm font-medium p-2 rounded ${
                          change.highlight !== 'none' ? 'bg-red-50 text-red-900' : 'bg-slate-50 text-slate-900'
                        }`}>
                          {change.oldValue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Version */}
                <div>
                  <div className="bg-blue-100 px-4 py-2 rounded-t-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900">Proposed Version</h5>
                  </div>
                  <div className="border border-t-0 border-blue-200 rounded-b-lg divide-y divide-blue-200">
                    {eco.proposedChanges.changes.map((change: any, index: number) => (
                      <div key={index} className="p-4">
                        {eco.proposedChanges.type === 'bom' && (
                          <div className="text-sm font-medium text-slate-900 mb-2">{change.component}</div>
                        )}
                        <div className="text-sm text-slate-600 mb-1">{change.field}</div>
                        <div className={`text-sm font-medium p-2 rounded ${
                          change.highlight === 'increased' ? 'bg-red-50 text-red-900' :
                          change.highlight === 'decreased' ? 'bg-emerald-50 text-emerald-900' :
                          change.highlight === 'changed' ? 'bg-emerald-50 text-emerald-900' :
                          'bg-slate-50 text-slate-900'
                        }`}>
                          {change.newValue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {eco.approvals.map((approval: any, index: number) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-slate-900">{approval.role}</div>
                      <div className="text-sm text-slate-600">{approval.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {approval.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                          <Check className="w-4 h-4" />
                          Approved
                        </span>
                      )}
                      {approval.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                          <X className="w-4 h-4" />
                          Rejected
                        </span>
                      )}
                      {approval.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  {approval.date && (
                    <div className="text-sm text-slate-600 mb-1">
                      {approval.date}
                    </div>
                  )}
                  {approval.comment && (
                    <div className="text-sm text-slate-700 mt-2 p-2 bg-slate-50 rounded">
                      {approval.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              {eco.auditLog.map((log: any, index: number) => (
                <div key={index} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{log.action}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {log.user} • {log.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Actions */}
      {canApprove && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h4 className="font-medium text-slate-900 mb-4">Approval Decision</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Add your approval comments..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              {canValidate && (
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Validate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
