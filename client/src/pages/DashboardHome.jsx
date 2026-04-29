import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../components/UI';
import ClientSidebar from '../components/ClientSidebar';
import { FileText, Calendar, Upload, BarChart3, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../services/api';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedAccountant, setAssignedAccountant] = useState(null);
  const [assignedLoading, setAssignedLoading] = useState(true);

  const recentActivities = [
    { title: 'GSTR-1 Filed', date: '2024-04-15', status: 'success' },
    { title: 'Documents Uploaded', date: '2024-04-14', status: 'success' },
    { title: 'Invoice Generated', date: '2024-04-10', status: 'success' },
    { title: 'Payment Received', date: '2024-04-08', status: 'success' },
  ];

  const upcomingDates = [
    { title: 'GSTR-3B Due', date: 'Apr 20, 2024', daysLeft: 5 },
    { title: 'TDS Return', date: 'May 7, 2024', daysLeft: 21 },
    { title: 'Annual Compliance', date: 'Jun 30, 2024', daysLeft: 65 },
  ];

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const response = await assignmentAPI.getAssignments('', 1, 1);
        const assignment = response.data.assignments?.[0] || null;
        setAssignedAccountant(assignment?.accountantId || null);
      } catch (error) {
        // ignore silently
      } finally {
        setAssignedLoading(false);
      }
    };

    loadAssignment();
  }, []);

  return (
    <div className="flex bg-background-50 min-h-screen">
      <ClientSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'there'}</p>
          </div>
          {assignedAccountant && !assignedLoading && (
            <Card className="mb-8">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Your Assigned Accountant</p>
                  <h2 className="text-2xl font-bold text-primary-500">
                    {assignedAccountant.firstName} {assignedAccountant.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">{assignedAccountant.specialization || 'Tax Expert'}</p>
                  <p className="text-sm text-gray-600 mt-2">{assignedAccountant.email}</p>
                  <p className="text-sm text-gray-600">{assignedAccountant.phone}</p>
                </div>
                <div className="flex flex-col justify-between gap-3">
                  <div className="rounded-3xl bg-primary-50 border border-primary-100 p-4">
                    <p className="text-sm text-gray-500">Talk to your accountant</p>
                    <p className="mt-2 font-semibold text-primary-500">Assigned for your filings & documents</p>
                  </div>
                  <Button variant="accent" onClick={() => navigate('/dashboard/chat')}>
                    Chat with Accountant
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <FileText className="w-8 h-8 text-accent-500" />
                <Badge variant="success">+12%</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Filings Complete</p>
              <p className="text-3xl font-bold text-primary-500">12</p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <Calendar className="w-8 h-8 text-warning" />
                <Badge variant="warning">Due Soon</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Next Due Date</p>
              <p className="text-2xl font-bold text-primary-500">5 Days</p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <Upload className="w-8 h-8 text-primary-500" />
                <Badge>Pending</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Documents Pending</p>
              <p className="text-3xl font-bold text-primary-500">3</p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Compliance Score</p>
              <p className="text-3xl font-bold text-success">92%</p>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Filing Status */}
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-primary-500 mb-6">Filing Status Overview</h2>
              <div className="space-y-4">
                {[
                  { name: 'GST Filing', status: 'Filed', date: 'Apr 15, 2024' },
                  { name: 'TDS Return', status: 'Pending', date: 'Due: Apr 20, 2024' },
                  { name: 'Annual Audit', status: 'In Progress', date: 'May 31, 2024' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-primary-500">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <Badge variant={item.status === 'Filed' ? 'success' : item.status === 'Pending' ? 'warning' : 'default'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upload Button */}
            <Card className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-accent-50 to-accent-100">
              <Upload className="w-12 h-12 text-accent-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Upload Documents</h3>
              <p className="text-sm text-gray-600 mb-6">Upload your monthly invoices and receipts</p>
              <button className="btn-primary">
                Start Upload
              </button>
            </Card>
          </div>

          {/* Upcoming Deadlines & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Deadlines */}
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6 flex items-center gap-2">
                <Calendar size={24} />
                Upcoming Deadlines
              </h2>
              <div className="space-y-3">
                {upcomingDates.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-danger">
                    <div>
                      <p className="font-semibold text-primary-500">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <Badge variant="danger">{item.daysLeft}d</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-6">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold text-primary-500">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <Badge variant={activity.status === 'success' ? 'success' : 'default'}>
                      {activity.status === 'success' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;
