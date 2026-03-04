import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted');
    navigate('/jobs');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          to="/jobs"
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Job' : 'Add Job'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Update job details' : 'Enter the job information'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Client Information</h2>
          
          <div>
            <label htmlFor="client_name" className="label">
              Client Name *
            </label>
            <input
              type="text"
              id="client_name"
              name="client_name"
              className="input"
              placeholder="John Smith"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="input"
              placeholder="256-555-1234"
            />
          </div>

          <div>
            <label htmlFor="zipcode" className="label">
              Zipcode *
            </label>
            <input
              type="text"
              id="zipcode"
              name="zipcode"
              className="input"
              placeholder="35801"
              pattern="[0-9]{5}"
              required
            />
          </div>
        </div>

        {/* Job Details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Job Details</h2>
          
          <div>
            <label htmlFor="job_date" className="label">
              Job Date *
            </label>
            <input
              type="date"
              id="job_date"
              name="job_date"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="full_price" className="label">
              Full Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="full_price"
                name="full_price"
                className="input pl-7"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="material_cost" className="label">
              Material Cost *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="material_cost"
                name="material_cost"
                className="input pl-7"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="workers_cost" className="label">
              Workers Cost *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="workers_cost"
                name="workers_cost"
                className="input pl-7"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Calculated profit (placeholder) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Estimated Profit</span>
              <span className="text-xl font-bold text-emerald-600">$0.00</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          {isEditing && (
            <button
              type="button"
              className="btn-secondary text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Job
            </button>
          )}
          <div className="flex-1" />
          <Link to="/jobs" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            <Save className="w-5 h-5 mr-2" />
            {isEditing ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  );
}