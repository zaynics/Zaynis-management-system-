/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Users, 
  GraduationCap, 
  LogOut, 
  Plus, 
  Trash2, 
  Search,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  auth, 
  login, 
  logout, 
  addStudent, 
  getStudents, 
  deleteStudent,
  addGrade,
  getGrades,
  deleteGrade
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- Components ---

const LoginScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full border border-[var(--ink)] p-8 bg-white shadow-[8px_8px_0px_var(--ink)]"
    >
      <div className="mb-8 text-center">
        <h1 className="font-serif italic text-4xl mb-2">School Admin</h1>
        <p className="text-sm opacity-60 uppercase tracking-widest">Secure Management System v1.0</p>
      </div>
      
      <button 
        onClick={login}
        className="w-full py-4 border border-[var(--ink)] flex items-center justify-center gap-3 hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors data-value"
      >
        <ShieldCheck className="w-5 h-5" />
        Login with Google
      </button>
      
      <div className="mt-8 text-[10px] uppercase opacity-40 leading-relaxed">
        This is a restricted area. All access is logged. 
        Unauthorized entry will be prosecuted under section 4.1.2 
        of the digital safety act.
      </div>
    </motion.div>
  </div>
);

const SidebarItem = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 border-b border-[var(--ink)] transition-colors data-value text-sm ${active ? 'bg-[var(--ink)] text-[var(--bg)]' : 'hover:bg-[rgba(20,20,20,0.05)]'}`}
  >
    <Icon className="w-5 h-5" />
    <span className="uppercase tracking-widest">{label}</span>
  </button>
);

const RegistrationView = () => {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentClass) return;
    setLoading(true);
    try {
      await addStudent(name, studentClass);
      setName('');
      setStudentClass('');
      alert('Student registered successfully.');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h2 className="font-serif italic text-3xl mb-8 border-b border-[var(--ink)] pb-4">New Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="col-header">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--ink)] py-2 focus:outline-none data-value text-xl placeholder:opacity-30"
            placeholder="ENTER FULL NAME"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="col-header">Class / Year</label>
          <input 
            type="text" 
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--ink)] py-2 focus:outline-none data-value text-xl placeholder:opacity-30"
            placeholder="YEAR 10 / B"
            required
          />
        </div>
        
        <button 
          disabled={loading}
          type="submit"
          className="px-8 py-4 bg-[var(--ink)] text-[var(--bg)] uppercase tracking-widest data-value text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Finalize Enrollment
        </button>
      </form>
    </div>
  );
};

const DirectoryView = ({ onGradeClick }: { onGradeClick: (id: string, name: string) => void }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    return getStudents(setStudents);
  }, []);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--ink)] flex items-center gap-4 bg-white/50">
        <Search className="w-5 h-5 opacity-40" />
        <input 
          type="text" 
          placeholder="SEARCH DIRECTORY..."
          className="flex-1 bg-transparent border-none focus:outline-none data-value uppercase tracking-widest text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[80px_1.5fr_1fr_120px] p-4 border-b border-[var(--ink)] bg-white/20">
          <div className="col-header">ID</div>
          <div className="col-header">Student Name</div>
          <div className="col-header">Class</div>
          <div className="col-header text-right">Actions</div>
        </div>
        
        {filtered.map((s, idx) => (
          <div key={s.id} className="data-row grid grid-cols-[80px_1.5fr_1fr_120px] p-4 items-center">
            <div className="data-value text-xs opacity-50">#{(idx + 1).toString().padStart(3, '0')}</div>
            <div className="font-bold uppercase tracking-tight">{s.name}</div>
            <div className="data-value">{s.class}</div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => onGradeClick(s.id, s.name)}
                className="hover:text-blue-500 transition-colors" 
                title="Grades"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { if(confirm('Delete student?')) deleteStudent(s.id) }} 
                className="hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="p-12 text-center opacity-30 data-value flex flex-col items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            NO RECORDS FOUND
          </div>
        )}
      </div>
    </div>
  );
};

const GradesView = ({ 
  initialStudentId, 
  initialStudentName,
  onStudentChange
}: { 
  initialStudentId: string | null, 
  initialStudentName: string | null,
  onStudentChange: (id: string, name: string) => void
}) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isPickingStudent, setIsPickingStudent] = useState(!initialStudentId);
  const [subject, setSubject] = useState('');
  const [mark, setMark] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return getStudents(setStudents);
  }, []);

  useEffect(() => {
    if (initialStudentId) {
      return getGrades(initialStudentId, setGrades);
    } else {
      setGrades([]);
    }
  }, [initialStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialStudentId || !subject || mark === '') return;
    setLoading(true);
    try {
      await addGrade(initialStudentId, subject, Number(mark));
      setSubject('');
      setMark('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const averageMark = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + g.mark, 0) / grades.length).toFixed(1) 
    : null;

  const handlePrint = () => {
    window.print();
  };

  if (isPickingStudent) {
    return (
      <div className="h-full flex flex-col p-8">
        <div className="mb-8">
          <h2 className="font-serif italic text-3xl">Select Student</h2>
          <p className="col-header opacity-50 mt-1">CHOOSE RECORD TO MANAGE GRADES</p>
        </div>
        
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            type="text" 
            placeholder="FILTER BY NAME OR CLASS..."
            className="w-full bg-white border border-[var(--ink)] p-4 pl-12 focus:outline-none data-value uppercase tracking-widest text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto border border-[var(--ink)] bg-white/20">
          {filteredStudents.map(s => (
            <button 
              key={s.id}
              onClick={() => {
                onStudentChange(s.id, s.name);
                setIsPickingStudent(false);
              }}
              className="w-full data-row grid grid-cols-[1fr_auto] p-4 text-left items-center group"
            >
              <div>
                <div className="font-bold uppercase tracking-tight">{s.name}</div>
                <div className="data-value text-xs opacity-50">{s.class}</div>
              </div>
              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="p-12 text-center opacity-30 data-value">NO STUDENTS FOUND</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row print:bg-white print:text-black">
      <div className="flex-1 p-8 overflow-auto border-r border-[var(--ink)] print:border-none">
        <div className="flex justify-between items-start mb-8 border-b border-[var(--ink)] pb-6">
          <div>
            <button 
              onClick={() => setIsPickingStudent(true)}
              className="col-header opacity-50 hover:opacity-100 transition-opacity mb-2 flex items-center gap-2 print:hidden"
            >
              ← SWITCH STUDENT
            </button>
            <h2 className="font-serif italic text-4xl">{initialStudentName}</h2>
            <p className="col-header mt-1">OFFICIAL ACADEMIC TRANSCRIPT</p>
          </div>

          <div className="text-right">
            {averageMark && (
              <div className="p-4 border border-[var(--ink)] bg-white shadow-[4px_4px_0px_var(--ink)]">
                <div className="col-header text-[10px]">AVG SCORE</div>
                <div className="data-value text-3xl font-bold">{averageMark}%</div>
              </div>
            )}
            <button 
              onClick={handlePrint}
              className="mt-4 text-[10px] uppercase font-bold tracking-widest border-b border-[var(--ink)] print:hidden"
            >
              Print Report Card
            </button>
          </div>
        </div>

        {/* Report Layout */}
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_100px_60px] border-b border-[var(--ink)] pb-2">
            <div className="col-header">Subject / Educational Unit</div>
            <div className="col-header">Grade</div>
            <div className="col-header text-right print:hidden">Del</div>
          </div>
          
          {grades.map(g => (
            <div key={g.id} className="data-row grid grid-cols-[1fr_100px_60px] py-4 items-center">
              <div className="uppercase font-bold tracking-tighter text-lg">{g.subject}</div>
              <div className="data-value text-2xl font-bold">{g.mark}<span className="text-sm opacity-40 ml-1">%</span></div>
              <div className="flex justify-end print:hidden">
                <button 
                  onClick={() => { if(confirm('Delete grade?')) deleteGrade(g.id) }}
                  className="hover:text-red-500 opacity-40 hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {grades.length === 0 && (
            <div className="py-20 text-center opacity-30 data-value text-xl">
              NO ACADEMIC DATA AVAILABLE
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--ink)] border-dashed hidden print:block">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="col-header mb-4 italic text-sm">Seal of Registrar</div>
              <div className="h-24 border border-[var(--ink)] border-dashed opacity-20"></div>
            </div>
            <div className="text-right">
              <p className="data-value text-[10px]">VERIFIED: {new Date().toLocaleDateString()}</p>
              <p className="font-serif italic mt-8 underline decoration-double">System Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Panel */}
      <div className="w-full md:w-80 p-8 bg-white/30 backdrop-blur-sm print:hidden">
        <h3 className="col-header mb-8 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Grade Entry
        </h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold opacity-40">Subject Name</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--ink)] pb-2 focus:outline-none data-value text-lg uppercase"
              required
              placeholder="e.g. Physics"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold opacity-40">Final Mark (0-100)</label>
            <div className="flex items-end gap-2">
              <input 
                type="number" 
                min="0" 
                max="100"
                value={mark}
                onChange={(e) => setMark(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-transparent border-b border-[var(--ink)] pb-2 focus:outline-none data-value text-4xl font-bold"
                required
                placeholder="00"
              />
              <span className="data-value text-2xl opacity-40 mb-2">%</span>
            </div>
          </div>
          <button 
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-[var(--ink)] text-[var(--bg)] uppercase tracking-widest data-value text-xs font-bold flex items-center justify-center gap-3 hover:shadow-[4px_4px_0px_rgba(20,20,20,0.3)] transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Commit to Record'}
          </button>
        </form>

        <div className="mt-12 p-4 border border-[var(--ink)] border-dashed">
          <h4 className="text-[10px] font-bold uppercase mb-2">Instructions</h4>
          <p className="text-[10px] leading-relaxed opacity-60">
            Ensure marks are verified matching departmental guidelines. 
            Once recorded, deletions are audited by the system.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'reg' | 'dir' | 'grades'>('dir');
  const [selectedStudent, setSelectedStudent] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin opacity-20" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleGradeClick = (id: string, name: string) => {
    setSelectedStudent({ id, name });
    setActiveTab('grades');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[var(--ink)] flex flex-col bg-white/40">
        <div className="p-6 border-b border-[var(--ink)]">
          <h1 className="font-serif italic text-2xl">Admin</h1>
          <p className="text-[10px] uppercase opacity-40 tracking-widest">{user.email}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <SidebarItem 
            active={activeTab === 'dir'} 
            icon={Users} 
            label="Directory" 
            onClick={() => setActiveTab('dir')} 
          />
          <SidebarItem 
            active={activeTab === 'reg'} 
            icon={UserPlus} 
            label="Enrolment" 
            onClick={() => setActiveTab('reg')} 
          />
          <SidebarItem 
            active={activeTab === 'grades'} 
            icon={GraduationCap} 
            label="Grades" 
            onClick={() => {
              setActiveTab('grades');
              setSelectedStudent(null);
            }} 
          />
        </nav>
        
        <button 
          onClick={logout}
          className="p-6 border-t border-[var(--ink)] flex items-center gap-3 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest data-value text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedStudent?.id || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            {activeTab === 'dir' && <DirectoryView onGradeClick={handleGradeClick} />}
            {activeTab === 'reg' && <RegistrationView />}
            {activeTab === 'grades' && (
              <GradesView 
                initialStudentId={selectedStudent?.id || null} 
                initialStudentName={selectedStudent?.name || null} 
                onStudentChange={(id, name) => setSelectedStudent({ id, name })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
