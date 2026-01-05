export interface DataItem {
  id: string;
  label: string;
  group?: string;
}

const VENDORS = [
  'Amazon Web Services', 'Google Cloud', 'Microsoft Azure', 'Stripe', 'Twilio',
  'Salesforce', 'HubSpot', 'Slack', 'Notion', 'Figma', 'GitHub', 'Datadog',
  'PagerDuty', 'Zoom', 'DocuSign', 'Adobe', 'Atlassian', 'Dropbox', 'Asana',
  'Monday.com', 'Airtable', 'Intercom', 'Segment', 'Amplitude', 'Mixpanel',
];

const MERCHANTS = [
  'Starbucks', 'Delta Airlines', 'United Airlines', 'Uber', 'Lyft', 'Marriott',
  'Hilton', 'WeWork', 'Office Depot', 'Staples', 'FedEx', 'UPS', 'Shell',
  'Whole Foods', 'Target', 'Best Buy', 'Apple Store', 'Amazon', 'Walmart',
];

const CATEGORIES = [
  'Software', 'Cloud Infrastructure', 'Travel', 'Meals', 'Office Supplies',
  'Marketing', 'Shipping', 'Utilities', 'Equipment', 'Training',
];

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Finance',
  'Operations', 'Legal', 'HR', 'Customer Success',
];

export function generateDataset(count: number = 10000): DataItem[] {
  const items: DataItem[] = [];
  const groups = ['Vendors', 'Merchants', 'Categories', 'Departments'];
  
  for (let i = 0; i < count; i++) {
    const group = groups[i % groups.length];
    let label: string;
    
    if (group === 'Vendors') {
      label = VENDORS[i % VENDORS.length] + (i >= VENDORS.length ? ` ${Math.floor(i / VENDORS.length)}` : '');
    } else if (group === 'Merchants') {
      label = MERCHANTS[i % MERCHANTS.length] + (i >= MERCHANTS.length ? ` #${i}` : '');
    } else if (group === 'Categories') {
      label = CATEGORIES[i % CATEGORIES.length] + (i >= CATEGORIES.length ? ` - ${i}` : '');
    } else {
      label = DEPARTMENTS[i % DEPARTMENTS.length] + (i >= DEPARTMENTS.length ? ` Team ${i}` : '');
    }
    
    items.push({ id: `item-${i}`, label, group });
  }
  
  return items;
}
