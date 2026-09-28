import React from 'react';
import type { Metadata } from 'next';
import { AlertCircle, Inbox, Mail, MessageSquare } from 'lucide-react';
import AppShell from '@/components/AppShell';
import SubmissionsTable, { type SubmissionItem } from '@/components/SubmissionsTable';
import PageHeader from '@/components/ui/PageHeader';
import RefreshButton from '@/components/ui/RefreshButton';
import StatCard from '@/components/ui/StatCard';
import { getCustomerDb } from '@/lib/mongodb';
import { percent } from '@/lib/utils';

export const revalidate = 0;

export const metadata: Metadata = { title: 'Form Submissions' };

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
      const parsedDate = dateVal ? new Date(dateVal) : null;

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
        date: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined,
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
  const contactCount = submissions.filter((s) => s.type === 'contact').length;
  const newsletterCount = submissions.filter((s) => s.type === 'newsletter').length;

  return (
    <AppShell>
      <PageHeader
        title="Form Submissions"
        description="Inquiries and newsletter sign-ups from the InnoFarms website."
        actions={<RefreshButton />}
      />

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">Couldn&apos;t reach the submissions database</p>
            <p className="mt-0.5 break-words text-amber-800">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Total submissions" value={totalCount} icon={Inbox} tone="zinc" hint="Across all website forms" />
        <StatCard
          label="Contact inquiries"
          value={contactCount}
          icon={MessageSquare}
          tone="blue"
          progress={percent(contactCount, totalCount)}
          hint={`${percent(contactCount, totalCount)}% of submissions`}
        />
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            label="Newsletter sign-ups"
            value={newsletterCount}
            icon={Mail}
            tone="brand"
            progress={percent(newsletterCount, totalCount)}
            hint={`${percent(newsletterCount, totalCount)}% of submissions`}
          />
        </div>
      </div>

      <SubmissionsTable data={submissions} />
    </AppShell>
  );
}
