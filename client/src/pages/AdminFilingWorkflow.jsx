import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import AdminSidebar from '../components/AdminSidebar';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdminFilingWorkflow = () => {
  const filings = [
    {
      id: 1,
      client: 'Birla Traders ',
      type: 'GSTR-1',
      period: 'Mar 2024',
      status: 'Pending Review',
      uploadDate: '2024-04-15',
      dueDate: '2024-04-20',
      documents: 5,
    },
    {
      id: 2,
      client: 'Raghav consultancy &  Services',
      type: 'ITR-3',
      period: 'FY 2023-24',
      status: 'Documents Received',
      uploadDate: '2024-04-10',
      dueDate: '2024-05-15',
      documents: 12,
    },
    {
      id: 3,
      client: 'Yours that partner Ltd',
      type: 'GSTR-3B',
      period: 'Feb 2024',
      status: 'Filed',
      uploadDate: '2024-03-15',
      dueDate: '2024-03-20',
      documents: 3,
    },
  ];

  const statusConfig = {
    'Pending Review': { color: 'warning', icon: Clock },
    'Documents Received': { color: 'default', icon: FileText },
    'Filed': { color: 'success', icon: CheckCircle },
    'Pending': { color: 'warning', icon: AlertCircle },
  };

  return (
    <div className="flex bg-background-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Filing Workflow</h1>
          <p className="text-gray-600 mb-8">Manage and process client filings</p>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Filings', value: 45, color: 'text-primary-500' },
              { label: 'Pending Review', value: 8, color: 'text-warning' },
              { label: 'Filed', value: 34, color: 'text-success' },
              { label: 'Issues', value: 3, color: 'text-danger' },
            ].map((stat, idx) => (
              <Card key={idx}>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="text-xl font-bold text-primary-500 mb-6">Active Filings</h2>

            <div className="space-y-4">
              {filings.map((filing) => {
                const config = statusConfig[filing.status] || statusConfig['Pending'];
                const Icon = config.icon;

                return (
                  <div key={filing.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-soft-lg transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">CLIENT</p>
                        <p className="font-bold text-primary-500 mb-3">{filing.client}</p>

                        <p className="text-xs text-gray-600 mb-1">FILING TYPE</p>
                        <p className="font-semibold text-gray-800">{filing.type} - {filing.period}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">STATUS</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon size={18} className="text-accent-500" />
                          <Badge variant={config.color}>{filing.status}</Badge>
                        </div>

                        <p className="text-xs text-gray-600">Documents: <span className="font-bold">{filing.documents}</span></p>
                        <p className="text-xs text-gray-600">Due: <span className="font-bold">{filing.dueDate}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" className="flex-1 text-sm py-2">View Details</Button>
                      <Button variant="primary" className="flex-1 text-sm py-2">Process Filing</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminFilingWorkflow;
