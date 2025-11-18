import { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import { Bot, Plus, X, Loader2, Sparkles, MessageSquare, Phone, Zap, Share2, Activity, Edit, Power, Code, FileText, Settings, Copy, Eye } from 'lucide-react';
import EnhancedAgentModal from '../components/EnhancedAgentModal';
import AgentManagementModal from '../components/AgentManagementModal';

const agentTypes = [
  {
    id: 'content_generation',
    name: 'Content Generation',
    description: 'Create blog posts, social media content, emails, and more',
    icon: Sparkles,
    color: 'from-purple-600 to-purple-700',
  },
  {
    id: 'voice',
    name: 'Voice Agent',
    description: 'Handle phone calls with real-time speech processing',
    icon: Phone,
    color: 'from-green-600 to-green-700',
  },
  {
    id: 'operating',
    name: 'Operating Agent',
    description: 'Knowledgeable assistant for entire company/project operations',
    icon: Zap,
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'social_media',
    name: 'Social Media Bot',
    description: 'Automate posting, engagement, and content curation',
    icon: Share2,
    color: 'from-pink-600 to-pink-700',
  },
  {
    id: 'lead_qualification',
    name: 'Lead Qualification',
    description: 'Automatically score and qualify leads based on criteria',
    icon: MessageSquare,
    color: 'from-orange-600 to-orange-700',
  },
];

export default function Agents() {
  const { agents, loading, createAgent, updateAgent, deleteAgent } = useAgents();
  const [activeTab, setActiveTab] = useState<'agents' | 'coding'>('agents');
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showAgentManagement, setShowAgentManagement] = useState(false);

  const handleCreateAgent = async (config: any) => {
    try {
      await createAgent({
        name: config.name,
        description: config.description,
        agent_type: config.agentType,
        configuration: {
          aiModel: config.aiModel,
          mcpServerIds: config.mcpServerIds,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          referenceLinks: config.referenceLinks,
          uploadedFiles: config.uploadedFiles,
          promptTemplate: config.promptTemplate,
          memorySize: config.memorySize
        }
      });
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  };

  const getAgentTypeInfo = (type: string) => {
    return agentTypes.find(t => t.id === type) || agentTypes[0];
  };

  const getStatusColor = (status: string | null) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent);
    setShowAgentManagement(true);
  };

  const handleUpdateAgent = async (agentId: string, updates: any) => {
    try {
      await updateAgent(agentId, updates);
      setShowAgentManagement(false);
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await deleteAgent(agentId);
      setShowAgentManagement(false);
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Agents & Coding</h1>
        </div>
        {activeTab === 'agents' && (
          <button
            onClick={() => setShowEnhancedModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Agent
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bot className="w-4 h-4 inline mr-2" />
              AI Agents
            </button>
            <button
              onClick={() => setActiveTab('coding')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Codes
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'agents' && (
        <>
          {agents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first AI agent to automate tasks and enhance productivity
              </p>
              <button
                onClick={() => setShowEnhancedModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => {
                const typeInfo = getAgentTypeInfo(agent.agent_type);
                const TypeIcon = typeInfo.icon;

                return (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentClick(agent)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center`}>
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{agent.description || typeInfo.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Activity className="w-4 h-4" />
                        <span>{agent.performance_metrics?.tasks_completed || 0} tasks</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {agent.performance_metrics?.success_rate || 0}% success
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'coding' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Company Codes & Scripts</h2>
                <p className="text-sm text-gray-600">Customized codes and automation scripts for your organization</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                <Plus className="w-4 h-4" />
                New Code
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample company codes - these would be customized for each organization */}
              <div className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    JavaScript
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">CRM Integration Script</h3>
                <p className="text-sm text-gray-600 mb-3">Syncs customer data across all platforms automatically</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: Nov 18</span>
                  <div className="flex gap-1">
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="View Code">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Copy Code">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    Python
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Data Processing Pipeline</h3>
                <p className="text-sm text-gray-600 mb-3">Processes incoming data and generates business insights</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: Nov 17</span>
                  <div className="flex gap-1">
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="View Code">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Copy Code">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                    SQL
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Analytics Queries</h3>
                <p className="text-sm text-gray-600 mb-3">Custom database queries for company-specific reporting</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: Nov 16</span>
                  <div className="flex gap-1">
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="View Code">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Copy Code">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    API
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Webhook Integrations</h3>
                <p className="text-sm text-gray-600 mb-3">Custom webhook handlers for third-party service integrations</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: Nov 15</span>
                  <div className="flex gap-1">
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="View Code">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Copy Code">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Agent
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">AI Workflow Scripts</h3>
                <p className="text-sm text-gray-600 mb-3">Custom scripts for AI agent automation and processing</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: Nov 14</span>
                  <div className="flex gap-1">
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="View Code">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Copy Code">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <Code className="w-12 h-12 text-blue-400 mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Add Custom Code</h4>
                <p className="text-sm text-gray-600 mb-3">Create company-specific scripts and automation</p>
                <button className="text-blue-600 text-sm hover:text-blue-800 font-medium">
                  + Create Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EnhancedAgentModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        onSave={handleCreateAgent}
      />

      <AgentManagementModal
        isOpen={showAgentManagement}
        onClose={() => setShowAgentManagement(false)}
        agent={selectedAgent}
        onSave={handleUpdateAgent}
        onDelete={handleDeleteAgent}
      />
    </div>
  );
}
