import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, login, token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    invoicePrefix: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/users/profile');
        setFormData({
          name: res.data.name || '',
          company: res.data.company || '',
          invoicePrefix: res.data.invoicePrefix || 'INV',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await API.put('/users/profile', formData);
      login(token, {
        ...user,
        name: res.data.name,
        company: res.data.company,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (loading) return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <p className="text-slate-500 p-8">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          Profile Settings
        </h2>

        <div className="grid grid-cols-3 gap-6">

          {/* Main form — takes 2 columns */}
          <div className="col-span-2">
            <div className="card p-6">

              {/* Avatar section */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800 dark:text-white m-0">
                    {formData.name}
                  </p>
                  <p className="text-sm text-slate-400 m-0">{user?.email}</p>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-700/60 mb-6" />

              {/* Messages */}
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
                  {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company or business name"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Shown on invoice headers instead of your name
                  </p>
                </div>

                <div>
                  <label className="form-label">Invoice Prefix</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="invoicePrefix"
                      value={formData.invoicePrefix}
                      onChange={handleChange}
                      placeholder="INV"
                      maxLength={5}
                      className="w-28"
                    />
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      Preview: {formData.invoicePrefix || 'INV'}-001
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    e.g. INV, SB, AB
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary mt-2"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

              </form>
            </div>
          </div>

          {/* Account info — takes 1 column */}
          <div className="col-span-1">
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Account Info
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Invoice Prefix</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    {formData.invoicePrefix || 'INV'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Company</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    {formData.company || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Email</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white break-all">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}