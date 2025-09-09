/**
 * Mock data for the META CRM application.
 * This file contains sample data for various parts of the UI,
 * including charts, tables, and detail views.
 */

// Data for Dashboard page charts and feeds
export const inquiryTrendData = [
  { name: "Jan 11", inquiries: 300 },
  { name: "Jan 12", inquiries: 400 },
  { name: "Jan 13", inquiries: 350 },
  { name: "Jan 14", inquiries: 420 },
  { name: "Jan 15", inquiries: 380 },
  { name: "Jan 16", inquiries: 410 },
  { name: "Jan 17", inquiries: 370 },
];

export const analyticsData = [
  { name: "Jan", value: 12000 },
  { name: "Feb", value: 28000 },
  { name: "Mar", value: 18000 },
  { name: "Apr", value: 32000 },
  { name: "May", value: 24000 },
  { name: "Jun", value: 29000 },
  { name: "Jul", value: 22000 },
];

export const recentActivity = [
  {
    type: "New Lead",
    source: "Instagram",
    name: "Jony Smith - Web Design",
    time: "1 minute ago",
    color: "green",
  },
  {
    type: "Campaign",
    name: "SEO Services Campaign",
    time: "1 hour ago",
    color: "blue",
  },
  {
    type: "Lead Converted",
    name: "Sarah Johnson - $2,500",
    time: "3 hours ago",
    color: "orange",
  },
  {
    type: "Message",
    name: "WhatsApp message sent to Mike Black",
    time: "5 hours ago",
    color: "purple",
  },
];

// Data for the Prospects table
export const prospectsData = [
  {
    name: "Jennifer Martinez",
    phone: "-",
    source: "Website Form",
    contactDate: "2024-01-22",
    followUp: "2024-01-25",
    status: "Hot Lead",
  },
  {
    name: "David Thompson",
    phone: "-",
    source: "Referral",
    contactDate: "2024-01-21",
    followUp: "-",
    status: "Cold Lead",
  },
  {
    name: "Maria Rodriguez",
    phone: "+1 (555) 300-1234",
    source: "Social Media",
    contactDate: "2024-01-20",
    followUp: "2024-01-23",
    status: "Warm Lead",
  },
  {
    name: "James Wilson",
    phone: "+1 (555) 901-2345",
    source: "-",
    contactDate: "2024-01-19",
    followUp: "2024-01-22",
    status: "Hot Lead",
  },
  {
    name: "Amanda Chen",
    phone: "-",
    source: "Google Ads",
    contactDate: "-",
    followUp: "2024-01-24",
    status: "New Lead",
  },
  {
    name: "Robert Garcia",
    phone: "+1 (555) 012-3456",
    source: "Email Campaign",
    contactDate: "2024-01-18",
    followUp: "-",
    status: "Warm Lead",
  },
];

// Data for the Leads table (updated for medical context)
export const leadsData = [
  {
    name: "Sophie Turner",
    phone: "+1 (555) 789-1234",
    diseases: "Hypertension",
    status: "Hot Lead",
    reminder: "2025-09-05 11:00 AM",
    action: "View",
  },
  {
    name: "Ethan Brooks",
    phone: "-",
    diseases: "Diabetes",
    status: "Cold Lead",
    reminder: "2025-09-06 10:00 AM",
    action: "Edit",
  },
  {
    name: "Olivia Bennett",
    phone: "+1 (555) 456-7890",
    diseases: "Asthma",
    status: "Warm Lead",
    reminder: "2025-09-07 02:00 PM",
    action: "Call",
  },
  {
    name: "Liam Carter",
    phone: "+1 (555) 234-5678",
    diseases: "Migraine",
    status: "New Lead",
    reminder: "2025-09-08 09:00 AM",
    action: "View",
  },
  {
    name: "Isabella Hayes",
    phone: "-",
    diseases: "Arthritis",
    status: "Warm Lead",
    reminder: "2025-09-09 03:00 PM",
    action: "Edit",
  },
  {
    name: "Noah Patel",
    phone: "+1 (555) 678-9012",
    diseases: "Anxiety",
    status: "Hot Lead",
    reminder: "2025-09-10 01:00 PM",
    action: "Call",
  },
];

// Data for the Patients table
export const patientsData = [
  {
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    disease: "Hypertension",
    visitDate: "2024-01-15",
    visitTime: "10:30 AM",
    // relation: "Self",
    confirmation: "Confirmed",
  },
  {
    name: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    disease: "Diabetes Type 2",
    visitDate: "2024-01-16",
    visitTime: "2:15 PM",
    // relation: "Spouse",
    confirmation: "Cancelled",
  },
  {
    name: "Michael Brown",
    phone: "+1 (555) 345-6789",
    disease: "Asthma",
    visitDate: "2024-01-17",
    visitTime: "9:00 AM",
    // relation: "Child",
    confirmation: "Confirmed",
  },
  {
    name: "Emily Davis",
    phone: "+1 (555) 456-7890",
    disease: "Migraine",
    visitDate: "2024-01-18",
    visitTime: "11:45 AM",
    // relation: "Self",
    confirmation: "Cancelled",
  },
  {
    name: "Robert Wilson",
    phone: "+1 (555) 567-8901",
    disease: "Arthritis",
    visitDate: "2024-01-19",
    visitTime: "3:30 PM",
    // relation: "Parent",
    confirmation: "Confirmed",
  },
  {
    name: "Lisa Anderson",
    phone: "+1 (555) 678-9012",
    disease: "Anxiety",
    visitDate: "2024-01-20",
    visitTime: "1:00 PM",
    // relation: "Self",
    confirmation: "Cancelled",
  },
];

// Data for the Lead Info detail page
export const leadInfoData = {
  fullName: "Kashish Shah",
  company: "Web Design • Smith Enterprises",
  phone: "+1 (555) 123-4567",
  disease: "Cancer",
  contactDate: "08-07-2006",
  upcomingReminder: "01-01-2001",
  status: "Lead / Prospect / Patient",
};

// Data for Reminders
export const remindersData = [
  {
    lead: "Sophie Turner",
    dateTime: "2025-09-02 10:00 AM",
    type: "Call",
    category: "Upcoming",
  },
  {
    lead: "Ethan Brooks",
    dateTime: "2025-09-01 11:57 AM",
    type: "Follow-up",
    category: "Due Today",
  },
  {
    lead: "Olivia Bennett",
    dateTime: "2025-08-30 09:00 AM",
    type: "Meeting",
    category: "Overdue",
  },
  {
    lead: "Liam Carter",
    dateTime: "2025-09-03 02:00 PM",
    type: "Email",
    category: "Upcoming",
  },
  {
    lead: "Isabella Hayes",
    dateTime: "2025-08-28 03:00 PM",
    type: "Consultation",
    category: "Overdue",
  },
  {
    lead: "Noah Patel",
    dateTime: "2025-09-04 01:00 PM",
    type: "Review",
    category: "Upcoming",
  },
  {
    lead: "John Smith",
    dateTime: "2025-09-01 09:00 AM",
    type: "Check-up",
    category: "Completed",
  },
];

// Data for Team
export const teamData = [
  { name: 'Alice Johnson', role: 'Manager', email: 'alice.johnson@example.com' },
  { name: 'Bob Smith', role: 'Sales Person', email: 'bob.smith@example.com' },
  { name: 'Charlie Brown', role: 'Admin', email: 'charlie.brown@example.com' },
  { name: 'Dana White', role: 'Manager', email: 'dana.white@example.com' },
  { name: 'Eve Davis', role: 'Admin', email: 'eve.davis@example.com' },
  { name: 'Frank Miller', role: 'Sales Person', email: 'frank.miller@example.com' },
];