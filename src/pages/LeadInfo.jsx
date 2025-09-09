import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { leadInfoData } from "../data/mockData";

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-sm text-text-secondary">{label}</p>
    <p className="font-medium text-text-primary">{value}</p>
  </div>
);

const LeadInfo = () => {
  const lead = leadInfoData;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {lead.fullName}
          </h1>
          <p className="text-text-secondary mt-1">{lead.company}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Update Status</Button>
          <Button>Add Reminder</Button>
        </div>
      </header>

      <div className="border-b">
        <nav className="flex space-x-6">
          <a
            href="#"
            className="py-2 border-b-2 border-primary text-primary font-semibold"
          >
            Overview
          </a>
        </nav>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          Lead Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InfoField label="Full Name" value={lead.fullName} />
          <InfoField label="Disease" value={lead.disease} />
          <InfoField label="Phone" value={lead.phone} />
          <InfoField label="Contact Date" value={lead.contactDate} />
          <InfoField
            label="Upcoming Reminder Date"
            value={lead.upcomingReminder}
          />
          <InfoField label="Status" value={lead.status} />
        </div>
      </Card>
    </div>
  );
};

export default LeadInfo;

