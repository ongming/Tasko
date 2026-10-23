import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import minhImg from "@/assets/imgs/Minh.jpg";
import khoaImg from "@/assets/imgs/Khoa.jpg";
import { DoodleArrowLeft, DoodleSparksRight } from "@/components/Doodles";
import {
  ChevronDown,
  ArrowRight,
  Lock,
  Search,
  Bell,
  Settings,
  Star,
  Layers,
  Sliders,
  Bot,
  MessageSquare,
  Boxes,
  Shuffle,
  CheckCircle2,
  FileText,
  Sparkles,
  Zap,
  Users,
  Shield,
  Cloud,
  CheckSquare,
  Plus,
  Table,
  Folder,
  ListCheck,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0-.01-2.96 1.48 1.48 0 0 0 .01 2.96M7.86 18.5V10.13H5.07v8.37h2.79z" />
    </svg>
  );
}

function QuoteIcon({ className = "w-10 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 32 26" fill="currentColor">
      <path d="M0 16.5C0 7.388 5.647 1.882 12.706 0L14 3.765C9.765 5.176 7.412 8.353 7.059 11.294C8.235 11.059 9.529 11.176 10.706 11.765C13.294 13.059 14.824 15.765 14.824 18.824C14.824 22.706 11.882 25.882 8 25.882C3.529 25.882 0 22.118 0 16.5ZM17.176 16.5C17.176 7.388 22.824 1.882 29.882 0L31.176 3.765C26.941 5.176 24.588 8.353 24.235 11.294C25.412 11.059 26.706 11.176 27.882 11.765C30.471 13.059 32 15.765 32 18.824C32 22.706 29.059 25.882 25.176 25.882C20.706 25.882 17.176 22.118 17.176 16.5Z" />
    </svg>
  );
}

export function LandingPage() {
  const [selectedMethod, setSelectedMethod] = useState("Scrum");
  const [activeBoardTab, setActiveBoardTab] = useState("Board");

  return (
    <>
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-white">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] accent-glow pointer-events-none -z-10 blur-3xl opacity-70"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 tracking-tight leading-[1.2] mb-4">
              <span>Làm việc</span>{" "}
              <span className="inline-flex items-center gap-2 px-3.5 pt-1 pb-3 rounded-xl bg-indigo-50 text-indigo-600 text-4xl sm:text-5xl lg:text-[54px] font-bold mx-1">
                thông minh hơn
              </span>
              <br />
              <span>với Tasko</span>
            </h1>

            {/* Subtitle */}
            <p className="text-black text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Quản lý dự án, kết nối đội nhóm và biến kế hoạch thành kết quả với
              Tasko.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-sm hover:shadow transition-all"
              >
                <span>Bắt đầu miễn phí</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-medium text-base border border-slate-200 shadow-xs transition-all"
              >
                Khám phá Tasko
              </a>
            </div>
          </div>

          {/* App Window Mockup */}
          <div className="relative max-w-5xl mx-auto mt-10">
            {/* Nét vẽ mũi tên uốn lượn chỉ vào bảng (bên trái) */}
            <DoodleArrowLeft className="absolute -left-6 sm:-left-12 md:-left-16 top-12 sm:top-16 w-24 h-24 sm:w-28 sm:h-28 z-0 text-indigo-400" />

            {/* Nét vẽ tia sáng & vệt lượn (bên phải) */}
            <DoodleSparksRight className="absolute -right-6 sm:-right-12 md:-right-14 top-2 w-20 h-20 sm:w-24 sm:h-24 z-0 text-indigo-400" />

            <div className="relative z-10 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden text-left">
              {/* Window Title Bar */}
              <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <Link 
                  to="/workspace"
                  className="flex items-center gap-2 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded text-xs text-slate-500 hover:text-indigo-600 w-72 justify-center shadow-2xs transition-colors group cursor-pointer"
                  title="Mở Không gian làm việc Workspace"
                >
                  <Lock className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-[11px] font-medium truncate">
                    tasko.io/workspace/website-redesign
                  </span>
                </Link>
                <div className="w-12"></div>
              </div>

              {/* App Body Layout */}
              <div className="flex min-h-[500px]">
                {/* Left Sidebar */}
                <aside className="w-56 bg-slate-50 border-r border-slate-200/80 p-3 flex flex-col text-xs text-slate-600 shrink-0 hidden md:flex">
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80 mb-3 shadow-2xs cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                        T
                      </div>
                      <span className="font-semibold text-slate-800 text-xs truncate">
                        Marketing Team
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                      <Table className="w-4 h-4 text-slate-400" />
                      <span>Tổng quan</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span>Dự án</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                      <ListCheck className="w-4 h-4 text-slate-400" />
                      <span>Công việc</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Lịch</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Thành viên</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Cài đặt</span>
                    </div>
                  </div>

                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2">
                    DỰ ÁN CỦA TÔI
                  </div>
                  <div className="space-y-1">
                    <div className="bg-indigo-50 text-indigo-600 font-medium rounded px-2 py-1.5 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        <span className="truncate font-semibold">
                          Website Redesign
                        </span>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1 rounded">
                        18
                      </span>
                    </div>
                    <div className="hover:bg-slate-100 text-slate-700 font-medium rounded px-2 py-1.5 flex items-center gap-2 cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span className="truncate">Mobile App</span>
                    </div>
                    <div className="hover:bg-slate-100 text-slate-700 font-medium rounded px-2 py-1.5 flex items-center gap-2 cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span className="truncate">Marketing Campaign</span>
                    </div>
                    <div className="text-indigo-600 font-medium rounded px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:underline">
                      <Plus className="w-3 h-3" />
                      <span>Tạo dự án</span>
                    </div>
                  </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white flex flex-col overflow-x-auto min-w-0">
                  {/* Top Bar */}
                  <div className="border-b border-slate-200/80 px-5 py-2.5 flex items-center justify-between gap-4">
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-none"
                        placeholder="Tìm kiếm..."
                        readOnly
                        type="text"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500">
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <img
                        alt="User avatar"
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-50"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                      />
                    </div>
                  </div>

                  {/* Project Header */}
                  <div className="px-5 pt-4 pb-2 border-b border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Website Redesign
                        </h3>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-1.5">
                          <img
                            alt="Member"
                            className="w-6 h-6 rounded-full border border-white ring-1 ring-slate-100"
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
                          />
                          <img
                            alt="Member"
                            className="w-6 h-6 rounded-full border border-white ring-1 ring-slate-100"
                            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces"
                          />
                          <img
                            alt="Member"
                            className="w-6 h-6 rounded-full border border-white ring-1 ring-slate-100"
                            src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=faces"
                          />
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                            +5
                          </div>
                        </div>
                        <button className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition">
                          Chia sẻ
                        </button>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                      {[
                        "Board",
                        "Sprint",
                        "Gantt",
                        "Calendar",
                        "Control Board",
                      ].map((tab) => (
                        <span
                          key={tab}
                          onClick={() => setActiveBoardTab(tab)}
                          className={`pb-2 cursor-pointer transition-all ${
                            activeBoardTab === tab
                              ? "text-indigo-600 font-semibold border-b-2 border-indigo-600"
                              : "hover:text-slate-700"
                          }`}
                        >
                          {tab}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Filter Row */}
                  <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200/80 text-xs shadow-2xs cursor-pointer">
                        <span>Todo</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200/80 text-xs shadow-2xs cursor-pointer">
                        <Sliders className="w-3 h-3 text-slate-400" />
                        <span>Bộ lọc</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Nhóm theo:</span>
                      <span className="font-semibold text-slate-700">
                        Trạng thái
                      </span>
                    </div>
                  </div>

                  {/* 4-Column Board Canvas */}
                  <div className="p-5 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Column 1: Backlog */}
                    <div className="flex flex-col">
                      <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>Backlog</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-semibold">
                          8
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-purple-50 text-purple-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Research
                            </span>
                            <span className="text-[10px] text-slate-400">
                              12 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Nghiên cứu đối thủ cạnh tranh
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces"
                            />
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Design
                            </span>
                            <span className="text-[10px] text-slate-400">
                              15 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Thiết kế giao diện trang chủ
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-rose-50 text-rose-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Content
                            </span>
                            <span className="text-[10px] text-slate-400">
                              18 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Viết nội dung marketing
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: In Progress */}
                    <div className="flex flex-col">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>In Progress</span>
                        </div>
                        <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded font-semibold text-blue-600">
                          6
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Backend
                            </span>
                            <span className="text-[10px] text-slate-400">
                              10 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Phát triển API đăng nhập
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Backend
                            </span>
                            <span className="text-[10px] text-slate-400">
                              14 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Tích hợp thanh toán
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-amber-50 text-amber-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              SEO
                            </span>
                            <span className="text-[10px] text-slate-400">
                              17 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Tối ưu SEO
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Review */}
                    <div className="flex flex-col">
                      <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>Review</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded font-semibold text-amber-600">
                          4
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-sky-50 text-sky-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Frontend
                            </span>
                            <span className="text-[10px] text-slate-400">
                              11 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Sửa lỗi responsive
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              DevOps
                            </span>
                            <span className="text-[10px] text-slate-400">
                              13 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Đánh giá hiệu năng
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-purple-50 text-purple-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Docs
                            </span>
                            <span className="text-[10px] text-slate-400">
                              16 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Cập nhật tài liệu
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 4: Done */}
                    <div className="flex flex-col">
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Done</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold text-emerald-600">
                          12
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Setup
                            </span>
                            <span className="text-[10px] text-slate-400">
                              08 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Khởi tạo dự án
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-purple-50 text-purple-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Marketing
                            </span>
                            <span className="text-[10px] text-slate-400">
                              09 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Đăng ký domain
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              DevOps
                            </span>
                            <span className="text-[10px] text-slate-400">
                              10 thg 5
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                            Triển khai staging
                          </p>
                          <div className="flex items-center justify-end -space-x-1">
                            <img
                              className="w-4 h-4 rounded-full ring-1 ring-white"
                              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=faces"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. FEATURES SECTION ==================== */}
      <section
        className="py-20 lg:py-28 bg-white border-y border-slate-100"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-3xl mb-16 ">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4 ">
              Tất cả những gì bạn cần để quản lý dự án hiệu quả
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Từ lập kế hoạch, theo dõi tiến độ đến cộng tác và báo cáo, Tasko
              cung cấp một bộ công cụ toàn diện để giúp đội nhóm của bạn làm
              việc tốt nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Đa phương pháp quản lý
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hỗ trợ Scrum, Kanban và Scrumban trên cùng một nền tảng.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-5">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Control Board
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tích hợp lập kế hoạch, làm việc và cấu hình trong một màn hình.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-5">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                AI hỗ trợ
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trích xuất task/project từ tài liệu, đề xuất và tự động tạo.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Cộng tác thời gian thực
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bình luận, đính kèm, nhãn, thông báo.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-lg mb-5">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Mẫu dự án
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tạo và chia sẻ mẫu dự án công khai hoặc riêng tư.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center text-lg mb-5">
                <Shuffle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Chuyển đổi linh hoạt
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Đổi phương pháp quản lý mà không mất dữ liệu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. METHODOLOGY SECTION ==================== */}
      <section className="py-20 lg:py-28 overflow-hidden" id="methodology">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Board Card Mockup */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">
                      Project
                    </span>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1 text-xs font-medium text-slate-800">
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>Website Redesign</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
                    </div>
                  </div>
                  <div className="flex items-center -space-x-1.5">
                    <img
                      alt="Team member"
                      className="w-6 h-6 rounded-full border border-white ring-1 ring-slate-100"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces"
                    />
                    <img
                      alt="Team member"
                      className="w-6 h-6 rounded-full border border-white ring-1 ring-slate-100"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=faces"
                    />
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                      +3
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 overflow-x-auto">
                  <span className="px-2.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                    Backlog
                  </span>
                  <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 font-semibold cursor-pointer">
                    Sprint
                  </span>
                  <span className="px-2.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                    Board
                  </span>
                  <span className="px-2.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                    Gantt
                  </span>
                  <span className="px-2.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                    Calendar
                  </span>
                </div>

                <div className="my-2 p-3.5 rounded bg-slate-50 border border-slate-200/80">
                  <div className="flex flex-wrap items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Sprint 3
                      </span>
                      <span className="text-slate-400">12 Aug - 26 Aug</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        12 Aug - 26 Aug
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                        Đang chạy
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="w-3/5 h-full bg-indigo-600 rounded-full"></div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200/80 border border-slate-200/80 rounded overflow-hidden mt-3 bg-white">
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-transparent hover:text-slate-400 cursor-pointer">
                        <CheckSquare className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">
                            TSK-201
                          </span>
                          <p className="text-xs font-semibold text-slate-800">
                            Thiết kế UI trang chủ
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Đã cập nhật 2 giờ trước
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium text-[11px]">
                        Design
                      </span>
                      <div className="flex items-center -space-x-1">
                        <img
                          className="w-5 h-5 rounded-full border border-white ring-1 ring-slate-100"
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces"
                        />
                        <img
                          className="w-5 h-5 rounded-full border border-white ring-1 ring-slate-100"
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=faces"
                        />
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-transparent hover:text-slate-400 cursor-pointer">
                        <CheckSquare className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">
                            TSK-202
                          </span>
                          <p className="text-xs font-semibold text-slate-800">
                            Phát triển API người dùng
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Hạn chót: Ngày mai
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium text-[11px]">
                        Backend
                      </span>
                      <div className="flex items-center -space-x-1">
                        <img
                          className="w-5 h-5 rounded-full border border-white ring-1 ring-slate-100"
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=faces"
                        />
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide mb-4">
                <span>Linh hoạt theo cách bạn làm việc</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
                Scrum, Kanban, Scrumban – Chọn phương pháp phù hợp
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                Mỗi dự án có thể chọn một phương pháp quản lý và dễ dàng chuyển
                đổi mà không làm mất dữ liệu.
              </p>

              <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-md mb-8">
                {["Scrum", "Kanban", "Scrumban"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
                      selectedMethod === method
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "hover:bg-white text-slate-700 font-medium"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Backlog, Sprint và Board
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Một Sprint đang chạy mỗi Project
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Tùy chỉnh linh hoạt theo nhu cầu đội nhóm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. AI SPOTLIGHT SECTION ==================== */}
      <section className="py-20 lg:py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 block">
                TRỢ LÝ AI THÔNG MINH
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
                Biến tài liệu thành kế hoạch chỉ trong vài phút
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                Tải lên tài liệu, để AI phân tích và đề xuất các Task/Project.
                Bạn có thể xem, chỉnh sửa và xác nhận tạo ngay trên Tasko.
              </p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Hỗ trợ nhiều định dạng tài liệu
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Đề xuất cấu trúc công việc thông minh
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Lịch sử phân tích và quản lý dễ dàng
                  </span>
                </div>
              </div>

              <a
                href="#ai"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <span>Khám phá AI</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="lg:col-span-7">
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 p-4 sm:p-6 rounded-lg bg-slate-50/70 border border-slate-200/80 shadow-2xs">
                <div className="w-full md:w-56 p-5 rounded-lg bg-white border border-slate-200/80 shadow-2xs text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Tải lên tài liệu
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    PDF, DOCX, TXT,...
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center text-indigo-500 my-2 md:my-0">
                  <div className="text-indigo-400 mb-1 animate-pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="w-7 h-7 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="w-full md:w-72 p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      AI đề xuất{" "}
                      <span className="text-indigo-600 font-semibold">
                        12 Task
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3.5">
                    {[
                      "Phân tích yêu cầu hệ thống",
                      "Thiết kế cơ sở dữ liệu",
                      "Phát triển API",
                      "Kiểm thử và deploy",
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/60 p-2 rounded"
                      >
                        <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-2xs">
                    Xác nhận tạo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. VALUE PROPOSITION SECTION ==================== */}
      <section className="py-16 bg-[#f8faff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Vì sao nên chọn Tasko?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Không chỉ là một công cụ, Tasko là người đồng hành trên hành trình
              phát triển của doanh nghiệp bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Tăng 50%
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  hiệu suất làm việc
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Đội nhóm
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  cộng tác hiệu quả hơn
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Bảo mật cao
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">với JWT và RBAC</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Dễ dàng mở rộng
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  theo nhu cầu doanh nghiệp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. TEAM MEMBERS SECTION (JIRA STYLE) ==================== */}
      <section
        className="py-20 lg:py-24 bg-[#fafbfc] border-t border-slate-200/70"
        id="team"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Đội ngũ kiến tạo Tasko
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              Khám phá định hướng kiến trúc hệ thống và triết lý thiết kế trải
              nghiệm người dùng đằng sau tiểu luận chuyên ngành.
            </p>
          </div>

          {/* Cards Showcase */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
            {/* ================= CARD 1: NGUYỄN ĐÌNH QUANG MINH ================= */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch group transition-all duration-300">
              {/* Photo box with pastel lime/pea-green background */}
              <div className="relative w-full sm:w-56 md:w-64 h-80 sm:h-auto rounded-3xl overflow-hidden shrink-0 bg-[#d7f2a7] flex items-end justify-center shadow-xs">
                <img
                  alt="Nguyễn Đình Quang Minh"
                  className="w-full h-full object-cover object-top grayscale contrast-115 mix-blend-multiply group-hover:scale-102 transition-transform duration-500"
                  src={minhImg}
                />
              </div>

              {/* Solid Deep Forest Green Overlapping Card */}
              <div className="relative -mt-10 sm:mt-0 sm:-ml-12 md:-ml-16 w-full flex-1 p-6 sm:p-8 md:p-9 rounded-b-3xl sm:rounded-b-none sm:rounded-r-3xl text-white flex flex-col justify-between shadow-xl z-10 bg-gradient-to-r from-[#284e1b]/80 via-[#284e1b]/95 to-[#284e1b] backdrop-blur-md">
                <div>
                  {/* Role / Module Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1  text-lime-200 ">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                      Frontend &amp; UX
                    </span>
                  </div>

                  {/* Prominent Jira-Style Quote Icon */}
                  <div className="text-white opacity-95 mb-4">
                    <QuoteIcon className="w-10 h-8" />
                  </div>

                  {/* Quote Content */}
                  <p className="text-sm sm:text-base leading-relaxed text-lime-50 font-normal mb-6">
                    Trải nghiệm người dùng là linh hồn của một phần mềm quản
                    trị. Chúng tôi chăm chút từng thao tác kéo thả trên Kanban,
                    từng trạng thái của Control Board nhằm mang lại cảm giác
                    mượt mà, phản hồi tức thì và trực quan nhất cho đội nhóm.
                  </p>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {[
                      "ReactJS",
                      "Tailwind CSS",
                      "UI/UX Design",
                      "Zustand",
                      "dnd-kit",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-white/15 text-lime-100 text-[10px] font-medium backdrop-blur-2xs border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Meta & Action */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs font-bold tracking-wider uppercase text-lime-100 mb-4">
                    NGUYỄN ĐÌNH QUANG MINH
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-lime-200">
                      <a
                        href="https://github.com/ongming"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                        title="GitHub"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/minh-nguy%E1%BB%85n-%C4%91%C3%ACnh-quang-932014425/"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                        title="LinkedIn"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="mailto:contact@tasko.dev"
                        className="hover:text-white transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= CARD 2: NGUYỄN ĐĂNG KHOA ================= */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch group transition-all duration-300">
              {/* Photo box with pastel blue background */}
              <div className="relative w-full sm:w-56 md:w-64 h-80 sm:h-auto rounded-3xl overflow-hidden shrink-0 bg-[#cce2f7] flex items-end justify-center shadow-xs">
                <img
                  alt="Nguyễn Đăng Khoa"
                  className="w-full h-full object-cover object-center grayscale contrast-115 mix-blend-multiply group-hover:scale-102 transition-transform duration-500"
                  src={khoaImg}
                />
              </div>

              {/* Solid Royal Blue Overlapping Card */}
              <div className="relative -mt-10 sm:mt-0 sm:-ml-12 md:-ml-16 w-full flex-1 rounded-b-3xl sm:rounded-b-none sm:rounded-r-3xl p-6 sm:p-8 md:p-9 text-white flex flex-col justify-between shadow-xl z-10 bg-gradient-to-r from-[#0c57d0]/80 via-[#0c57d0]/95 to-[#0c57d0] backdrop-blur-md">
                <div>
                  {/* Role / Module Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 text-blue-200  ">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      Backend &amp; System
                    </span>
                  </div>

                  {/* Prominent Jira-Style Quote Icon */}
                  <div className="text-white opacity-95 mb-4">
                    <QuoteIcon className="w-10 h-8" />
                  </div>

                  {/* Quote Content */}
                  <p className="text-sm sm:text-base leading-relaxed text-blue-50 font-normal mb-6">
                    Tasko được xây dựng với mục tiêu giải quyết triệt để bài
                    toán quản lý linh hoạt giữa Scrum và Kanban cho SME. Mọi
                    tính năng từ kiến trúc Backend Modular Monolith đến trợ lý
                    AI đều được tối ưu để vận hành tin cậy và có thể mở rộng
                    không giới hạn.
                  </p>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {[
                      "NestJS",
                      "PostgreSQL",
                      "Prisma ORM",
                      "Gemini AI",
                      "RBAC",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-white/15 text-blue-100 text-[10px] font-medium backdrop-blur-2xs border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Meta & Action */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs font-bold tracking-wider uppercase text-blue-100 mb-4">
                    NGUYỄN ĐĂNG KHOA
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-blue-200">
                      <a
                        href="https://github.com/NDKhoa30102005 "
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                        title="GitHub"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                        title="LinkedIn"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="mailto:contact@tasko.dev"
                        className="hover:text-white transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 7. PRE-FOOTER CTA ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative gradient-banner text-white rounded-xl border border-slate-800 p-8 sm:p-10 lg:p-12 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-4 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <Logo className="w-9 h-9" />
                <span className="text-2xl font-bold tracking-tight text-white">
                  Tasko
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xs">
                Đồng hành cùng doanh nghiệp của bạn trên hành trình chinh phục
                mục tiêu.
              </p>
            </div>

            <div className="lg:col-span-5 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Sẵn sàng bắt đầu với Tasko?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
                Đăng ký ngay hôm nay và trải nghiệm nền tảng quản lý dự án hiện
                đại, linh hoạt và hiệu quả.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                >
                  Tham gia với chúng tôi ngay
                  <ArrowRight className="w-4 h-4" />
                </Link>
                

              </div>
            </div>

            <div className="lg:col-span-3 flex items-center justify-center lg:justify-end">
              <div className="relative transform rotate-[-4deg] text-center lg:text-right select-none">
                <span className="font-handwriting text-3xl sm:text-4xl text-white font-bold tracking-wide">
                  Better Team
                  <br />
                  Bigger Goals
                </span>
                <span className="text-2xl ml-2 text-indigo-300">↗</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
