import React from 'react';
import Sidebar from '@/components/Sidebar';
import SubmissionsTable, { SubmissionItem } from '@/components/SubmissionsTable';
import { getCustomerDb } from '@/lib/mongodb';
import { Mail, MessageSquare, Inbox, AlertCircle } from 'lucide-react';

export const revalidate = 0;

async function getFormSubmissions(): Promise<{ submissions: SubmissionItem[]; error?: string }> {
  const db = await getCustomerDb();
  if (!db) {
    return { 
      submissions: [], 
      error: 'MongoDB connection is not configured or failed to connect to Customer_data database.' 
    };
  }

  try {
    const collection = db.collection('form_data');
    const docs = await collection.find({}).sort({ _id: -1 }).toArray();

    const submissions: SubmissionItem[] = docs.map((doc: any) => {
      const email = doc.Email || doc.email || doc.EmailAddress || doc.emailAddress || '';
      const fullName = doc.FullName || doc.fullname || doc.name || doc.Name || '';
      const contactNumber = doc.ContactNumber || doc.contactnumber || doc.phone || doc.Phone || '';
      const company = doc.Company || doc.companyName || doc.company || '';
      const service = doc.Service || doc.service || doc.interest || doc.Subject || doc.subject || '';
      const source = doc.Source || doc.source || 'Website';
      const message = doc.Message || doc.message || doc.MessageBody || '';

      // Classification logic for contact vs newsletter
      let type: 'contact' | 'newsletter' | 'other' = 'contact';
      const combinedText = `${message} ${service} ${fullName} ${source}`.toLowerCase();
      if (
        combinedText.includes('newsletter') || 
        fullName.toLowerCase().includes('newsletter subscriber') || 
        (!message && !contactNumber && email)
      ) {
        type = 'newsletter';
      }

      // Parse timestamp / submission date
      let dateVal = doc.submissiondate || doc.createdAt || doc.date || doc.created_at;
      if (!dateVal && doc._id && typeof doc._id.getTimestamp === 'function') {
        dateVal = doc._id.getTimestamp();
      }
      const parsedDate = dateVal ? new Date(dateVal) : new Date();
      const formattedDate = isNaN(parsedDate.getTime()) 
        ? 'Recent' 
        : parsedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

      return {
        _id: doc._id ? doc._id.toString() : Math.random().toString(),
        type,
        fullName: fullName || (type === 'newsletter' ? 'Newsletter Subscriber' : 'Website Visitor'),
        email,
        contactNumber,
        company,
        service,
        source,
        message,
        rawDate: dateVal,
        formattedDate,
        rawPayload: JSON.parse(JSON.stringify(doc))
      };
    });

    return { submissions };
  } catch (err: any) {
    console.error('Error querying MongoDB form_data collection:', err);
    return { submissions: [], error: err?.message || 'Failed to query MongoDB collection' };
  }
}

export default async function SubmissionsPage() {
  const { submissions, error } = await getFormSubmissions();

  const totalCount = submissions.length;
  const contactCount = submissions.filter(s => s.type === 'contact').length;
  const newsletterCount = submissions.filter(s => s.type === 'newsletter').length;

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <div className="mx-auto max-w-7xl">
          {/* Header section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 border-l-4 border-zinc-900 pl-4">
                  Form Submissions
                </h1>
              </div>
              <p className="mt-3 text-sm text-zinc-500 font-medium ml-5">
                Real-time inquiries and newsletter signups from the InnoFarms market web application.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800">
                  Live MongoDB Feed
                </span>
              </div>
            </div>
          </div>

          {/* Database Error Banner if any */}
          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Database Connection Notice</h4>
                <p className="text-xs mt-0.5 text-amber-800">{error}</p>
                <p className="text-[11px] mt-1 text-amber-700 font-mono">
                  Collection target: Customer_data / form_data
                </p>
              </div>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
            {/* Total Submissions */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Total Submissions
                </span>
                <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-700">
                  <Inbox className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-900">{totalCount}</span>
                <span className="text-xs font-semibold text-zinc-500">entries</span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-zinc-400">
                Captured across website forms
              </p>
            </div>

            {/* Contact Us Leads */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Contact Us Inquiries
                </span>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-900">{contactCount}</span>
                <span className="text-xs font-semibold text-blue-600">
                  {totalCount > 0 ? `${Math.round((contactCount / totalCount) * 100)}%` : '0%'}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-zinc-400">
                Direct client & service inquiries
              </p>
            </div>

            {/* Newsletter Subscribers */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Newsletter Subscribers
                </span>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-900">{newsletterCount}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {totalCount > 0 ? `${Math.round((newsletterCount / totalCount) * 100)}%` : '0%'}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-zinc-400">
                Marketing newsletter signups
              </p>
            </div>
          </div>

          {/* Submissions Interactive Table */}
          <SubmissionsTable data={submissions} />
        </div>
      </main>
    </div>
  );
}
