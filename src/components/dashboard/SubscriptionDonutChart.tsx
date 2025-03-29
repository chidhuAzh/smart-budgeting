'use client';

import { useEffect, useRef } from 'react';

type SubscriptionItem = {
  name: string;
  amount: number;
  color: string;
};

type SubscriptionDonutChartProps = {
  data: SubscriptionItem[];
  total: number;
};

export default function SubscriptionDonutChart({ data, total }: SubscriptionDonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // In a real implementation, you would use a chart library
    // This is a placeholder for demonstration
    
    const container = chartRef.current;
    container.innerHTML = '';
    
    const donutContainer = document.createElement('div');
    donutContainer.className = 'relative w-40 h-40 mx-auto';
    
    // Create a simple donut representation
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    
    let cumulativePercentage = 0;
    data.forEach(item => {
      const percentage = (item.amount / totalAmount) * 100;
      
      const segment = document.createElement('div');
      segment.className = 'absolute inset-0 rounded-full';
      segment.style.background = `conic-gradient(
        transparent ${cumulativePercentage}%, 
        ${item.color} ${cumulativePercentage}%, 
        ${item.color} ${cumulativePercentage + percentage}%, 
        transparent ${cumulativePercentage + percentage}%
      )`;
      donutContainer.appendChild(segment);
      
      cumulativePercentage += percentage;
    });
    
    // Center hole
    const centerHole = document.createElement('div');
    centerHole.className = 'absolute inset-[25%] rounded-full bg-gray-800 flex items-center justify-center';
    
    const totalText = document.createElement('div');
    totalText.className = 'text-lg font-bold';
    totalText.textContent = `₹ ${total}`;
    
    centerHole.appendChild(totalText);
    donutContainer.appendChild(centerHole);
    
    // Legend
    const legend = document.createElement('div');
    legend.className = 'mt-8 grid grid-cols-1 gap-2';
    
    data.forEach(item => {
      const legendItem = document.createElement('div');
      legendItem.className = 'flex items-center';
      
      const colorIndicator = document.createElement('div');
      colorIndicator.className = 'w-3 h-3 rounded-full mr-2';
      colorIndicator.style.backgroundColor = item.color;
      
      const nameText = document.createElement('span');
      nameText.className = 'text-sm text-gray-300';
      nameText.textContent = item.name;
      
      legendItem.appendChild(colorIndicator);
      legendItem.appendChild(nameText);
      
      legend.appendChild(legendItem);
    });
    
    container.appendChild(donutContainer);
    container.appendChild(legend);
  }, [data, total]);

  return (
    <div className="h-full flex flex-col">
      <div ref={chartRef} className="flex-1"></div>
    </div>
  );
}
