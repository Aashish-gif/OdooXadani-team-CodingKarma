import { useState } from 'react';
import { ArrowLeft, Package, Wrench } from 'lucide-react';

type Page = any;
type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface BoMDetailProps {
  bomId: string;
  onNavigate: (page: Page) => void;
  role: Role;
}

const bomData: Record<string, any> = {
  BOM001: {
    productName: 'Office Chair Deluxe',
    productId: 'P001',
    version: 'v2.3',
    status: 'Active',
    components: [
      { name: 'Seat Cushion - Memory Foam', quantity: 1, unit: 'pcs', supplier: 'ComfortTech Ltd' },
      { name: 'Backrest Frame - Steel', quantity: 1, unit: 'pcs', supplier: 'MetalWorks Inc' },
      { name: 'Gas Lift Cylinder', quantity: 1, unit: 'pcs', supplier: 'HydroLift Co' },
      { name: 'Armrest Assembly', quantity: 2, unit: 'pcs', supplier: 'ErgoComponents' },
      { name: '5-Star Base - Aluminum', quantity: 1, unit: 'pcs', supplier: 'BaseSupply Ltd' },
      { name: 'Caster Wheels', quantity: 5, unit: 'pcs', supplier: 'WheelPro Inc' },
      { name: 'Upholstery Fabric - Grey', quantity: 2.5, unit: 'm²', supplier: 'TextileMasters' },
      { name: 'Lumbar Support Mechanism', quantity: 1, unit: 'pcs', supplier: 'ErgoComponents' },
      { name: 'Seat Tilt Mechanism', quantity: 1, unit: 'pcs', supplier: 'MechParts Ltd' },
      { name: 'Height Adjustment Lever', quantity: 1, unit: 'pcs', supplier: 'ControlTech' },
    ],
    operations: [
      { name: 'Frame Assembly', time: 15, unit: 'min', workCenter: 'Assembly Line A' },
      { name: 'Upholstery Application', time: 25, unit: 'min', workCenter: 'Upholstery Dept' },
      { name: 'Mechanism Installation', time: 20, unit: 'min', workCenter: 'Assembly Line A' },
      { name: 'Quality Inspection', time: 10, unit: 'min', workCenter: 'QC Station 1' },
      { name: 'Packaging', time: 8, unit: 'min', workCenter: 'Packaging Line' },
    ],
  },
  BOM002: {
    productName: 'Industrial Pump XR-500',
    productId: 'P002',
    version: 'v1.8',
    status: 'Active',
    components: [
      { name: 'Motor Housing - Aluminum Alloy', quantity: 1, unit: 'pcs', supplier: 'CastMetal Industries' },
      { name: 'Electric Motor 5HP', quantity: 1, unit: 'pcs', supplier: 'PowerDrive Motors' },
      { name: 'Impeller - Stainless Steel 316', quantity: 1, unit: 'pcs', supplier: 'Precision Casting Ltd' },
      { name: 'Seal Assembly', quantity: 2, unit: 'pcs', supplier: 'SealTech Corp' },
      { name: 'Bearing Set', quantity: 1, unit: 'set', supplier: 'BearingSupply Co' },
      { name: 'Inlet Flange 4"', quantity: 1, unit: 'pcs', supplier: 'FlangeMakers' },
      { name: 'Outlet Flange 3"', quantity: 1, unit: 'pcs', supplier: 'FlangeMakers' },
      { name: 'Gasket Kit', quantity: 1, unit: 'kit', supplier: 'SealTech Corp' },
    ],
    operations: [
      { name: 'Motor Housing Preparation', time: 30, unit: 'min', workCenter: 'Machining Center 2' },
      { name: 'Impeller Installation', time: 45, unit: 'min', workCenter: 'Assembly Station B' },
      { name: 'Seal and Bearing Assembly', time: 60, unit: 'min', workCenter: 'Assembly Station B' },
      { name: 'Motor Integration', time: 40, unit: 'min', workCenter: 'Motor Assembly' },
      { name: 'Pressure Testing', time: 90, unit: 'min', workCenter: 'Test Lab 1' },
      { name: 'Final Inspection', time: 20, unit: 'min', workCenter: 'QC Station 2' },
    ],
  },
};

export function BoMDetail({ bomId, onNavigate, role }: BoMDetailProps) {
  const [activeView, setActiveView] = useState<'components' | 'operations'>('components');
  const bom = bomData[bomId] || bomData.BOM001;

  const canCreateECO = role === 'Engineer' || role === 'Admin';

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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                {bom.status}
              </span>
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
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'components'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Components
        </button>
        <button
          onClick={() => setActiveView('operations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'operations'
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
                {bom.components.map((component: any, index: number) => (
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
                      <span className="text-sm text-slate-600">{component.supplier}</span>
                    </td>
                  </tr>
                ))}
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
                {bom.operations.map((operation: any, index: number) => (
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
                      <span className="text-sm text-slate-600">{operation.workCenter}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
