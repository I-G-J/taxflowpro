import React, { useEffect, useState } from 'react';
import { Card, Badge } from '../components/UI';
import AdminSidebar from '../components/AdminSidebar';
import { Users, FileText, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAccountants: 0,
    pendingKYC: 0,
    activeClients: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const metricCards = [
    { icon: Users, label: 'Total Clients', value: stats.totalClients, color: 'text-blue-500' },
    { icon: FileText, label: 'Pending KYC', value: stats.pendingKYC, color: 'text-orange-500' },
    { icon: Clock, label: 'Active Clients', value: stats.activeClients, color: 'text-green-500' },
    { icon: TrendingUp, label: 'Accountants', value: stats.totalAccountants, color: 'text-purple-500' },
  ];

  const recentClients = clients.slice(0, 6).map((client) => ({
    name: client.businessName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
    status: client.isActive ? 'Active' : 'Inactive',
    joined: client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown',
    filings: client.filingsCount ?? '-',
  }));

  const taskList = [
    { task: 'Review GSTR-1 for ABC Manufacturing', priority: 'High', dueDate: 'Today' },
    { task: 'Verify PAN for Tech Startup Ltd', priority: 'Medium', dueDate: 'Tomorrow' },
    { task: 'Update compliance calendar', priority: 'Low', dueDate: '2024-04-20' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [clientsResponse, accountantsResponse] = await Promise.all([
          userAPI.getAllUsers(1, 50, 'client'),
          userAPI.getAccountants(),
        ]);

        const fetchedClients = clientsResponse.data.users || [];
        const fetchedAccountants = accountantsResponse.data.users || accountantsResponse.data || [];

        setClients(fetchedClients);
        setAccountants(fetchedAccountants);
        setStats({
          totalClients: clientsResponse.data.pagination?.total ?? fetchedClients.length,
          totalAccountants: fetchedAccountants.length,
          pendingKYC: fetchedClients.filter((client) => client.kycStatus !== 'verified').length,
          activeClients: fetchedClients.filter((client) => client.isActive).length,
        });
      } catch (loadError) {
        setError(loadError.message || 'Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex bg-background-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Administrator'}</p>
          </div>
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-12 text-gray-600">Loading admin dashboard...</div>
          ) : (
            <>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {metricCards.map((stat, idx) => (
              <Card key={idx}>
                <div className="flex justify-start items-center gap-3 mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <p className="text-gray-600 text-sm mb-0">{stat.label}</p>
                </div>
                <p className="text-3xl font-bold text-primary-500">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Clients */}
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-primary-500 mb-6">Recent Clients</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-primary-500">Client Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary-500">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary-500">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary-500">Filings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClients.map((client, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-primary-500">{client.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant={client.status === 'Active' ? 'success' : 'warning'}>
                            {client.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{client.joined}</td>
                        <td className="py-3 px-4 font-bold text-primary-500">{client.filings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6">Pending Tasks</h2>
              <div className="space-y-4">
                {taskList.map((task, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-warning">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-primary-500 text-sm">{task.task}</p>
                      <Badge variant={
                        task.priority === 'High' ? 'danger' : 
                        task.priority === 'Medium' ? 'warning' : 
                        'default'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">Due: {task.dueDate}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6">Filing Status Summary</h2>
              <div className="space-y-4">
                {[
                  { name: 'GSTR-1', count: 245, percentage: 85 },
                  { name: 'ITR-3', count: 178, percentage: 72 },
                  { name: 'TDS Challan', count: 96, percentage: 65 },
                  { name: 'Pending', count: 78, percentage: 35 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-primary-500">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.count} filed</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-accent-500 to-primary-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6">Alerts & Issues</h2>
              <div className="space-y-3">
                {[
                  { title: 'High Priority Issues', count: 3, color: 'text-danger' },
                  { title: 'Medium Priority Issues', count: 7, color: 'text-warning' },
                  { title: 'Verification Pending', count: 12, color: 'text-orange-500' },
                  { title: 'Compliance At Risk', count: 2, color: 'text-red-600' },
                ].map((alert, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className={alert.color} />
                      <span className="font-semibold text-primary-500">{alert.title}</span>
                    </div>
                    <span className={`font-bold text-lg ${alert.color}`}>{alert.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
