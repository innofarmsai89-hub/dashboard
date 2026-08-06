'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Building2, 
  Phone, 
  Calendar, 
  Globe, 
  X, 
  ExternalLink,
  ChevronRight,
  User
} from 'lucide-react';

export interface SubmissionItem {
  _id: string;
  type: 'contact' | 'newsletter' | 'other';
  fullName?: string;
  email?: string;
  contactNumber?: string;
  company?: string;
  service?: string;
  source?: string;
  message?: string;
  rawDate?: string | Date;
  formattedDate: string;
  rawPayload?: Record<string, any>;
}

interface SubmissionsTableProps {
  data: SubmissionItem[];
}

export default function SubmissionsTable({ data }: SubmissionsTableProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'contact' | 'newsletter'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

  // Filter count stats
  const contactCount = useMemo(() => data.filter(d => d.type === 'contact').length, [data]);
  const newsletterCount = useMemo(() => data.filter(d => d.type === 'newsletter').length, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter by Tab
      if (activeTab === 'contact' && item.type !== 'contact') return false;
      if (activeTab === 'newsletter' && item.type !== 'newsletter') return false;

      // Filter by Search Query
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      
      return (
        item.fullName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.contactNumber?.toLowerCase().includes(term) ||
        item.company?.toLowerCase().includes(term) ||
        item.service?.toLowerCase().includes(term) ||
        item.source?.toLowerCase().includes(term) ||
        item.message?.toLowerCase().includes(term)
      );
    });
  }, [data, activeTab, searchTerm]);

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Header controls & tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100 p-1 border border-zinc-200/50 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            All Submissions
            <span className="rounded-full bg-zinc-200/70 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
              {data.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'contact'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            Contact Us
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              {contactCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'newsletter'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-emerald-500" />
            Newsletter
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {newsletterCount}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, message..."
            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 py-2.5 pl-10 pr-4 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Company / Service</th>
              <th className="py-3.5 px-4">Message Summary</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="h-8 w-8 text-zinc-300" />
                    <p className="text-sm font-semibold text-zinc-500">No form submissions found</p>
                    <p className="text-xs text-zinc-400">Try adjusting your tab or search term</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr 
                  key={item._id} 
                  className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedSubmission(item)}
                >
                  {/* Type Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.type === 'contact' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 border border-blue-200/50">
                        <MessageSquare className="h-3 w-3" />
                        Contact Us
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/50">
                        <Mail className="h-3 w-3" />
                        Newsletter
                      </span>
                    )}
                  </td>

                  {/* Name & Email */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {item.fullName || 'Subscriber'}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-zinc-400" />
                        {item.email || 'N/A'}
                      </span>
                      {item.contactNumber && (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-zinc-400" />
                          {item.contactNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Company / Service */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      {item.company ? (
                        <span className="text-zinc-900 font-medium flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-zinc-400" />
                          {item.company}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Direct Form</span>
                      )}
                      {item.service && (
                        <span className="text-[11px] text-blue-600 font-medium mt-0.5">
                          {item.service}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Message Summary */}
                  <td className="py-4 px-4 max-w-xs">
                    <p className="truncate text-zinc-600 text-[11px] font-normal" title={item.message || ''}>
                      {item.message || (item.type === 'newsletter' ? 'Subscribed to Marketing Newsletter' : 'No message provided')}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {item.formattedDate}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 whitespace-nowrap text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(item);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                    >
                      Details
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200/80 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${selectedSubmission.type === 'contact' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {selectedSubmission.type === 'contact' ? <MessageSquare className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {selectedSubmission.type === 'contact' ? 'Contact Us Submission' : 'Newsletter Subscriber'}
                  </h3>
                  <p className="text-xs text-zinc-500">ID: {selectedSubmission._id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Sender Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/70 rounded-xl p-4 border border-zinc-100">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Full Name</label>
                  <p className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-zinc-400" />
                    {selectedSubmission.fullName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Email Address</label>
                  <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-blue-500" />
                    {selectedSubmission.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Contact Number</label>
                  <p className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    {selectedSubmission.contactNumber || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Company</label>
                  <p className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                    {selectedSubmission.company || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Service & Source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Service / Interest</label>
                  <p className="text-xs font-medium text-zinc-800 bg-zinc-100/80 rounded-lg p-2.5 border border-zinc-200/50">
                    {selectedSubmission.service || 'General Inquiry'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Source / Channel</label>
                  <p className="text-xs font-medium text-zinc-800 bg-zinc-100/80 rounded-lg p-2.5 border border-zinc-200/50 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-500" />
                    {selectedSubmission.source || 'Website'}
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Submitted Message</label>
                <div className="rounded-xl bg-zinc-900 text-zinc-100 p-4 text-xs font-normal leading-relaxed shadow-inner">
                  {selectedSubmission.message || 'No written message attached.'}
                </div>
              </div>

              {/* Date & Metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted on {selectedSubmission.formattedDate}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
