import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';

interface ProjectFormData {
  name: string;
  description?: string;
  estimated_completion?: string;
  tools_used?: string[];
  proposed_tech?: string[];
  project_details?: any;
  cost_to_operate?: number;
  gas_fee?: number;
  budget?: number;
  start_date?: string;
  end_date?: string;
  priority?: string;
  assigned_to?: string;
  project_type?: 'gas_plan' | 'fiverr' | 'business' | 'custom';
  hours?: number;
  addons_cost?: number;
  gas_plan?: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (projectData: Omit<ProjectFormData, 'name'> & { name: string }) => Promise<void>;
  initialData?: Partial<ProjectFormData>;
  title?: string;
  submitButtonText?: string;
  submitButtonAction?: () => void;
  showCreateButton?: boolean;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Create New Project",
  submitButtonText = "Create Project & Go to Projects",
  submitButtonAction
}: ProjectFormModalProps) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    estimated_completion: initialData.estimated_completion || '',
    tools_used: initialData.tools_used || [],
    proposed_tech: initialData.proposed_tech || [],
    project_details: initialData.project_details || '',
    cost_to_operate: initialData.cost_to_operate,
    gas_fee: initialData.gas_fee,
    budget: initialData.budget,
    priority: initialData.priority || 'medium',
    project_type: (initialData as any).project_type || '',
    hours: (initialData as any).hours || 0,
    addons_cost: (initialData as any).addons_cost || 0,
    gas_plan: (initialData as any).gas_plan || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // required fields: name, project_type, project_details, estimated_completion
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Project Name is required.';
    if (!(formData.project_type)) newErrors.project_type = 'Project Type is required.';
    if (!(formData.project_details && String(formData.project_details).trim())) newErrors.project_details = 'Project Details are required.';
    if (!formData.estimated_completion) newErrors.estimated_completion = 'Estimated Time of Completion is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setCreating(true);

    try {
      // compute pricing before submit
      const computed = computePricing(formData);
      const payload = { ...formData, gas_fee: computed.gasFee, budget: computed.totalBudget } as any;

      if (onSubmit) {
        await onSubmit(payload);
      }

      if (submitButtonAction) {
        submitButtonAction();
      } else {
        // Default action: navigate to projects page
        navigate('/Projects');
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  const computePricing = (data: any) => {
    const rates: Record<string, number> = { fiverr: 75, business: 150, custom: 200 };
    const gasPlanPrices: Record<string, number> = { Basic: 260, Advanced: 460, Ultimate: 1000 };

    const costToOperate = data.cost_to_operate ? Number(data.cost_to_operate) : 0;
    const addons = data.addons_cost ? Number(data.addons_cost) : 0;
    const hours = data.hours ? Number(data.hours) : 0;
    const type = data.project_type || 'gas_plan';

    let gasFee = 0;
    let rateUsed = 0;
    let planPrice = 0;

    if (type === 'gas_plan') {
      if (data.gas_plan) {
        planPrice = gasPlanPrices[data.gas_plan] || 0;
        gasFee = planPrice + addons;
      } else {
        // GAS plan not selected yet -> mark as N/A, only include addons in gasFee
        planPrice = 0;
        gasFee = addons;
      }
    } else if (type) {
      rateUsed = rates[type] || 0;
      gasFee = rateUsed * hours + addons;
    } else {
      // no project type selected -> only cost to operate and addons matter
      gasFee = addons;
    }

    const totalBudget = costToOperate + gasFee;

    return { rateUsed, planPrice, gasFee, totalBudget, costToOperate, addons };
  };

  function PricingBreakdown({ formData }: { formData: any }) {
    const p = computePricing(formData);

    return (
      <div className="text-sm text-gray-700">
        <div className="flex justify-between mb-1"><span>Cost to operate</span><span>${p.costToOperate.toFixed(2)}</span></div>
        {p.planPrice > 0 ? (
          <div className="flex justify-between mb-1"><span>GAS Plan ({(formData as any).gas_plan})</span><span>${p.planPrice.toFixed(2)} /mo</span></div>
        ) : (
          <div className="flex justify-between mb-1"><span>Hourly rate</span><span>${p.rateUsed.toFixed(2)} /hr</span></div>
        )}
        <div className="flex justify-between mb-1"><span>Add-ons / Production</span><span>${p.addons.toFixed(2)}</span></div>
        <div className="border-t mt-2 pt-2 font-semibold flex justify-between"><span>Total GAS Fee</span><span>${p.gasFee.toFixed(2)}</span></div>
        <div className="mt-2 text-lg font-bold flex justify-between"><span>Project Budget</span><span>${p.totalBudget.toFixed(2)}</span></div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      estimated_completion: '',
      tools_used: [],
      proposed_tech: [],
      project_details: '',
      cost_to_operate: undefined,
      gas_fee: undefined,
      budget: undefined,
      priority: 'medium',
      project_type: '',
      hours: 0,
      addons_cost: 0,
      gas_plan: '',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })); }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Website Redesign Project"
              />
              {errors.name ? <p className="text-red-500 text-sm mt-1">{errors.name}</p> : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Type <span className="text-red-500">*</span></label>
            <select
              value={(formData as any).project_type}
              onChange={(e) => {
                setFormData({ ...formData, ...( { project_type: e.target.value } as any) });
                setErrors(prev => ({ ...prev, project_type: '' }));
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none ${errors.project_type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select type</option>
              <option value="gas_plan">GAS Plan</option>
              <option value="fiverr">Fiverr Gig</option>
              <option value="business">Business Contract</option>
              <option value="custom">Custom</option>
            </select>
            {errors.project_type ? <p className="text-red-500 text-sm mt-1">{errors.project_type}</p> : null}
          </div>

          {/* Project Description removed per spec; Project Type and Project Details are required */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Details <span className="text-red-500">*</span></label>
            <textarea
              value={formData.project_details}
              onChange={(e) => { setFormData({ ...formData, project_details: e.target.value }); setErrors(prev => ({ ...prev, project_details: '' })); }}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none ${errors.project_details ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Detailed project requirements and specifications..."
            />
            {errors.project_details ? <p className="text-red-500 text-sm mt-1">{errors.project_details}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time of Completion <span className="text-red-500">*</span></label>
            <select
              value={formData.estimated_completion}
              onChange={(e) => { setFormData({ ...formData, estimated_completion: e.target.value }); setErrors(prev => ({ ...prev, estimated_completion: '' })); }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none ${errors.estimated_completion ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select timeline</option>
              <option value="1-4-weeks">1-4 weeks</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6-months-plus">6 months+</option>
            </select>
            {errors.estimated_completion ? <p className="text-red-500 text-sm mt-1">{errors.estimated_completion}</p> : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost to Operate ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_to_operate || ''}
                onChange={(e) => setFormData({ ...formData, cost_to_operate: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GAS Fee ($)</label>
                {/* show computed gas fee live */}
                {(() => {
                  const pricing = computePricing(formData as any);
                  const display = pricing.gasFee != null ? pricing.gasFee.toFixed(2) : '0.00';
                  return (
                    <input
                      type="text"
                      readOnly
                      value={display}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-right"
                    />
                  );
                })()}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Budget ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours (anticipated)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={(formData as any).hours}
                onChange={(e) => setFormData({ ...formData, ...( { hours: e.target.value ? parseFloat(e.target.value) : 0 } as any) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add-ons / Production Costs ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={(formData as any).addons_cost}
                onChange={(e) => setFormData({ ...formData, ...( { addons_cost: e.target.value ? parseFloat(e.target.value) : 0 } as any) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GAS Plan (if applicable)</label>
              <select
                value={(formData as any).gas_plan}
                onChange={(e) => setFormData({ ...formData, ...( { gas_plan: e.target.value } as any) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                disabled={(formData as any).project_type !== 'gas_plan'}
              >
                <option value="">N/A</option>
                <option value="Basic">Basic — $260/mo</option>
                <option value="Advanced">Advanced — $460/mo</option>
                <option value="Ultimate">Ultimate — $1000/mo</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-4 border border-dashed rounded">
            <h3 className="text-lg font-medium mb-2">Pricing Breakdown</h3>
            <PricingBreakdown formData={formData} />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
