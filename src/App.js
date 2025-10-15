import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, Filter, X, FileText, Building2, MapPin, Tag, Plus, Edit2, Trash2, ExternalLink, Save, Upload, FileUp, RefreshCw, LogOut, LogIn } from 'lucide-react';

// Supabase configuration
const SUPABASE_URL = 'https://djxamnmqtcymejoquvav.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqeGFtbm1xdGN5bWVqb3F1dmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM3ODUsImV4cCI6MjA3NjA1OTc4NX0.2IVzXMKNMT91JYgCa_unnd7tZg7XETa_rI2ivgBp7p0';

// Simple Supabase client
const supabaseRequest = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.statusText}`);
  }

  return response.json();
};

const EngineeringStandardsApp = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('VIC');
  const [selectedAuthorities, setSelectedAuthorities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [showFilters, setShowFilters] = useState(true);
  const [viewingStandard, setViewingStandard] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [bulkImportText, setBulkImportText] = useState('');
  const [importPreview, setImportPreview] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authority: '',
    state: 'VIC',
    category: '',
    version: '',
    effectiveDate: '',
    status: 'Active',
    externalUrl: ''
  });

  // Check if user is logged in and load saved credentials
  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    // Load saved credentials if "remember me" was checked
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setLoginEmail(savedEmail);
      setLoginPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = () => {
    if (loginEmail === 'admin@snowdensurveys.com' && loginPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('savedEmail', loginEmail);
        localStorage.setItem('savedPassword', loginPassword);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }
      
      setShowLoginForm(false);
      setShowAdmin(true);
      alert('Login successful!');
    } else {
      alert('Invalid credentials. Use admin@snowdensurveys.com / admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAdmin(false);
    localStorage.removeItem('isAdminAuthenticated');
    if (!rememberMe) {
      setLoginEmail('');
      setLoginPassword('');
    }
    alert('Logged out successfully');
  };

  const loadStandards = async () => {
    try {
      setLoading(true);
      const data = await supabaseRequest('standards?select=*&order=created_at.desc');
      
      const formattedData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        authority: item.authority,
        state: item.state,
        category: item.category,
        version: item.version,
        effectiveDate: item.effective_date,
        status: item.status,
        externalUrl: item.external_url
      }));
      
      setStandards(formattedData);
    } catch (error) {
      console.error('Error loading standards:', error);
      alert('Error loading standards from database. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandards();
  }, []);

  const states = useMemo(() => {
    const stateSet = new Set(standards.map(s => s.state));
    return ['All', ...Array.from(stateSet).sort()];
  }, [standards]);

  const authorities = useMemo(() => {
    const authSet = new Set(standards.map(s => s.authority));
    return Array.from(authSet).sort();
  }, [standards]);

  const categories = useMemo(() => {
    const catSet = new Set(standards.map(s => s.category));
    return Array.from(catSet).sort();
  }, [standards]);

  const filteredStandards = useMemo(() => {
    return standards.filter(standard => {
      const matchesSearch = searchTerm === '' || 
        standard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        standard.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = selectedState === 'All' || 
        standard.state === selectedState || 
        standard.state === 'National';
      
      const matchesAuthority = selectedAuthorities.length === 0 || 
        selectedAuthorities.includes(standard.authority);
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(standard.category);
      
      const matchesStatus = selectedStatus === 'All' || 
        standard.status === selectedStatus;
      
      return matchesSearch && matchesState && matchesAuthority && matchesCategory && matchesStatus;
    });
  }, [standards, searchTerm, selectedState, selectedAuthorities, selectedCategories, selectedStatus]);

  const getStateBadgeColor = (state) => {
    const colors = {
      'VIC': 'bg-blue-900 text-blue-200',
      'NSW': 'bg-green-900 text-green-200',
      'QLD': 'bg-purple-900 text-purple-200',
      'National': 'bg-gray-700 text-gray-200'
    };
    return colors[state] || 'bg-gray-700 text-gray-200';
  };

  const handleAddStandard = async () => {
    try {
      const newStandard = {
        title: formData.title,
        description: formData.description,
        authority: formData.authority,
        state: formData.state,
        category: formData.category,
        version: formData.version,
        effective_date: formData.effectiveDate,
        status: formData.status,
        external_url: formData.externalUrl
      };

      await supabaseRequest('standards', {
        method: 'POST',
        body: JSON.stringify(newStandard)
      });

      await loadStandards();
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        authority: '',
        state: 'VIC',
        category: '',
        version: '',
        effectiveDate: '',
        status: 'Active',
        externalUrl: ''
      });
      alert('Standard added successfully!');
    } catch (error) {
      console.error('Error adding standard:', error);
      alert('Error adding standard. Please try again.');
    }
  };

  const handleUpdateStandard = async () => {
    try {
      const updatedStandard = {
        title: formData.title,
        description: formData.description,
        authority: formData.authority,
        state: formData.state,
        category: formData.category,
        version: formData.version,
        effective_date: formData.effectiveDate,
        status: formData.status,
        external_url: formData.externalUrl
      };

      await supabaseRequest(`standards?id=eq.${editingStandard.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedStandard)
      });

      await loadStandards();
      setShowAddForm(false);
      setEditingStandard(null);
      setFormData({
        title: '',
        description: '',
        authority: '',
        state: 'VIC',
        category: '',
        version: '',
        effectiveDate: '',
        status: 'Active',
        externalUrl: ''
      });
      alert('Standard updated successfully!');
    } catch (error) {
      console.error('Error updating standard:', error);
      alert('Error updating standard. Please try again.');
    }
  };

  const handleDeleteStandard = async (id) => {
    if (!window.confirm('Delete this standard?')) return;

    try {
      await supabaseRequest(`standards?id=eq.${id}`, {
        method: 'DELETE'
      });

      await loadStandards();
      alert('Standard deleted successfully!');
    } catch (error) {
      console.error('Error deleting standard:', error);
      alert('Error deleting standard. Please try again.');
    }
  };

  const parseBulkImport = () => {
    const lines = bulkImportText.trim().split('\n');
    const parsed = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('Title,')) continue;
      
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (parts.length >= 7) {
        const cleanPart = (str) => str.replace(/^["']|["']$/g, '').trim();
        
        parsed.push({
          title: cleanPart(parts[0]),
          description: cleanPart(parts[1]),
          authority: cleanPart(parts[2]),
          state: cleanPart(parts[3]),
          category: cleanPart(parts[4]),
          version: cleanPart(parts[5]),
          effectiveDate: cleanPart(parts[6]),
          status: parts[7] ? cleanPart(parts[7]) : 'Active',
          externalUrl: parts[8] ? cleanPart(parts[8]) : ''
        });
      }
    }
    
    setImportPreview(parsed);
  };

  const handleBulkImport = async () => {
    try {
      const newStandards = importPreview.map(item => ({
        title: item.title,
        description: item.description,
        authority: item.authority,
        state: item.state,
        category: item.category,
        version: item.version,
        effective_date: item.effectiveDate,
        status: item.status,
        external_url: item.externalUrl
      }));

      await supabaseRequest('standards', {
        method: 'POST',
        body: JSON.stringify(newStandards)
      });

      await loadStandards();
      setShowBulkImport(false);
      setBulkImportText('');
      setImportPreview([]);
      alert(`Successfully imported ${newStandards.length} standards!`);
    } catch (error) {
      console.error('Error importing standards:', error);
      alert('Error importing standards. Please try again.');
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBulkImportText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const exportToCSV = () => {
    const headers = 'Title,Description,Authority,State,Category,Version,EffectiveDate,Status,ExternalURL\n';
    const rows = standards.map(s => 
      `"${s.title}","${s.description}","${s.authority}","${s.state}","${s.category}","${s.version}","${s.effectiveDate}","${s.status}","${s.externalUrl}"`
    ).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'engineering-standards.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sampleCSVTemplate = `Title,Description,Authority,State,Category,Version,EffectiveDate,Status,ExternalURL
"VicRoads Section 732","Roadside furniture specs","VicRoads/DTP","VIC","Road Design","2023.1","2023-03-15","Active","https://yourcompany.sharepoint.com/..."`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading standards from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {showLoginForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Admin Login</h2>
              <button
                onClick={() => setShowLoginForm(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="admin@snowdensurveys.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter password"
                />
              </div>
              
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
              
              <p className="text-xs text-gray-400 text-center">
                Demo: admin@snowdensurveys.com / admin123
              </p>
            </div>
          </div>
        </div>
      )}

      {viewingStandard && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white truncate pr-4">
                {viewingStandard.title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(viewingStandard.externalUrl, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => setViewingStandard(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={viewingStandard.externalUrl}
                className="w-full h-full"
                title={viewingStandard.title}
              />
            </div>
          </div>
        </div>
      )}

      {showBulkImport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Bulk Import Standards</h2>
                <button
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkImportText('');
                    setImportPreview([]);
                  }}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-orange-900 bg-opacity-30 border border-orange-700 rounded-lg p-4">
                <h3 className="font-semibold text-orange-400 mb-2">📋 Import Instructions</h3>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Download the CSV template</li>
                  <li>Fill in your standards data</li>
                  <li>Upload the file or paste the data</li>
                  <li>Preview and import</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const blob = new Blob([sampleCSVTemplate], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'standards-template.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                
                <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer">
                  <FileUp className="w-4 h-4" />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paste CSV Data
                </label>
                <textarea
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                  className="w-full h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg font-mono text-sm text-white"
                  placeholder={sampleCSVTemplate}
                />
              </div>

              <button
                onClick={parseBulkImport}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Preview Import
              </button>

              {importPreview.length > 0 && (
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-750">
                  <h3 className="font-semibold text-white mb-3">
                    Preview: {importPreview.length} standards
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {importPreview.map((item, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-sm text-gray-400 mt-1">{item.description}</div>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>{item.authority}</span>
                          <span>{item.state}</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleBulkImport}
                    className="w-full mt-4 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                  >
                    Import {importPreview.length} Standards
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Snowden Surveys</h1>
                  <p className="text-xs text-gray-400">Engineering Standards Library</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded bg-green-900 text-green-300">
                ☁️ Cloud Synced
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadStandards}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowAdmin(!showAdmin)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showAdmin ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                    Admin
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search standards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {showAdmin && isAuthenticated && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setEditingStandard(null);
                  setFormData({
                    title: '',
                    description: '',
                    authority: '',
                    state: 'VIC',
                    category: '',
                    version: '',
                    effectiveDate: '',
                    status: 'Active',
                    externalUrl: ''
                  });
                  setShowAddForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Standard
              </button>
              
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Upload className="w-4 h-4" />
                Bulk Import
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}
        </div>
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <h2 className="text-2xl font-bold text-white">
                {editingStandard ? 'Edit Standard' : 'Add New Standard'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Authority</label>
                  <input
                    type="text"
                    value={formData.authority}
                    onChange={(e) => setFormData({...formData, authority: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="VIC">Victoria</option>
                    <option value="NSW">New South Wales</option>
                    <option value="QLD">Queensland</option>
                    <option value="National">National</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Superseded">Superseded</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  OneDrive/SharePoint URL
                </label>
                <input
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({...formData, externalUrl: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="https://yourcompany.sharepoint.com/..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end bg-gray-750">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editingStandard ? handleUpdateStandard : handleAddStandard}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Save className="w-4 h-4" />
                {editingStandard ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-gray-800 rounded-lg shadow-sm p-4 sticky top-24 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h2>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Status</h3>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Superseded">Superseded</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Authority</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {authorities.map(authority => (
                      <label key={authority} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAuthorities.includes(authority)}
                          onChange={() => {
                            if (selectedAuthorities.includes(authority)) {
                              setSelectedAuthorities(selectedAuthorities.filter(a => a !== authority));
                            } else {
                              setSelectedAuthorities([...selectedAuthorities, authority]);
                            }
                          }}
                          className="rounded border-gray-600 text-orange-600"
                        />
                        <span className="text-sm text-gray-300">{authority}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Category</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(category => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            } else {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                          className="rounded border-gray-600 text-orange-600"
                        />
                        <span className="text-sm text-gray-300">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          <main className="flex-1">
            <div className="mb-4">
              <p className="text-sm text-gray-400">
                Showing {filteredStandards.length} of {standards.length} standards
              </p>
            </div>

            {filteredStandards.length === 0 ? (
              <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-700">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No standards found</h3>
                <p className="text-gray-400 mb-4">
                  {standards.length === 0 
                    ? "Get started by adding your first standard!" 
                    : "Try adjusting your filters or search term"}
                </p>
                {showAdmin && standards.length === 0 && isAuthenticated && (
                  <button
                    onClick={() => setShowBulkImport(true)}
                    className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Import Standards
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStandards.map(standard => (
                  <div key={standard.id} className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700 hover:border-orange-600 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStateBadgeColor(standard.state)}`}>
                            {standard.state}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-orange-900 text-orange-300">
                            {standard.category}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-900 text-blue-300">
                            <ExternalLink className="w-3 h-3 inline mr-1" />
                            OneDrive
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {standard.title}
                        </h3>
                        
                        <p className="text-sm text-gray-400 mb-3">
                          {standard.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>{standard.authority}</span>
                          <span>v{standard.version}</span>
                          <span>{standard.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {showAdmin && isAuthenticated && (
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => {
                                setEditingStandard(standard);
                                setFormData({
                                  title: standard.title,
                                  description: standard.description,
                                  authority: standard.authority,
                                  state: standard.state,
                                  category: standard.category,
                                  version: standard.version,
                                  effectiveDate: standard.effectiveDate,
                                  status: standard.status,
                                  externalUrl: standard.externalUrl
                                });
                                setShowAddForm(true);
                              }}
                              className="p-2 bg-yellow-900 text-yellow-300 rounded-lg hover:bg-yellow-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStandard(standard.id)}
                              className="p-2 bg-red-900 text-red-300 rounded-lg hover:bg-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setViewingStandard(standard)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => window.open(standard.externalUrl, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                        >
                          <Download className="w-4 h-4" />
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EngineeringStandardsApp;