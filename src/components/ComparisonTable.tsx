import React from 'react';
import { Star, Check, X, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AffiliateButton } from './AffiliateButton';

interface ComparisonTableProps {
  productIds: string[];
  sourceSlug?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ productIds, sourceSlug }) => {
  const { cameras, navigateTo } = useData();
  const comparedCameras = productIds.map((id) => cameras.find((c) => c.id === id)).filter(Boolean) as typeof cameras;

  if (comparedCameras.length === 0) return null;

  return (
    <div className="my-8 overflow-hidden border border-[#EEEBE6] bg-white text-left">
      <div className="p-4 sm:p-5 bg-white border-b border-[#EEEBE6] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold block mb-1">
            Specification Matrix
          </span>
          <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">Side-by-Side Gear Matrix</h4>
          <p className="text-xs text-[#666] mt-0.5">Direct lab & field specification comparison</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1A1A1A] border border-[#EEEBE6] px-3 py-1">
          {comparedCameras.length} Models Tested
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EEEBE6]">
              <th className="p-4 bg-[#FDFCFB] text-[#888] uppercase font-bold text-[10px] tracking-widest w-40 border-r border-[#EEEBE6]">
                Specification
              </th>
              {comparedCameras.map((cam) => (
                <th key={cam.id} className="p-4 min-w-[220px] border-r border-[#EEEBE6] last:border-r-0">
                  <div className="flex flex-col items-start gap-2">
                    <img
                      src={cam.image}
                      alt={cam.name}
                      onClick={() => navigateTo('camera-detail', cam.slug)}
                      className="w-20 h-16 object-cover bg-[#E5E2DD] cursor-pointer hover:opacity-85 transition-opacity"
                    />
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#888]">{cam.brand}</span>
                      <h5 
                        onClick={() => navigateTo('camera-detail', cam.slug)}
                        className="font-serif text-base font-normal text-[#1A1A1A] hover:opacity-75 cursor-pointer transition-opacity"
                      >
                        {cam.name}
                      </h5>
                      <div className="flex items-center gap-1 mt-1 text-[#1A1A1A] font-semibold text-xs">
                        <Star className="w-3 h-3 fill-[#1A1A1A] text-[#1A1A1A]" />
                        <span>{cam.rating.toFixed(1)} / 10</span>
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEEBE6] text-[#444]">
            {/* Price Row */}
            <tr className="bg-[#FDFCFB] font-semibold">
              <td className="p-3.5 pl-4 text-[#1A1A1A] border-r border-[#EEEBE6] uppercase text-[10px] tracking-wider">Authorized Price</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 font-serif text-base text-[#1A1A1A] border-r border-[#EEEBE6] last:border-r-0">
                  ${cam.price.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Sensor */}
            <tr>
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Sensor & Resolution</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 border-r border-[#EEEBE6] last:border-r-0">
                  <div className="font-semibold text-[#1A1A1A]">{cam.specs.megapixels} Megapixels</div>
                  <div className="text-[11px] text-[#666] mt-0.5">{cam.specs.sensor}</div>
                </td>
              ))}
            </tr>

            {/* Format */}
            <tr className="bg-[#FDFCFB]">
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Sensor Size</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 font-medium text-[#1A1A1A] border-r border-[#EEEBE6] last:border-r-0">
                  {cam.specs.sensorFormat}
                </td>
              ))}
            </tr>

            {/* In-Body Stabilization */}
            <tr>
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Stabilization (IBIS)</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 border-r border-[#EEEBE6] last:border-r-0 text-[#1A1A1A]">
                  {cam.specs.ibis}
                </td>
              ))}
            </tr>

            {/* Video Specs */}
            <tr className="bg-[#FDFCFB]">
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Video Recording</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 border-r border-[#EEEBE6] last:border-r-0 text-[#1A1A1A]">
                  {cam.specs.videoSpecs}
                </td>
              ))}
            </tr>

            {/* Continuous Burst */}
            <tr>
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Max Burst Rate</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 border-r border-[#EEEBE6] last:border-r-0 text-[#1A1A1A]">
                  {cam.specs.continuousShooting}
                </td>
              ))}
            </tr>

            {/* Weight */}
            <tr className="bg-[#FDFCFB]">
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Weight (with battery)</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 border-r border-[#EEEBE6] last:border-r-0 text-[#1A1A1A]">
                  {cam.specs.weight}
                </td>
              ))}
            </tr>

            {/* Ideal Use */}
            <tr>
              <td className="p-3.5 pl-4 font-medium text-[#777] border-r border-[#EEEBE6]">Ideal Use Case</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-3.5 italic font-serif text-[#444] border-r border-[#EEEBE6] last:border-r-0">
                  {cam.idealUseCase}
                </td>
              ))}
            </tr>

            {/* Affiliate CTA Row */}
            <tr className="bg-[#FDFCFB]">
              <td className="p-4 pl-4 font-semibold text-[#1A1A1A] border-r border-[#EEEBE6]">Best Price & Deals</td>
              {comparedCameras.map((cam) => (
                <td key={cam.id} className="p-4 border-r border-[#EEEBE6] last:border-r-0">
                  <div className="flex flex-col gap-2">
                    <AffiliateButton
                      productId={cam.id}
                      sourceType="comparison"
                      sourceSlug={sourceSlug}
                      size="sm"
                    />
                    <button
                      onClick={() => navigateTo('camera-detail', cam.slug)}
                      className="text-[10px] uppercase tracking-wider text-[#888] hover:text-black transition-colors text-left font-medium"
                    >
                      Read full {cam.name} review →
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
