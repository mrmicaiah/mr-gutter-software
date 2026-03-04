import { TrendingUp, DollarSign, Briefcase, Target } from 'lucide-react';

// Placeholder stat card component
function StatCard({ icon: Icon, label, value, subtext, color = 'brand' }) {
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtext && (
            <p className="text-sm text-slate-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's your production overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="This Week"
          value="$0"
          subtext="Production"
          color="brand"
        />
        <StatCard
          icon={TrendingUp}
          label="This Month"
          value="$0"
          subtext="Production"
          color="green"
        />
        <StatCard
          icon={Briefcase}
          label="Jobs"
          value="0"
          subtext="This month"
          color="orange"
        />
        <StatCard
          icon={Target}
          label="Goal Progress"
          value="0%"
          subtext="Year to date"
          color="purple"
        />
      </div>

      {/* Placeholder content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart placeholder */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Production Trend</h2>
          <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-slate-400">Chart coming soon</p>
          </div>
        </div>

        {/* Recent jobs placeholder */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Jobs</h2>
          <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-slate-400">No jobs yet</p>
          </div>
        </div>
      </div>

      {/* Zipcode breakdown placeholder */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Production by Zipcode</h2>
        <div className="h-32 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-400">Zipcode breakdown coming soon</p>
        </div>
      </div>
    </div>
  );
}