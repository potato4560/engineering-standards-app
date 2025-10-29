import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, Filter, X, FileText, Building2, MapPin, Tag, Plus, Edit2, Trash2, ExternalLink, Save, Upload, FileUp, RefreshCw, LogOut, LogIn, BookOpen, Code, Users } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState('standards'); // 'standards', 'macros', or 'meetings'
  const [standards, setStandards] = useState([]);
  const [macros, setMacros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [macroSearchTerm, setMacroSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('VIC');
  const [selectedAuthorities, setSelectedAuthorities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [selectedMacroStatus, setSelectedMacroStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(true);
  const [viewingStandard, setViewingStandard] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddMacroForm, setShowAddMacroForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [editingMacro, setEditingMacro] = useState(null);
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

  const [macroFormData, setMacroFormData] = useState({
    name: '',
    fileName: '',
    description: '',
    status: 'documented',
    videoUrl: ''
  });

  // Meeting form state
  const [meetingFormData, setMeetingFormData] = useState({
    date: '',
    participant: '',
    metricsAnalysis: '',
    wins: '',
    blockers: '',
    recognition: '',
    boneCompletion: '',
    boneEfficiency: '',
    designCompletion: '',
    designEfficiency: '',
    overallKPIs: '',
    whatsWorking: '',
    outcomeDiscuss: '',
    metricToMove: '',
    currentMeasure: '',
    targetNumbers: '',
    agreement: '',
    capacity: '',
    support: '',
    managerPerformance: '',
    managerLiked: '',
    managerImprovement: '',
    reportPerformance: '',
    reportLiked: '',
    reportImprovement: '',
    oneMetric: '',
    actionItems: ''
  });

  const [savedMeetings, setSavedMeetings] = useState([]);
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);
  const [showSavedMeetings, setShowSavedMeetings] = useState(false);
  const [viewingMeeting, setViewingMeeting] = useState(null);

  // Meeting form state for the new UI
  const [meetingForm, setMeetingForm] = useState({
    employeeName: 'Design Team Member',
    managerName: 'Engineering Manager',
    meetingDate: '2025-10-30',
    nextMeetingDate: '2025-11-06',
    performanceRating: 'Exceeds Expectations',
    achievements: `Strong performance across all metrics in October:
• Design Projects: Achieved 100% of goals (3/3 active projects maintained)
• Task Completion: 94.68% completion rate (89 of 94 tasks completed)
• Bone Projects: Delivered 18 active projects with 78.95% completion rate
• Efficiency: Significantly under estimated hours (162 actual vs 206 estimated for design, 59 vs 119 for bones)`,
    goalsProgress: `October 2025 Performance Summary:
Design Jobs:
- Active Projects: 3/3 (100% of target)
- Tasks Created: 94 total
- Tasks Completed: 89 (94.68% completion)
- Hours: 162 actual vs 206 estimated (21% under budget)

Bone Jobs:
- Active Projects: 18 delivered
- Total Bones: 38 created, 30 finished
- Completion Rate: 78.95%
- Hours: 59 actual vs 119 estimated (50% efficiency gain)`,
    newGoals: `November 2025 Goals:
• Maintain 100% project delivery rate for design jobs
• Improve bone job completion rate from 78.95% to 85%
• Continue efficient hour management (stay within estimated hours)
• Target 3-4 active design projects for November
• Focus on completing remaining 8 bone projects from current pipeline`,
    challenges: `Current Challenges:
• Bone job completion rate at 78.95% - need to identify bottlenecks
• 8 bone projects still in progress from October pipeline
• Balancing design task completion with bone project delivery
• Resource allocation between design (94.68% completion) and bone work`,
    supportNeeded: `Support Requirements:
• Review bone project workflow to improve completion rate
• Additional resources or process optimization for bone jobs
• Clarification on priority between design tasks vs bone projects
• Training on time estimation accuracy (currently performing well under estimates)`,
    trainingNeeds: `Development Opportunities:
• Project management techniques for bone job workflow
• Advanced design task prioritization methods
• Cross-training to improve versatility between design and bone work
• Efficiency optimization workshops`,
    employeeFeedback: `Very satisfied with design project performance - consistently meeting targets and staying under hour estimates. 

Concerned about bone job completion rate (78.95%) - would like support to identify what's causing delays in finishing projects. 

Happy with current workload balance and appreciate the consistent project flow.`,
    managerFeedback: `Excellent performance overall. The efficiency gains are remarkable - 21% under estimate on design hours and 50% under on bone hours while maintaining quality.

The 100% achievement on design goals is outstanding. Need to address the bone job completion rate - let's identify if it's process, resource, or prioritization related.

Strong contributor who consistently delivers results.`,
    communicationPreferences: 'Weekly check-ins, immediate escalation for blockers, monthly metrics review',
    employeeActions: `1. Analyze bone job workflow to identify completion bottlenecks
2. Create process improvement plan for remaining 8 bone projects
3. Document successful design job practices for team sharing
4. Set weekly bone completion targets for November`,
    managerActions: `1. Review bone job resource allocation and dependencies
2. Investigate process improvements for bone project workflow
3. Provide additional support/training for bone job completion
4. Schedule mid-month check-in on November goal progress`,
    additionalNotes: `High performer with excellent efficiency metrics. Focus area for improvement is bone job completion rate while maintaining current design excellence.

October Metrics Summary:
- Design: 100% goal achievement, 94.68% task completion
- Bone: 78.95% completion rate, excellent hour efficiency
- Overall: Strong contributor exceeding hour efficiency expectations`
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

  const loadMacros = async () => {
    try {
      const data = await supabaseRequest('macros?select=*&order=created_at.desc');
      
      const formattedData = data.map(item => ({
        id: item.id,
        name: item.name,
        fileName: item.file_name,
        description: item.description,
        status: item.status,
        videoUrl: item.video_url
      }));
      
      setMacros(formattedData);
    } catch (error) {
      console.error('Error loading macros:', error);
      // If table doesn't exist yet, initialize with default data
      setMacros([]);
    }
  };

  useEffect(() => {
    loadStandards();
    loadMacros();
    loadSavedMeetings();
    
    // Initialize meeting form with today's date
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    setMeetingFormData(prev => ({
      ...prev,
      date: today.toLocaleDateString('en-US', options)
    }));
  }, []);

  const loadSavedMeetings = () => {
    const meetings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('meeting_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          meetings.push({
            id: key,
            ...data,
            savedAt: new Date(data.savedAt || Date.now())
          });
        } catch (error) {
          console.error('Error loading meeting:', key, error);
        }
      }
    }
    meetings.sort((a, b) => b.savedAt - a.savedAt);
    setSavedMeetings(meetings);
  };

  const saveMeetingForm = () => {
    if (!meetingForm.employeeName.trim()) {
      alert('Please enter an employee name before saving.');
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().split('T')[0] + '_' + now.getTime();
    const storageKey = `meeting_${meetingForm.employeeName.replace(/\s+/g, '_')}_${timestamp}`;
    
    const meetingData = {
      ...meetingForm,
      savedAt: now.toISOString(),
      id: storageKey
    };
    
    localStorage.setItem(storageKey, JSON.stringify(meetingData));
    loadSavedMeetings();
    
    alert(`✅ Meeting notes saved for ${meetingForm.employeeName}!\n\nView saved meetings using the "View Saved Forms" button.`);
  };

  const deleteMeeting = (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting record?')) {
      localStorage.removeItem(meetingId);
      loadSavedMeetings();
      if (viewingMeeting && viewingMeeting.id === meetingId) {
        setViewingMeeting(null);
      }
    }
  };

  const clearMeetingForm = () => {
    if (window.confirm('Are you sure you want to clear the current form?')) {
      const today = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      setMeetingFormData({
        date: today.toLocaleDateString('en-US', options),
        participant: '',
        metricsAnalysis: '',
        wins: '',
        blockers: '',
        recognition: '',
        boneCompletion: '',
        boneEfficiency: '',
        designCompletion: '',
        designEfficiency: '',
        overallKPIs: '',
        whatsWorking: '',
        outcomeDiscuss: '',
        metricToMove: '',
        currentMeasure: '',
        targetNumbers: '',
        agreement: '',
        capacity: '',
        support: '',
        managerPerformance: '',
        managerLiked: '',
        managerImprovement: '',
        reportPerformance: '',
        reportLiked: '',
        reportImprovement: '',
        oneMetric: '',
        actionItems: ''
      });
    }
  };

  const loadMeetingForm = (meeting) => {
    setMeetingFormData(meeting);
    setViewingMeeting(null);
    setShowMeetingHistory(false);
  };

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

  const filteredMacros = useMemo(() => {
    return macros.filter(macro => {
      const matchesSearch = macroSearchTerm === '' || 
        macro.name.toLowerCase().includes(macroSearchTerm.toLowerCase()) ||
        macro.description.toLowerCase().includes(macroSearchTerm.toLowerCase()) ||
        macro.fileName.toLowerCase().includes(macroSearchTerm.toLowerCase());
      
      const matchesStatus = selectedMacroStatus === 'All' || 
        macro.status === selectedMacroStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [macros, macroSearchTerm, selectedMacroStatus]);

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

  // Macro management functions
  const handleAddMacro = async () => {
    try {
      const newMacro = {
        name: macroFormData.name,
        file_name: macroFormData.fileName,
        description: macroFormData.description,
        status: macroFormData.status,
        video_url: macroFormData.videoUrl || null
      };

      await supabaseRequest('macros', {
        method: 'POST',
        body: JSON.stringify(newMacro)
      });

      await loadMacros();
      setShowAddMacroForm(false);
      setMacroFormData({
        name: '',
        fileName: '',
        description: '',
        status: 'documented',
        videoUrl: ''
      });
      alert('Macro added successfully!');
    } catch (error) {
      console.error('Error adding macro:', error);
      alert('Error adding macro. Please try again.');
    }
  };

  const handleUpdateMacro = async () => {
    try {
      const updatedMacro = {
        name: macroFormData.name,
        file_name: macroFormData.fileName,
        description: macroFormData.description,
        status: macroFormData.status,
        video_url: macroFormData.videoUrl || null
      };

      await supabaseRequest(`macros?id=eq.${editingMacro.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedMacro)
      });

      await loadMacros();
      setShowAddMacroForm(false);
      setEditingMacro(null);
      setMacroFormData({
        name: '',
        fileName: '',
        description: '',
        status: 'documented',
        videoUrl: ''
      });
      alert('Macro updated successfully!');
    } catch (error) {
      console.error('Error updating macro:', error);
      alert('Error updating macro. Please try again.');
    }
  };

  const handleDeleteMacro = async (id) => {
    if (!window.confirm('Delete this macro?')) return;

    try {
      await supabaseRequest(`macros?id=eq.${id}`, {
        method: 'DELETE'
      });

      await loadMacros();
      alert('Macro deleted successfully!');
    } catch (error) {
      console.error('Error deleting macro:', error);
      alert('Error deleting macro. Please try again.');
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
              
              {/* Navigation Tabs */}
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentPage('standards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'standards' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Standards
                </button>
                <button
                  onClick={() => setCurrentPage('macros')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'macros' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Macros
                </button>
                <button
                  onClick={() => setCurrentPage('meetings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'meetings' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Meetings
                </button>
              </nav>

              <span className="px-2 py-1 text-xs font-medium rounded bg-green-900 text-green-300">
                ☁️ Cloud Synced
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={currentPage === 'standards' ? loadStandards : loadMacros}
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
              
              {currentPage === 'standards' && (
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
              )}
            </div>
          </div>
          
          {currentPage === 'standards' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search macros..."
                      value={macroSearchTerm}
                      onChange={(e) => setMacroSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedMacroStatus}
                  onChange={(e) => setSelectedMacroStatus(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="All">All Status</option>
                  <option value="documented">Documented</option>
                  <option value="pending">Not Working</option>
                </select>
              </div>

              {showAdmin && isAuthenticated && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setEditingMacro(null);
                      setMacroFormData({
                        name: '',
                        fileName: '',
                        description: '',
                        status: 'documented',
                        videoUrl: ''
                      });
                      setShowAddMacroForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Macro
                  </button>
                </div>
              )}
            </>
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

      {currentPage === 'standards' && (
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
      )}

      {currentPage === 'macros' && (
        /* Macros Page */
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">12d Model Macros Documentation</h2>
            <p className="text-gray-400">Comprehensive guide to available 12d Model macros and tools</p>
          </div>

          {macros.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Table of Contents</h3>
              <div className="grid grid-cols-2 gap-3">
                {macros.map(macro => (
                  <a
                    key={macro.id}
                    href={`#macro-${macro.id}`}
                    className="text-orange-400 hover:text-orange-300 hover:underline transition-colors"
                  >
                    {macro.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Showing {filteredMacros.length} of {macros.length} macros
            </p>
          </div>

          {filteredMacros.length === 0 ? (
            <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-700">
              <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No macros found</h3>
              <p className="text-gray-400 mb-4">
                {macros.length === 0 
                  ? "Get started by adding your first macro!" 
                  : "Try adjusting your search term or filters"}
              </p>
              {showAdmin && macros.length === 0 && isAuthenticated && (
                <button
                  onClick={() => {
                    setEditingMacro(null);
                    setMacroFormData({
                      name: '',
                      fileName: '',
                      description: '',
                      status: 'documented',
                      videoUrl: ''
                    });
                    setShowAddMacroForm(true);
                  }}
                  className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Add First Macro
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMacros.map(macro => (
                <div
                  key={macro.id}
                  id={`macro-${macro.id}`}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-white mb-2">{macro.name}</h3>
                      <p className="text-sm text-gray-400 font-mono">{macro.fileName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        macro.status === 'documented' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-orange-900 text-orange-300'
                      }`}>
                        {macro.status === 'documented' ? 'Documented' : 'Not Working'}
                      </span>
                      
                      {showAdmin && isAuthenticated && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMacro(macro);
                              setMacroFormData({
                                name: macro.name,
                                fileName: macro.fileName,
                                description: macro.description,
                                status: macro.status,
                                videoUrl: macro.videoUrl || ''
                              });
                              setShowAddMacroForm(true);
                            }}
                            className="p-2 bg-yellow-900 text-yellow-300 rounded-lg hover:bg-yellow-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMacro(macro.id)}
                            className="p-2 bg-red-900 text-red-300 rounded-lg hover:bg-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed">
                    <strong className="text-white">Description:</strong> {macro.description}
                  </p>

                  {macro.videoUrl ? (
                    <a
                      href={macro.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                      Watch Video Tutorial
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4" />
                      Video Tutorial (Coming Soon)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentPage === 'meetings' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">One-on-One Meeting</h2>
              <div className="text-sm text-gray-400">Recognition → Elevation | You run this meeting</div>
            </div>
            
            {/* Meeting Details Section */}
            <div className="border-l-4 border-blue-500 pl-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 rounded-full p-1">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-blue-400">Meeting Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date:</label>
                  <input
                    type="date"
                    value={meetingForm.meetingDate}
                    onChange={(e) => setMeetingForm({...meetingForm, meetingDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Participant:</label>
                  <input
                    type="text"
                    value={meetingForm.employeeName}
                    onChange={(e) => setMeetingForm({...meetingForm, employeeName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="Team member name"
                  />
                </div>
              </div>
            </div>

            {/* Prepare YOUR List Section */}
            <div className="border-l-4 border-blue-500 pl-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 rounded-full p-1 text-white font-bold text-sm flex items-center justify-center w-6 h-6">1</div>
                <h3 className="text-xl font-semibold text-blue-400">Prepare YOUR List</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4 italic">You run this meeting. Bring your key metrics, wins, and blockers. Show me your dashboard — numbers tell the story.</p>
              
              {/* Metrics Dashboard */}
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="text-2xl">📊</div>
                  <h4 className="text-lg font-semibold text-white">Your Metrics Dashboard</h4>
                </div>
                
                {/* Bone Jobs Metrics */}
                <div className="mb-8">
                  <h5 className="text-blue-400 font-semibold mb-4 text-lg">Bone Jobs</h5>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Active Projects</div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">18</div>
                      <div className="text-xs text-green-400">October Actuals</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Total Bones</div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">38</div>
                      <div className="text-xs text-green-400">October Actuals</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Bones Finished</div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">30</div>
                      <div className="text-xs text-green-400">October Actuals</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Completion %</div>
                      <div className="text-3xl font-bold text-orange-400 mb-1">78.95%</div>
                      <div className="text-xs text-red-400">vs 100% goal</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Estimated Hours</div>
                      <div className="text-2xl font-bold text-blue-400">118</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Actual Hours</div>
                      <div className="text-2xl font-bold text-blue-400">59</div>
                    </div>
                  </div>
                </div>

                {/* Design Jobs Metrics */}
                <div>
                  <h5 className="text-blue-400 font-semibold mb-4 text-lg">Design Jobs</h5>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Active Projects</div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">3</div>
                      <div className="text-xs text-green-400">October Actuals</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Tasks Created</div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">94</div>
                      <div className="text-xs text-green-400">October Actuals</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Tasks Completed</div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">89</div>
                      <div className="text-xs text-green-400">October Actuals</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Completion %</div>
                      <div className="text-3xl font-bold text-green-400 mb-1">94.68%</div>
                      <div className="text-xs text-green-400">Strong performance</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Estimated Hours</div>
                      <div className="text-2xl font-bold text-blue-400">206</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">Actual Hours</div>
                      <div className="text-2xl font-bold text-blue-400">162</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Analysis of the Numbers:</label>
                <textarea
                  value={`Clear Tale of Two Workflows:

DESIGN JOBS - Excellence Zone (94.68% completion)
• Nearly perfect task completion with 89 of 94 tasks done

BONE JOBS COMPLETION GAP (21% below target)
• 8 incomplete bones preventing us from hitting 100% goal
• Root cause unknown - need to identify if it's capacity, dependencies, scope creep, or process breakdown`}
                  onChange={(e) => setMeetingForm({...meetingForm, achievements: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Wins:</label>
                <textarea
                  value={`🎯 DESIGN WORKFLOW MASTERY
• 94.68% completion rate is exceptional - nearly flawless execution
• Task management system is clearly working (89/94 completed)
• Hour tracking shows we're efficient without cutting corners`}
                  onChange={(e) => setMeetingForm({...meetingForm, goalsProgress: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Blockers:</label>
                <textarea
                  value={`🚧 BONE JOBS COMPLETION GAP (21% below target)
• 8 incomplete bones preventing us from hitting 100% goal
• Root cause unknown - need to identify if it's capacity, dependencies, scope creep, or process breakdown`}
                  onChange={(e) => setMeetingForm({...meetingForm, challenges: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>

            {/* Start with Wins Section */}
            <div className="border-l-4 border-blue-500 pl-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 rounded-full p-1 text-white font-bold text-sm flex items-center justify-center w-6 h-6">2</div>
                <h3 className="text-xl font-semibold text-blue-400">Start with Wins</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4 italic">Recognition → Elevation. What's working? Where did you move the needle? We start with momentum.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recognition & Wins:</label>
                <textarea
                  value={`🏆 EXCEPTIONAL DESIGN PERFORMANCE
Your Design workflow is operating at an elite level - 94.68% completion rate is outstanding. This isn't luck, this is systems, discipline, and skill. You're managing 94 tasks across 3 projects and completing nearly everything you touch. This is the standard.`}
                  onChange={(e) => setMeetingForm({...meetingForm, employeeFeedback: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>

            {/* Check the Metrics Section */}
            <div className="border-l-4 border-blue-500 pl-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 rounded-full p-1 text-white font-bold text-sm flex items-center justify-center w-6 h-6">3</div>
                <h3 className="text-xl font-semibold text-blue-400">Check the Metrics</h3>
              </div>
              
              {/* Bone Jobs Performance */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="text-white font-semibold">Bone Jobs Performance</h4>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Bone Completion Rate: 78.95% vs 100% Goal</div>
                  <textarea
                    value={`30 bones finished out of 38 total = 8 bones incomplete. This is a 21-point gap from our 100% goal.`}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300 mb-2">Hour Efficiency: 59 actual vs 118 estimated</div>
                  <textarea
                    value={`This 50% efficiency rate is a red flag - but which direction?

SCENARIO A: We're not tracking all our time → Actual work is higher than 59 hours
SCENARIO B: Our estimates are massively inflated → We need better scoping`}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    rows={4}
                  />
                </div>
              </div>

              {/* Design Jobs Performance */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="text-white font-semibold">Design Jobs Performance</h4>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Design Task Completion: 94.68% - Strong! ✅</div>
                  <textarea
                    value={`89 out of 94 tasks completed - this is elite execution. Only 5 tasks remain outstanding.

This completion rate should be our benchmark across all work streams.`}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300 mb-2">Design Hours: 162 actual vs 206 estimated</div>
                  <textarea
                    value={`Running at 79% of estimated hours - this is the sweet spot. We're:
✅ Delivering on commitments
✅ Not burning through budgets`}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    rows={3}
                  />
                </div>
              </div>

              {/* Overall Assessment */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-300 mb-2">Overall: Are we hitting our goals?</div>
                <textarea
                  value={`MIXED RESULTS:
✅ Design: EXCEEDING expectations at 94.68% - this is A+ work
⚠️ Bones: BELOW target at 78.95% - need to close 21-point gap`}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows={3}
                />
              </div>

              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">What's working / what's not?</div>
                <textarea
                  value={`✅ WHAT'S WORKING:
• Design task management system - nearly perfect execution
• Design estimation process - healthy 79% efficiency ratio
• Overall volume management - 21 active projects is ambitious and you're handling it`}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows={4}
                />
              </div>
            </div>

            {/* Goals & OKR Review Section */}
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">📊</div>
                <h4 className="text-lg font-semibold text-blue-400">Goals & OKR Review</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4">This is an opportunity to review progress, discuss how your direct report is doing, and explore ways to support their success moving forward.</p>
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Key Questions: Why is Design outperforming Bones? What blockers exist in Bone Jobs? How can we replicate Design success?</div>
                <textarea
                  value={meetingForm.additionalNotes}
                  onChange={(e) => setMeetingForm({...meetingForm, additionalNotes: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows={3}
                  placeholder="Discussion notes and action items..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-600">
              <button
                onClick={saveMeetingForm}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Save className="w-5 h-5" />
                Save Meeting Form
              </button>
              <button
                onClick={() => {
                  const savedMeetings = Object.keys(localStorage).filter(key => key.startsWith('meeting_'));
                  if (savedMeetings.length > 0) {
                    setShowSavedMeetings(true);
                  } else {
                    alert('No saved meetings found.');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Eye className="w-5 h-5" />
                View Saved Forms
              </button>
              <button
                onClick={() => {
                  setMeetingForm({
                    employeeName: 'Design Team Member',
                    managerName: 'Engineering Manager',
                    meetingDate: '2025-10-30',
                    nextMeetingDate: '2025-11-06',
                    performanceRating: 'Exceeds Expectations',
                    achievements: '',
                    goalsProgress: '',
                    newGoals: '',
                    challenges: '',
                    supportNeeded: '',
                    trainingNeeds: '',
                    employeeFeedback: '',
                    managerFeedback: '',
                    communicationPreferences: '',
                    employeeActions: '',
                    managerActions: '',
                    additionalNotes: ''
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Meetings Modal */}
      {showSavedMeetings && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Saved Meeting Forms</h2>
                <button
                  onClick={() => setShowSavedMeetings(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {savedMeetings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No saved meeting forms found.</p>
              ) : (
                <div className="space-y-4">
                  {savedMeetings.map((meeting, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {meeting.employeeName} - {meeting.managerName}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setMeetingForm(meeting);
                              setShowSavedMeetings(false);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                            Load
                          </button>
                          <button
                            onClick={() => deleteMeeting(index)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p><strong>Meeting Date:</strong> {meeting.meetingDate}</p>
                        <p><strong>Performance Rating:</strong> {meeting.performanceRating}</p>
                        <p><strong>Saved:</strong> {new Date(meeting.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Macro Add/Edit Form Modal */}
      {showAddMacroForm && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingMacro ? 'Edit Macro' : 'Add New Macro'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddMacroForm(false);
                    setEditingMacro(null);
                  }}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Macro Name</label>
                <input
                  type="text"
                  value={macroFormData.name}
                  onChange={(e) => setMacroFormData({...macroFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Attribute Label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">File Name</label>
                <input
                  type="text"
                  value={macroFormData.fileName}
                  onChange={(e) => setMacroFormData({...macroFormData, fileName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono"
                  placeholder="e.g., Attribute_Label.4do"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={macroFormData.description}
                  onChange={(e) => setMacroFormData({...macroFormData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows="4"
                  placeholder="Describe what this macro does and how to use it..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={macroFormData.status}
                  onChange={(e) => setMacroFormData({...macroFormData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="documented">Documented</option>
                  <option value="pending">Not Working</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Video Tutorial URL (Optional)
                </label>
                <input
                  type="url"
                  value={macroFormData.videoUrl}
                  onChange={(e) => setMacroFormData({...macroFormData, videoUrl: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end bg-gray-750">
              <button
                onClick={() => {
                  setShowAddMacroForm(false);
                  setEditingMacro(null);
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editingMacro ? handleUpdateMacro : handleAddMacro}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Save className="w-4 h-4" />
                {editingMacro ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineeringStandardsApp;