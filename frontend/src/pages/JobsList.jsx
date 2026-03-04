import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';

export default function JobsList() {
  return (
    <div className="space-y-6">
      {/* Page header with action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-500 mt-1">Manage your gutter installation jobs</p>
        </div>
        <Link to="/jobs/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Job
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="input pl-10"
          />
        </div>
        <button className="btn-secondary">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Jobs list placeholder */}
      <div className="card">
        <div className="divide-y divide-slate-100">
          {/* Empty state */}
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No jobs yet</h3>
            <p className="text-slate-500 mb-4">Get started by adding your first job</p>
            <Link to="/jobs/new" className="btn-primary inline-flex">
              <Plus className="w-5 h-5 mr-2" />
              Add Job
            </Link>
          </div>

          {/* Example job row (hidden, for reference) */}
          <div className="hidden py-4 flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 cursor-pointer transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">John Smith</p>
              <p className="text-sm text-slate-500">35801 • Mar 1, 2024</p>
            </div>
            <div className="text-right mr-2">
              <p className="font-medium text-slate-900">$2,500</p>
              <p className="text-sm text-emerald-600">$1,100 profit</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}