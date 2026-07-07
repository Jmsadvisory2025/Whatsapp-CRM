import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Facebook,
  CreditCard,
  MessageSquare,
  FileText
} from 'lucide-react';
import LoaderDemo from '../components/ui/ProfessionalMedicalLoader ';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MetaRegistration() {
  const [formData, setFormData] = useState({
    legal_business_name: '',
    business_type: '',
    official_website: '',
    domain_linked_email: '',
    gst_number: '',
    dedicated_phone_number: '',
    meta_facebook_account: '',
    facebook_email: '',
    facebook_password: '',
    international_card_available: false,
    international_card_number: '',
    bot_use_case_brief: '',
    business_display_name: '',
    business_category: '',
    business_description: ''
  });

  const [files, setFiles] = useState({
    business_logo: null,
    verification_document: null,
    international_card_image: null,
    bot_use_case_document: null
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Also store existing URLs if they uploaded them before
  const [existingFiles, setExistingFiles] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/meta-registration/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // prefill form
        setFormData({
          legal_business_name: data.legal_business_name || '',
          business_type: data.business_type || '',
          official_website: data.official_website || '',
          domain_linked_email: data.domain_linked_email || '',
          gst_number: data.gst_number || '',
          dedicated_phone_number: data.dedicated_phone_number || '',
          meta_facebook_account: data.meta_facebook_account || '',
          facebook_email: data.facebook_email || '',
          facebook_password: data.facebook_password || '',
          international_card_available: data.international_card_available || false,
          international_card_number: data.international_card_number || '',
          bot_use_case_brief: data.bot_use_case_brief || '',
          business_display_name: data.business_display_name || '',
          business_category: data.business_category || '',
          business_description: data.business_description || ''
        });
        
        setExistingFiles({
          business_logo: data.business_logo,
          verification_document: data.verification_document,
          international_card_image: data.international_card_image,
          bot_use_case_document: data.bot_use_case_document
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUrlBlur = (e) => {
    const { name, value } = e.target;
    if (value && !/^https?:\/\//i.test(value)) {
      setFormData(prev => ({ ...prev, [name]: `https://${value}` }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const payload = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          payload.append(key, formData[key]);
        }
      });

      // Append file fields
      Object.keys(files).forEach(key => {
        if (files[key]) {
          payload.append(key, files[key]);
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/meta-registration/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      if (res.ok) {
        setSuccess('Registration details saved successfully.');
        fetchData(); // refresh existing files
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save details. Please check your inputs.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoaderDemo />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Facebook className="h-6 w-6 text-blue-600" />
          Meta Registration Documents
        </h1>
        <p className="mt-2 text-gray-600">
          Please provide the required details and documents to set up your WhatsApp Business API account.
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* Section 1: Business Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            Business Details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Legal Business Name</label>
              <input type="text" name="legal_business_name" value={formData.legal_business_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Must match documents exactly" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Display Name</label>
              <input type="text" name="business_display_name" value={formData.business_display_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Name shown on WhatsApp profile" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type</label>
              <input type="text" name="business_type" value={formData.business_type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="e.g. Pvt Ltd, LLP, Proprietorship" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Category</label>
              <input type="text" name="business_category" value={formData.business_category} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="e.g. Retail, Healthcare, Education" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Business Description</label>
              <textarea name="business_description" value={formData.business_description} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Short description for WhatsApp profile"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GST Number</label>
              <input type="text" name="gst_number" value={formData.gst_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="GSTIN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dedicated Phone Number</label>
              <input type="text" name="dedicated_phone_number" value={formData.dedicated_phone_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Must NOT be connected to any existing WA account" />
            </div>
          </div>
        </div>

        {/* Section 2: Online Presence */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            Online Presence & Contact
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Official Website</label>
              <input type="url" name="official_website" value={formData.official_website} onChange={handleInputChange} onBlur={handleUrlBlur} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Domain-Linked Email</label>
              <input type="email" name="domain_linked_email" value={formData.domain_linked_email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="info@example.com" />
            </div>
          </div>
        </div>

        {/* Section 3: Facebook/Meta Account */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Facebook className="h-5 w-5 text-indigo-500" />
            Meta & Facebook Details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Meta/Facebook Account Name</label>
              <input type="text" name="meta_facebook_account" value={formData.meta_facebook_account} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Existing Business Portfolio or FB Account Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook Email</label>
              <input type="text" name="facebook_email" value={formData.facebook_email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Login email for Facebook" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook Password</label>
              <input type="text" name="facebook_password" value={formData.facebook_password} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Login password for Facebook" />
            </div>
          </div>
        </div>

        {/* Section 4: Billing */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Billing Information
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input id="international_card" name="international_card_available" type="checkbox" checked={formData.international_card_available} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="international_card" className="ml-2 block text-sm text-gray-900">
                International Debit/Credit Card Available (Required for Meta billing)
              </label>
            </div>
            
            {formData.international_card_available && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number (Optional)</label>
                  <input type="text" name="international_card_number" value={formData.international_card_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="XXXX-XXXX-XXXX-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Or Upload Card Image</label>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
                      <span>Choose file</span>
                      <input type="file" name="international_card_image" onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>
                    <span className="text-sm text-gray-500">
                      {files.international_card_image ? files.international_card_image.name : (existingFiles.international_card_image ? 'File uploaded previously' : 'No file chosen')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Documents & Files */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Documents Upload
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Logo (PNG/JPG)</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 py-2 px-4 rounded-md hover:bg-indigo-100 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload Logo</span>
                  <input type="file" name="business_logo" onChange={handleFileChange} className="hidden" accept=".png,.jpg,.jpeg" />
                </label>
                <span className="text-sm text-gray-500 truncate max-w-xs">
                  {files.business_logo ? files.business_logo.name : (existingFiles.business_logo ? 'Logo already uploaded' : 'No file selected')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Document (GST/Incorp/MSME/PAN)</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 py-2 px-4 rounded-md hover:bg-indigo-100 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload Document</span>
                  <input type="file" name="verification_document" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-sm text-gray-500 truncate max-w-xs">
                  {files.verification_document ? files.verification_document.name : (existingFiles.verification_document ? 'Document already uploaded' : 'No file selected')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Use Case */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Bot Use Case
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bot Use Case Brief</label>
              <p className="text-sm text-gray-500 mb-2">Describe chatbot functions (FAQ, lead generation, product menu, order updates, etc.)</p>
              <textarea name="bot_use_case_brief" value={formData.bot_use_case_brief} onChange={handleInputChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Or Upload Flow Diagram / Word Document</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 py-2 px-4 rounded-md hover:bg-indigo-100 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload Document</span>
                  <input type="file" name="bot_use_case_document" onChange={handleFileChange} className="hidden" accept=".doc,.docx,.pdf,.png,.jpg,.jpeg" />
                </label>
                <span className="text-sm text-gray-500 truncate max-w-xs">
                  {files.bot_use_case_document ? files.bot_use_case_document.name : (existingFiles.bot_use_case_document ? 'Document already uploaded' : 'No file selected')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-indigo-600 py-2.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Save Registration Details'}
          </button>
        </div>

      </form>
    </div>
  );
}
