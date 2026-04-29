import React from 'react';
import { Card } from '../components/UI';
import AdminSidebar from '../components/AdminSidebar';
import { BarChart3, LineChart, PieChart } from 'lucide-react';

const AdminReports = () => {
  return (
    <div className="flex bg-background-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600 mb-8">View detailed analytics and performance metrics</p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: '₹95.2L', change: '+25%' },
              { label: 'Success Rate', value: '98.5%', change: '+2.1%' },
              { label: 'Avg Processing', value: '2.4 days', change: '-0.3 days' },
              { label: 'Client Satisfaction', value: '4.8/5', change: '+0.2' },
            ].map((stat, idx) => (
              <Card key={idx}>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-primary-500 mb-2">{stat.value}</p>
                <p className="text-xs text-success">{stat.change} from last month</p>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6 flex items-center gap-2">
                <BarChart3 size={24} />
                Monthly Revenue
              </h2>
              <div className="space-y-4">
                {[
                  { month: 'Jan', value: 80 },
                  { month: 'Feb', value: 95 },
                  { month: 'Mar', value: 110 },
                  { month: 'Apr', value: 125 },
                  { month: 'May', value: 105 },
                  { month: 'Jun', value: 130 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-gray-500">{item.month}</span>
                    <div className="h-3 rounded-full bg-gray-200 flex-1 overflow-hidden">
                      <div className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm text-gray-600">₹{item.value}k</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6 flex items-center gap-2">
                <PieChart size={24} />
                Filing Distribution
              </h2>
              <div className="grid gap-4">
                {[
                  { label: 'GSTR-1', value: 42, color: 'bg-primary-500' },
                  { label: 'ITR', value: 28, color: 'bg-accent-500' },
                  { label: 'TDS', value: 18, color: 'bg-success' },
                  { label: 'Other', value: 12, color: 'bg-warning' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-primary-500 font-semibold">{item.label}</span>
                    </div>
                    <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <h2 className="text-xl font-bold text-primary-500 mb-6 flex items-center gap-2">
              <LineChart size={24} />
              Key Performance Indicators
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Metric</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Current</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Target</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Trend</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Filing Accuracy', current: '99.2%', target: '99%', trend: '↑', status: 'Excellent' },
                    { metric: 'On-time Filing', current: '96.8%', target: '98%', trend: '↓', status: 'Good' },
                    { metric: 'Client Retention', current: '94.5%', target: '95%', trend: '↑', status: 'Good' },
                    { metric: 'Processing Speed', current: '2.4 days', target: '2 days', trend: '↓', status: 'Fair' },
                    { metric: 'Compliance Score', current: '98.7%', target: '99%', trend: '↑', status: 'Excellent' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-semibold text-primary-500">{row.metric}</td>
                      <td className="py-4 px-4 text-gray-600">{row.current}</td>
                      <td className="py-4 px-4 text-gray-600">{row.target}</td>
                      <td className="py-4 px-4 text-lg">{row.trend}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          row.status === 'Excellent' ? 'bg-green-100 text-success' :
                          row.status === 'Good' ? 'bg-blue-100 text-blue-600' :
                          'bg-yellow-100 text-warning'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
