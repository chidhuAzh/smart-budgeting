'use client';

import { useEffect, useRef } from 'react';

type ExpenseDataPoint = {
  category: string;
  amount: number;
  color: string;
};

type ExpenseBarChartProps = {
  data: ExpenseDataPoint[];
};

export default function ExpenseBarChart({ data }: ExpenseBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // This is a placeholder for a real chart library
    // In a real implementation, you would use a library like Chart.js,
    // D3.js, or Recharts to render the actual chart
    
    const maxAmount = Math.max(...data.map(item => item.amount));
    const container = chartRef.current;
    container.innerHTML = '';
    
    data.forEach(item => {
      const barContainer = document.createElement('div');
      barContainer.className = 'flex items-end mb-4';
      
      const label = document.createElement('div');
      label.className = 'text-sm text-gray-400 w-20';
      label.textContent = item.category;
      
      const barWrapper = document.createElement('div');
      barWrapper.className = 'flex-1 h-8 relative';
      
      const bar = document.createElement('div');
      const width = (item.amount / maxAmount) * 100;
      bar.className = 'absolute bottom-0 h-8 rounded-sm transition-all duration-500';
      bar.style.width = `${width}%`;
      bar.style.backgroundColor = item.color;
      
      const value = document.createElement('div');
      value.className = 'absolute bottom-0 text-sm text-white ml-2 h-8 flex items-center';
      value.textContent = `₹ ${item.amount.toLocaleString()}`;
      
      barWrapper.appendChild(bar);
      barWrapper.appendChild(value);
      
      barContainer.appendChild(label);
      barContainer.appendChild(barWrapper);
      
      container.appendChild(barContainer);
    });
  }, [data]);

  return (
    <div className="h-full">
      <div ref={chartRef} className="h-full"></div>
    </div>
  );
}
