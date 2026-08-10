import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FiLogOut, FiBook, FiUsers, FiCheckSquare,
  FiBarChart2, FiBookOpen, FiClock, FiMenu, FiX
} from 'react-icons/fi';

interface Props {
  children: ReactNode;
  role: 'petugas' | 'pengguna';
  title: string;
  subtitle?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface NavItem { id: string; label: string; icon: ReactNode; }

const petugasNav: NavItem[] = [
  { id: 'buku',        label: 'Manajemen Buku',   icon: <FiBook size={18} /> },
  { id: 'anggota',     label: 'Data Anggota',      icon: <FiUsers size={18} /> },
  { id: 'pengembalian',label: 'Pengembalian',       icon: <FiCheckSquare size={18} /> },
  { id: 'laporan',     label: 'Laporan',            icon: <FiBarChart2 size={18} /> },
];
const penggunaNav: NavItem[] = [
  { id: 'katalog',  label: 'Katalog Buku',   icon: <FiBookOpen size={18} /> },
  { id: 'dipinjam', label: 'Riwayat Pinjam', icon: <FiClock size={18} /> },
];

export default function DashboardLayout({ children, role, title, subtitle, activeTab, onTabChange }: Props) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const nav = role === 'petugas' ? petugasNav : penggunaNav;

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari sesi?',
      text: 'Anda akan diarahkan ke halaman login.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#44A1A4',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span style="color:#374151">Batal</span>',
      confirmButtonText: 'Ya, Keluar',
      reverseButtons: true,
    }).then(r => {
      if (r.isConfirmed) {
        localStorage.removeItem('user');
        navigate('/');
      }
    });
  };

  const Sidebar = () => (
    <aside className="w-64 bg-[#1a3636] flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
          <FiBookOpen size={18} className="text-white" />
        </div>
        <div>
          <span className="text-white font-extrabold text-lg leading-none">PerpusCakra</span>
          <p className="text-white/40 text-xs mt-0.5 capitalize">{role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange?.(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-white/50'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
            {user.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.username || 'User'}</p>
            <p className="text-white/40 text-xs capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <FiLogOut size={15} /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f9] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 flex flex-col md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-800 p-1"
              >
                <FiMenu size={22} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {user.username || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
