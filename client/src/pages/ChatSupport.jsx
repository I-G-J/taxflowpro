import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/UI';
import ClientSidebar from '../components/ClientSidebar';
import AccountantSidebar from '../components/AccountantSidebar';
import { Send, MessageSquare, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, assignmentAPI } from '../services/api';

const ChatSupport = () => {
  const { role, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await assignmentAPI.getAssignments('', 1, 100);
      setAssignments(response.data.assignments || []);
      if (response.data.assignments?.length > 0) {
        selectAssignment(response.data.assignments[0]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load assigned conversations.');
    } finally {
      setLoading(false);
    }
  };

  const selectAssignment = async (assignment) => {
    const assignmentId = assignment?._id || assignment?.id;
    if (!assignmentId) {
      setError('Selected assignment is missing an ID.');
      return;
    }

    setSelectedAssignment(assignment);
    setChatLoading(true);
    setError('');

    try {
      const response = await chatAPI.createOrGetChat(assignmentId);
      setChat(response.data);
      setMessages(response.data.messages || []);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err.message || 'Unable to open chat.');
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAssignment) return;
    if (!chat?._id) {
      setError('No active chat available. Please select an assignment again.');
      return;
    }

    try {
      setChatLoading(true);
      const response = await chatAPI.sendMessage(chat._id, newMessage);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setChatLoading(false);
    }
  };

  const otherUser = selectedAssignment
    ? role === 'accountant'
      ? selectedAssignment.clientId
      : selectedAssignment.accountantId
    : null;

  const SidebarComponent = role === 'accountant' ? AccountantSidebar : ClientSidebar;

  return (
    <div className="flex bg-background-50 min-h-screen">
      <SidebarComponent />

      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Chat with Assigned {role === 'accountant' ? 'Clients' : 'Accountants'}</h1>
              <p className="text-gray-600">Messages are limited to your assigned assignments only.</p>
            </div>
            <Button variant="accent" onClick={() => navigate(role === 'accountant' ? '/accountant' : '/dashboard')}>
              Back to Dashboard
            </Button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <Card className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Users size={20} className="text-primary-500" />
                <h2 className="font-semibold text-lg text-primary-500">Assigned Conversations</h2>
              </div>

              {loading ? (
                <p className="text-gray-600">Loading assignments…</p>
              ) : assignments.length === 0 ? (
                <p className="text-gray-600">No assigned clients yet. Please check back after admin assignment.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment, index) => (
                    <button
                      key={assignment._id || assignment.id || index}
                      type="button"
                      onClick={() => selectAssignment(assignment)}
                      className={`w-full text-left rounded-2xl border p-4 transition ${
                        selectedAssignment?._id === assignment._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-primary-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-primary-500">
                          {role === 'accountant'
                            ? (assignment.clientId?.businessName || 
                               `${assignment.clientId?.firstName || ''} ${assignment.clientId?.lastName || ''}`.trim() || 
                               'Unknown Client')
                            : `${assignment.accountantId?.firstName || ''} ${assignment.accountantId?.lastName || ''}`.trim()}
                        </span>
                        <Badge variant="warning">{assignment.status || 'assigned'}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{assignment.serviceType.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-600 mt-2">Deadline: {new Date(assignment.deadline).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="flex flex-col h-[calc(100vh-140px)]">
              <div className="border-b pb-4 mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Now chatting with</p>
                  <h2 className="text-xl font-semibold text-primary-500">
                    {selectedAssignment && (selectedAssignment.clientId || selectedAssignment.accountantId)
                      ? role === 'accountant'
                        ? (selectedAssignment.clientId?.businessName || 
                           `${selectedAssignment.clientId?.firstName || ''} ${selectedAssignment.clientId?.lastName || ''}`.trim())
                        : `${selectedAssignment.accountantId?.firstName || ''} ${selectedAssignment.accountantId?.lastName || ''}`.trim()
                      : 'Select an assignment'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedAssignment
                      ? role === 'accountant'
                        ? selectedAssignment.clientId?.email
                        : selectedAssignment.accountantId?.email
                      : 'No chat selected'}
                  </p>
                </div>
                <Badge variant="primary">{selectedAssignment ? selectedAssignment.serviceType.replace(/_/g, ' ') : 'Assignment'}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {chatLoading ? (
                  <p className="text-gray-600">Loading chat…</p>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-gray-600">
                    <p className="font-semibold">No messages yet.</p>
                    <p>Start the conversation by typing below.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const senderId = msg.senderId?._id || msg.senderId;
                    const currentUserId = user?._id;
                    const fromCurrentUser = currentUserId && senderId ? senderId.toString() === currentUserId.toString() : false;

                    return (
                      <div
                        key={index}
                        className={`flex ${fromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${fromCurrentUser ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                          <p className="text-sm mb-1">{msg.message}</p>
                          <div className="text-xs text-gray-400 text-right">
                            {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef}></div>
              </div>

              <div className="border-t pt-4 mt-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="input-field flex-1 py-3"
                    disabled={!selectedAssignment}
                  />
                  <Button onClick={handleSendMessage} disabled={!selectedAssignment || !newMessage.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatSupport;
