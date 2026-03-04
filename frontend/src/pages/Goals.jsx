import { useState } from 'react';
import { Save, TrendingUp } from 'lucide-react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();

export default function Goals() {
  const [distributionMode, setDistributionMode] = useState('even');
  const [yearlyTarget, setYearlyTarget] = useState('');

  const evenMonthly = yearlyTarget ? (parseFloat(yearlyTarget) / 12).toFixed(2) : '0.00';

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Goals submitted');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
        <p className="text-slate-500 mt-1">Set your production targets for {currentYear}</p>
      </div>

      {/* Current progress */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500">Year-to-Date Progress</p>
            <p className="text-2xl font-bold text-slate-900">$0 <span className="text-base font-normal text-slate-500">/ $0</span></p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">0%</p>
            <p className="text-sm text-slate-500">of goal</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Goal form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Yearly Target</h2>
          
          <div>
            <label htmlFor="yearly_target" className="label">
              {currentYear} Production Goal *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="yearly_target"
                name="yearly_target"
                className="input pl-7"
                placeholder="500000"
                step="1000"
                min="0"
                value={yearlyTarget}
                onChange={(e) => setYearlyTarget(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Distribution Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="distribution_mode"
                  value="even"
                  checked={distributionMode === 'even'}
                  onChange={(e) => setDistributionMode(e.target.value)}
                  className="w-4 h-4 text-brand-600"
                />
                <span className="text-slate-700">Even distribution</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="distribution_mode"
                  value="custom"
                  checked={distributionMode === 'custom'}
                  onChange={(e) => setDistributionMode(e.target.value)}
                  className="w-4 h-4 text-brand-600"
                />
                <span className="text-slate-700">Custom by month</span>
              </label>
            </div>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Monthly Breakdown</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {months.map((month, index) => (
              <div key={month}>
                <label htmlFor={`month_${index}`} className="label text-sm">
                  {month}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    id={`month_${index}`}
                    className="input pl-7"
                    placeholder={evenMonthly}
                    step="0.01"
                    min="0"
                    disabled={distributionMode === 'even'}
                    defaultValue={distributionMode === 'even' ? evenMonthly : ''}
                  />
                </div>
              </div>
            ))}
          </div>

          {distributionMode === 'even' && (
            <p className="text-sm text-slate-500">
              Each month will be set to ${evenMonthly} based on your yearly target.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="submit" className="btn-primary">
            <Save className="w-5 h-5 mr-2" />
            Save Goals
          </button>
        </div>
      </form>
    </div>
  );
}